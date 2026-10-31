import type { EntityStatus } from '@/types/common'

export interface Topic {
  id: string
  name: string
  subjectId: string
  description: string
  displayOrder: number
  status: EntityStatus
  createdDate: string
}

export interface TopicFormValues {
  departmentId: string
  courseId: string
  subjectId: string
  name: string
  description: string
  displayOrder: string
  status: EntityStatus
}

export type TopicFormErrors = Partial<Record<keyof TopicFormValues, string>>
