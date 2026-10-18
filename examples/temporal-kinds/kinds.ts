// Four kinds of time. A date/time value only means something once someone declares which
// kind it is, so every column picks one:
//
//   instant          a point on the timeline        timestamptz   2026-08-15T03:00:00.000Z
//   civil date       a day the parties agreed on    date          2026-08-15
//   local time       a time of day that repeats     time          08:30:00
//   local date-time  a clock reading with no zone   timestamp     2026-08-15T08:30:00
//
// "A date is a day the business agreed on; timestamptz is a moment that happened."
// Due dates, tax periods and birthdays are civil dates. created_at, sent_at, job leases
// and audit stamps are instants.

export type Instant = string & { readonly kind: 'instant' };
export type CivilDate = string & { readonly kind: 'civil-date' };
export type LocalTime = string & { readonly kind: 'local-time' };
export type LocalDateTime = string & { readonly kind: 'local-date-time' };

export const instant = (d: Date): Instant => d.toISOString() as Instant;

export function civilDate(s: string): CivilDate {
  const d = new Date(`${s}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) {
    throw new RangeError(`not a calendar day: ${s}`);
  }
  return s as CivilDate;
}

export function localTime(s: string): LocalTime {
  if (!/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(s)) throw new RangeError(`not a time of day: ${s}`);
  return s as LocalTime;
}

/** Which calendar day it is at this instant, for someone in this time zone. */
export const civilDateIn = (d: Date, timeZone: string): CivilDate =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d) as CivilDate;

/** A due date is a civil date: it is overdue only once that day has ended where the business is. */
export const isOverdue = (due: CivilDate, now: Date, timeZone: string): boolean => civilDateIn(now, timeZone) > due;

/**
 * What a database driver writes when a JS Date goes into a `timestamp` (no zone) column:
 * the wall clock of whatever time zone the process runs in. The zone itself is lost.
 */
export const wallClock = (d: Date, processTimeZone: string): LocalDateTime =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: processTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  })
    .format(d)
    .replace(' ', 'T') as LocalDateTime;
