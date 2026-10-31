import type { Department, DepartmentFormValues } from '@/types/department'
import { createSequentialId } from '@/utils/id'
import { todayDateString } from '@/utils/format'

export function getDepartmentById(
  departments: Department[],
  id: string,
): Department | undefined {
  return departments.find((department) => department.id === id)
}

export function isDepartmentCodeUnique(
  departments: Department[],
  code: string,
  excludeId?: string,
): boolean {
  const normalized = code.trim().toUpperCase()
  return !departments.some(
    (department) =>
      department.code.toUpperCase() === normalized && department.id !== excludeId,
  )
}

export function createDepartment(
  departments: Department[],
  values: DepartmentFormValues,
): Department {
  return {
    id: createSequentialId('DEP', departments.map((department) => department.id)),
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description.trim(),
    status: values.status,
    createdDate: todayDateString(),
  }
}

export function updateDepartment(
  department: Department,
  values: DepartmentFormValues,
): Department {
  return {
    ...department,
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description.trim(),
    status: values.status,
  }
}
