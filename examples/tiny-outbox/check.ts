// Self-check against a local Postgres. Runs inside a throwaway schema and drops it at the end.
// Connection comes from the usual PG* variables (PGHOST, PGUSER, PGDATABASE...). Run: npm run check
import assert from 'node:assert/strict';
import pg from 'pg';
import { drainOnce, placeOrder, schema } from './outbox.ts';

const name = `tiny_outbox_check_${process.pid}`;
const admin = new pg.Pool({ database: process.env.PGDATABASE ?? 'postgres', max: 1 });
await admin.query(`create schema ${name}`);
const pool = new pg.Pool({ database: process.env.PGDATABASE ?? 'postgres', options: `-c search_path=${name}`, max: 6 });
const count = async (t: string) => Number((await pool.query(`select count(*) from ${t}`)).rows[0].count);

try {
  await pool.query(schema);

  const first = await placeOrder(pool, 'req-1', { customer: 'Cliente Exemplo', total: '150.00' });
  assert.deepEqual([await count('orders'), await count('audit'), await count('outbox')], [1, 1, 1]);
  console.log('ok: order, audit entry and event were written together');

  const again = await placeOrder(pool, 'req-1', { customer: 'Cliente Exemplo', total: '150.00' });
  assert.equal(again.orderId, first.orderId);
  assert.equal(again.replayed, true);
  assert.equal(await count('orders'), 1);
  console.log('ok: a repeated request with the same key gets the first answer back');

  await assert.rejects(placeOrder(pool, 'req-2', { customer: 'Cliente Exemplo', total: '99.00' }, true));
  assert.deepEqual([await count('orders'), await count('audit'), await count('outbox'), await count('idempotency')], [1, 1, 1, 1]);
  console.log('ok: a failure before commit leaves nothing behind');

  const racers = await Promise.all(Array.from({ length: 5 }, () => placeOrder(pool, 'req-3', { customer: 'Corrida', total: '10.00' })));
  assert.equal(new Set(racers.map((r) => r.orderId)).size, 1);
  assert.equal(racers.filter((r) => !r.replayed).length, 1);
  console.log('ok: five concurrent requests with one key create exactly one order');

  for (let i = 0; i < 20; i++) await placeOrder(pool, `bulk-${i}`, { customer: `Cliente ${i}`, total: '1.00' });
  const seen: number[][] = [[], []];
  const worker = async (n: number) => {
    while ((await drainOnce(pool, async (_t, p) => void seen[n].push(p.orderId))) > 0);
  };
  await Promise.all([worker(0), worker(1)]);
  const all = [...seen[0], ...seen[1]];
  assert.equal(all.length, await count('outbox'));
  assert.equal(new Set(all).size, all.length);
  console.log(`ok: two workers delivered ${all.length} events, each exactly once (${seen[0].length} + ${seen[1].length})`);

  await placeOrder(pool, 'fails', { customer: 'Falha', total: '5.00' });
  await drainOnce(pool, async () => {
    throw new Error('mail server down');
  });
  const { rows } = await pool.query(`select attempts, processed_at, last_error, available_at > now() as later from outbox order by id desc limit 1`);
  assert.deepEqual([rows[0].attempts, rows[0].processed_at, rows[0].later], [1, null, true]);
  console.log(`ok: a failed delivery stays pending and is retried later (${rows[0].last_error})`);

  console.log('all checks passed');
} finally {
  await pool.end();
  await admin.query(`drop schema ${name} cascade`);
  await admin.end();
}
