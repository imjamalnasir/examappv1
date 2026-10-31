import type { DepartmentFormErrors, DepartmentFormValues } from '@/types/department'
import { isDepartmentCodeUnique } from '@/services/departmentService'
import type { Department } from '@/types/department'

export function validateDepartmentForm(
  values: DepartmentFormValues,
  departments: Department[],
  excludeId?: string,
): DepartmentFormErrors {
  const errors: DepartmentFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Department name is required.'
  }

  if (!values.code.trim()) {
    errors.code = 'Department code is required.'
  } else if (!/^[A-Za-z0-9-]{2,10}$/.test(values.code.trim())) {
    errors.code = 'Use 2–10 letters, numbers, or hyphens.'
  } else if (!isDepartmentCodeUnique(departments, values.code, excludeId)) {
    errors.code = 'Department code must be unique.'
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}
