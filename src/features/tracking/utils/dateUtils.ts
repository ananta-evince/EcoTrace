/** Returns start of week (Monday). */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns end of week (Sunday). */
export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Returns start of month. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Returns end of month. */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Subtracts weeks from a date. */
export function subWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - weeks * 7);
  return d;
}

/** Subtracts days from a date. */
export function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/** Returns start of day. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns end of day. */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Counts consecutive days with entries ending today. */
export function computeStreak(entryDates: Date[]): number {
  if (entryDates.length === 0) return 0;

  const uniqueDays = new Set(
    entryDates.map((d) => startOfDay(d).toISOString()),
  );
  const sorted = Array.from(uniqueDays).sort().reverse();

  let streak = 0;
  const today = startOfDay(new Date());

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString();

    if (sorted[i] === expectedStr) {
      streak++;
    } else if (i === 0 && sorted[i] !== expectedStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (sorted[0] === yesterday.toISOString()) {
        streak = 1;
        for (let j = 1; j < sorted.length; j++) {
          const exp = new Date(yesterday);
          exp.setDate(exp.getDate() - j);
          if (sorted[j] === exp.toISOString()) streak++;
          else break;
        }
      }
      break;
    } else {
      break;
    }
  }

  return streak;
}
