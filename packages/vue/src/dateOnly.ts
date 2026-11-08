export type DateOnly = `${string}-${string}-${string}`

export function parseDateOnly(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1]),
    month = Number(match[2]),
    day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function daysInMonth(year: number, month: number) {
  const date = new Date(0)
  date.setFullYear(year, month, 0)
  date.setHours(12, 0, 0, 0)
  return date.getDate()
}

export function toDateOnly(year: number, month: number, day: number): DateOnly {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function dateOnlyWeekday(value: DateOnly) {
  const parts = parseDateOnly(value)!
  const date = new Date(0)
  date.setFullYear(parts.year, parts.month - 1, parts.day)
  date.setHours(12, 0, 0, 0)
  return date.getDay()
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(0)
  date.setFullYear(year, month - 1 + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}
