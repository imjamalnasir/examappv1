export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function isAfterDate(later: string, earlier: string): boolean {
  return later > earlier
}

export function isWithinInclusiveRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

export function overlapsYear(start: string, end: string, year: number): boolean {
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  return start <= yearEnd && end >= yearStart
}

export function includesDate(start: string, end: string, date: string): boolean {
  return Boolean(date) && start <= date && end >= date
}
