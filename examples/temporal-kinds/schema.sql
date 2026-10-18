-- Each column declares which kind of time it holds. Example schema, not used by the test.
create table invoice (
  id            bigserial primary key,
  issued_on     date        not null,               -- civil date: the day printed on the document
  due_on        date        not null,               -- civil date: overdue only after this day ends locally
  period        date        not null,               -- civil date: first day of the tax period (2026-08-01)
  created_at    timestamptz not null default now(), -- instant: when the row was written
  sent_at       timestamptz                         -- instant: when the e-mail actually left
);

create table store_hours (
  store_id      bigint      not null,
  weekday       smallint    not null check (weekday between 0 and 6),
  opens_at      time        not null,               -- local time: repeats every week, no date, no zone
  closes_at     time        not null,
  time_zone     text        not null                -- the zone that gives those local times meaning
);

create table appointment (
  id            bigserial primary key,
  starts_local  timestamp   not null,               -- local date-time: what the customer agreed to
  time_zone     text        not null,               -- stored next to it, never implied by the server
  starts_at     timestamptz generated always as (starts_local at time zone time_zone) stored
);
