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
    errors.name = 'Wing name is required.'
  }

  const code = values.code.trim()
  if (!code) {
    errors.code = 'Wing code is required.'
  } else if (code !== '-' && !/^[A-Za-z0-9-]{2,10}$/.test(code)) {
    errors.code = 'Use 2–10 letters, numbers, or hyphens.'
  } else if (!isDepartmentCodeUnique(departments, code, excludeId)) {
    errors.code = 'Wing code must be unique.'
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}
