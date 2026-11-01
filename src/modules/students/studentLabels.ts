import type { SelectOption } from '@/types/common'
import { STUDENT_RANKS, STUDENT_UNITS, type StudentRank } from '@/types/student'

export const STUDENT_RANK_OPTIONS: SelectOption[] = STUDENT_RANKS.map((rank) => ({
  label: rank,
  value: rank,
}))

export const STUDENT_UNIT_OPTIONS: SelectOption[] = STUDENT_UNITS.map((unit) => ({
  label: unit,
  value: unit,
}))

export const STUDENT_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

const rankOrder = new Map<StudentRank, number>(STUDENT_RANKS.map((rank, index) => [rank, index]))

export function compareStudentRanks(left: StudentRank, right: StudentRank): number {
  return (rankOrder.get(left) ?? 0) - (rankOrder.get(right) ?? 0)
}
