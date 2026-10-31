import type { EntityStatus } from '@/types/common'

export interface Course {
  id: string
  name: string
  code: string
  departmentId: string
  duration: string
  description: string
  status: EntityStatus
  createdDate: string
}

export interface CourseFormValues {
  name: string
  code: string
  departmentId: string
  duration: string
  description: string
  status: EntityStatus
}

export type CourseFormErrors = Partial<Record<keyof CourseFormValues, string>>
