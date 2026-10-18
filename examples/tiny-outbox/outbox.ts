// A transactional outbox in one file.
//
// The business write, its audit entry, its idempotency receipt and the events it publishes
// share ONE transaction: either all of them exist or none does. Workers deliver the events
// afterwards, claiming rows with FOR UPDATE SKIP LOCKED so two workers never take the same one.
import type { Pool, PoolClient } from 'pg';

export const schema = `
  create table orders (id bigserial primary key, customer text not null, total numeric(12,2) not null);
  create table audit (id bigserial primary key, entity text not null, entity_id bigint not null, action text not null,
                      data jsonb not null, at timestamptz not null default now());
  create table idempotency (key text primary key, response jsonb not null, at timestamptz not null default now());
  create table outbox (id bigserial primary key, topic text not null, payload jsonb not null,
                       available_at timestamptz not null default now(), processed_at timestamptz,
                       attempts int not null default 0, last_error text);
`;

type Order = { customer: string; total: string };
export type Placed = { orderId: number; replayed: boolean };

async function tx<T>(pool: Pool, work: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('begin');
    const result = await work(c);
    await c.query('commit');
    return result;
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

/** Places an order once per idempotency key. A repeat with the same key gets the first answer back. */
export async function placeOrder(pool: Pool, key: string, order: Order, failBeforeCommit = false): Promise<Placed> {
  try {
    return await tx(pool, async (c) => {
      const seen = await c.query('select response from idempotency where key = $1', [key]);
      if (seen.rowCount) return { ...seen.rows[0].response, replayed: true };

      const { rows } = await c.query('insert into orders (customer, total) values ($1, $2) returning id', [order.customer, order.total]);
      const orderId = Number(rows[0].id);
      await c.query(`insert into audit (entity, entity_id, action, data) values ('order', $1, 'placed', $2)`, [orderId, order]);
      await c.query(`insert into outbox (topic, payload) values ('order.placed', $1)`, [{ orderId, ...order }]);
      if (failBeforeCommit) throw new Error('simulated failure after the writes');
      // The receipt's primary key settles a race: the second request with the same key fails here and rolls back.
      await c.query('insert into idempotency (key, response) values ($1, $2)', [key, { orderId }]);
      return { orderId, replayed: false };
    });
  } catch (e) {
    if ((e as { code?: string }).code !== '23505') throw e;
    const { rows } = await pool.query('select response from idempotency where key = $1', [key]);
    return { ...rows[0].response, replayed: true };
  }
}

/** Claims up to `batch` pending events, hands each to `handle`, and marks it done or schedules a retry. */
export async function drainOnce(pool: Pool, handle: (topic: string, payload: any) => Promise<void>, batch = 5): Promise<number> {
  return tx(pool, async (c) => {
    const { rows } = await c.query(
      `select id, topic, payload, attempts from outbox
        where processed_at is null and available_at <= now()
        order by id limit $1 for update skip locked`,
      [batch]
    );
    for (const row of rows) {
      try {
        await handle(row.topic, row.payload);
        await c.query('update outbox set processed_at = now() where id = $1', [row.id]);
      } catch (e) {
        // ponytail: fixed exponential backoff, no dead-letter table; add one when retries need a ceiling.
        await c.query(
          `update outbox set attempts = attempts + 1, last_error = $2,
                  available_at = now() + make_interval(secs => power(2, attempts))
            where id = $1`,
          [row.id, String(e)]
        );
      }
    }
    return rows.length;
  });
}
