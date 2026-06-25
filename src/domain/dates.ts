// All household dates are calendar days in the *local* timezone, stored as
// "YYYY-MM-DD". Using toISOString() would convert to UTC and shift the day on
// any non-UTC machine, so we format/parse from local components consistently.

const pad = (n: number) => String(n).padStart(2, '0')

/** Format a Date as a local YYYY-MM-DD calendar string. */
export function toLocalISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Parse a YYYY-MM-DD string as local midnight (not UTC). */
export function parseLocal(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Local midnight today. */
export function todayDate(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const todayISO = (): string => toLocalISO(todayDate())

/** Add (or subtract) whole days to a YYYY-MM-DD string, staying local. */
export function addDaysISO(isoDate: string, days: number): string {
  const d = parseLocal(isoDate)
  d.setDate(d.getDate() + days)
  return toLocalISO(d)
}

/** Today + offset days as a YYYY-MM-DD string. */
export function dayISO(offset: number): string {
  return addDaysISO(todayISO(), offset)
}
