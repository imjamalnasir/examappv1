import type { Course, CourseFormErrors, CourseFormValues } from '@/types/course'
import { isCourseCodeUnique } from '@/services/courseService'

export function validateCourseForm(
  values: CourseFormValues,
  courses: Course[],
  excludeId?: string,
): CourseFormErrors {
  const errors: CourseFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Course name is required.'
  }

  const code = values.code.trim()
  if (!code) {
    errors.code = 'Course code is required.'
  } else if (code !== '-' && !/^[A-Za-z0-9-]{2,12}$/.test(code)) {
    errors.code = 'Use 2–12 letters, numbers, or hyphens.'
  } else if (!isCourseCodeUnique(courses, code, excludeId)) {
    errors.code = 'Course code must be unique.'
  }

  if (!values.departmentId) {
    errors.departmentId = 'Wing is required.'
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}
