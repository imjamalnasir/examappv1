import type { Course } from '@/types/course'
import type { Subject, SubjectFormErrors, SubjectFormValues } from '@/types/subject'
import { isSubjectCodeUnique } from '@/services/subjectService'

export function validateSubjectForm(
  values: SubjectFormValues,
  subjects: Subject[],
  courses: Course[],
  excludeId?: string,
): SubjectFormErrors {
  const errors: SubjectFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Subject name is required.'
  }

  if (!values.code.trim()) {
    errors.code = 'Subject code is required.'
  } else if (!/^[A-Za-z0-9-]{2,12}$/.test(values.code.trim())) {
    errors.code = 'Use 2–12 letters, numbers, or hyphens.'
  } else if (!isSubjectCodeUnique(subjects, values.code, excludeId)) {
    errors.code = 'Subject code must be unique.'
  }

  if (!values.departmentId) {
    errors.departmentId = 'Department is required.'
  }

  if (!values.courseId) {
    errors.courseId = 'Course is required.'
  } else {
    const course = courses.find((item) => item.id === values.courseId)
    if (!course) {
      errors.courseId = 'Selected course is invalid.'
    } else if (values.departmentId && course.departmentId !== values.departmentId) {
      errors.courseId = 'Selected course must belong to the chosen department.'
    }
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}
