/** Days in a row up to today (or ending yesterday, if today has no entry yet) from a list of ISO dates. */
export function computeStreak(dates: string[]): number {
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const d of uniqueDates) {
    const entryDate = new Date(`${d}T00:00:00`);
    const diffDays = Math.round((cursor.getTime() - entryDate.getTime()) / 86400000);

    if (diffDays === 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diffDays === 1 && streak === 0) {
      streak++;
      cursor.setTime(entryDate.getTime());
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
