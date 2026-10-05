export const WEEKLY_PLAN_SCHEMA = `CREATE TABLE IF NOT EXISTS weekly_plans (
  week_start TEXT PRIMARY KEY,
  poem_ids TEXT NOT NULL DEFAULT '[]'
)`;
export function validWeek(week) {
  if (typeof week !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(week)) return false;
  const date = new Date(`${week}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === week && date.getUTCDay() === 1;
}
export function validPoemIds(ids) {
  return Array.isArray(ids) && ids.length <= 200 && ids.every(id => Number.isSafeInteger(id) && id > 0) && new Set(ids).size === ids.length;
}
