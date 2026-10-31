import type { AcademicSemester, AcademicSession } from '@/types/academic'
import { formatDate } from '@/utils/format'

export function formatCredits(credits: number | undefined): string {
  return typeof credits === 'number' ? String(credits) : '—'
}

export function formatDateRange(start: string, end: string): string {
  if (!start && !end) {
    return 'Dates not set'
  }
  if (!start || !end) {
    return 'Incomplete dates'
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}

export function countAllocatedSubjects(academic: Pick<AcademicSession, 'semesters'>): number {
  return academic.semesters.reduce((total, semester) => total + semester.subjects.length, 0)
}

export function countSemesterSubjects(semester: Pick<AcademicSemester, 'subjects'>): number {
  return semester.subjects.length
}
