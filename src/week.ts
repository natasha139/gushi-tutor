// School weeks run Monday–Sunday in China Standard Time.
export function currentWeek(now = new Date()) {
  const china = new Date(now.getTime() + 8 * 3600000);
  return weekForDate(china.toISOString().slice(0, 10));
}
export function weekForDate(date: string) {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}
export function shiftWeek(week: string, days: number) {
  const date = new Date(`${week}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
