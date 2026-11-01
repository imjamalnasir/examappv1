import type { EntityStatus } from '@/types/common'

export const STUDENT_RANKS = [
  '-',
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year',
  'Postgraduate',
] as const

export type StudentRank = (typeof STUDENT_RANKS)[number]

export const STUDENT_UNITS = ['Unit A', 'Unit B', 'Unit C', 'Unit D'] as const

export type StudentUnit = (typeof STUDENT_UNITS)[number]

export interface Student {
  id: string
  name: string
  rollNumber: string
  rank: StudentRank
  unit: StudentUnit
  academicId: string
  departmentId: string
  courseId: string
  semesterId: string
  phone: string
  email: string
  address: string
  remarks: string
  status: EntityStatus
  createdDate: string
}

export interface StudentFormValues {
  name: string
  rollNumber: string
  rank: StudentRank | ''
  unit: StudentUnit | ''
  academicId: string
  departmentId: string
  courseId: string
  semesterId: string
  phone: string
  email: string
  address: string
  remarks: string
  status: EntityStatus
}

export type StudentFormErrors = Partial<Record<keyof StudentFormValues, string>>
