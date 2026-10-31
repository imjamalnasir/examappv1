import type { EntityStatus } from '@/types/common'

export interface Department {
  id: string
  name: string
  code: string
  description: string
  status: EntityStatus
  createdDate: string
}

export interface DepartmentFormValues {
  name: string
  code: string
  description: string
  status: EntityStatus
}

export type DepartmentFormErrors = Partial<Record<keyof DepartmentFormValues, string>>
