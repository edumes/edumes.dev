// Run: node --test kinds.test.ts   (Node 23.6+ strips the types natively)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { civilDate, instant, isOverdue, localTime, wallClock } from './kinds.ts';

const moment = new Date('2026-08-15T03:00:00.000Z'); // midnight in São Paulo

test('the timestamp-without-zone bug: one moment, two stored values', () => {
  const fromDevMachine = wallClock(moment, 'America/Sao_Paulo');
  const fromContainer = wallClock(moment, 'UTC');
  assert.equal(fromDevMachine, '2026-08-15T00:00:00');
  assert.equal(fromContainer, '2026-08-15T03:00:00');
  // Same instant, three hours apart in the column, and nothing in the row says why.
  const gapHours = (Date.parse(`${fromContainer}Z`) - Date.parse(`${fromDevMachine}Z`)) / 3_600_000;
  assert.equal(gapHours, 3);
});

test('an instant is stored the same way wherever the process runs', () => {
  assert.equal(instant(moment), '2026-08-15T03:00:00.000Z');
});

test('a due date is a civil date, not an instant', () => {
  const due = civilDate('2026-08-15');
  const lateEvening = new Date('2026-08-16T02:30:00.000Z'); // 23:30 on the 15th in São Paulo
  // Comparing against the UTC day says overdue, half an hour before the day actually ends.
  assert.equal(lateEvening.toISOString().slice(0, 10) > due, true);
  assert.equal(isOverdue(due, lateEvening, 'America/Sao_Paulo'), false);
  assert.equal(isOverdue(due, new Date('2026-08-16T03:00:00.000Z'), 'America/Sao_Paulo'), true);
});

test('constructors reject values that are not what they claim', () => {
  assert.throws(() => civilDate('2026-02-30'), RangeError);
  assert.throws(() => civilDate('15/08/2026'), RangeError);
  assert.throws(() => localTime('24:00:00'), RangeError);
  assert.equal(localTime('08:30:00'), '08:30:00');
});
