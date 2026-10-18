# tiny-outbox

Estudo de caso: [AuthSales, uma base para vários sistemas](https://edumes.dev/casos/authsales/) · Case study: [AuthSales, one foundation for several systems](https://edumes.dev/en/cases/authsales/)

**PT** · Um outbox transacional em um arquivo. A escrita de negócio, a entrada de auditoria, o recibo de idempotência e os eventos publicados vão na **mesma transação**: ou tudo existe, ou nada existe. Uma requisição repetida com a mesma chave recebe a primeira resposta de volta, inclusive quando chegam várias ao mesmo tempo (a chave primária do recibo decide a corrida). Workers entregam os eventos depois, pegando linhas com `FOR UPDATE SKIP LOCKED`, então dois workers nunca pegam o mesmo evento. Uma entrega que falha continua pendente e é tentada de novo mais tarde.

**EN** · A transactional outbox in one file. The business write, its audit entry, its idempotency receipt and the events it publishes share **one transaction**: either all of them exist or none does. A repeated request with the same key gets the first answer back, even when several arrive at once (the receipt's primary key settles the race). Workers deliver the events afterwards, claiming rows with `FOR UPDATE SKIP LOCKED`, so two workers never take the same event. A failed delivery stays pending and is retried later.

Precisa de um Postgres local; a checagem cria um schema temporário e apaga no fim. A conexão usa as variáveis `PG*` de sempre. / Needs a local Postgres; the check creates a throwaway schema and drops it at the end. The connection uses the usual `PG*` variables.

```bash
npm install
npm run check
```

- [outbox.ts](outbox.ts): `schema`, `placeOrder(pool, key, order)` and `drainOnce(pool, handle)`.
- [check.ts](check.ts): atomic write, replay, rollback on failure, a five-way race on one key, two workers delivering each event once, and a failed delivery scheduled for retry.
