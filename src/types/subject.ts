import type { EntityStatus } from '@/types/common'

export interface Subject {
  id: string
  name: string
  code: string
  courseId: string
  credits?: number
  description: string
  status: EntityStatus
  createdDate: string
}

export interface SubjectFormValues {
  name: string
  code: string
  departmentId: string
  courseId: string
  description: string
  status: EntityStatus
}

export type SubjectFormErrors = Partial<Record<keyof SubjectFormValues, string>>
