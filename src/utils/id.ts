export function createSequentialId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .map((id) => {
      const match = id.match(new RegExp(`^${prefix}-(\\d+)$`, 'i'))
      return match ? Number(match[1]) : 0
    })
    .filter((value) => value > 0)

  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}
