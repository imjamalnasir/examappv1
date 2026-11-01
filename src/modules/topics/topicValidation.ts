import type { Course } from '@/types/course'
import type { Subject } from '@/types/subject'
import type { TopicFormErrors, TopicFormValues } from '@/types/topic'

export function validateTopicForm(
  values: TopicFormValues,
  subjects: Subject[],
  courses: Course[],
): TopicFormErrors {
  const errors: TopicFormErrors = {}

  if (!values.departmentId) {
    errors.departmentId = 'Wing is required.'
  }

  if (!values.courseId) {
    errors.courseId = 'Course is required.'
  } else {
    const course = courses.find((item) => item.id === values.courseId)
    if (!course) {
      errors.courseId = 'Selected course is invalid.'
    } else if (values.departmentId && course.departmentId !== values.departmentId) {
      errors.courseId = 'Selected course must belong to the chosen wing.'
    }
  }

  if (!values.subjectId) {
    errors.subjectId = 'Subject is required.'
  } else {
    const subject = subjects.find((item) => item.id === values.subjectId)
    if (!subject) {
      errors.subjectId = 'Selected subject is invalid.'
    } else if (values.courseId && subject.courseId !== values.courseId) {
      errors.subjectId = 'Selected subject must belong to the chosen course.'
    }
  }

  if (!values.name.trim()) {
    errors.name = 'Topic name is required.'
  }

  if (!values.displayOrder.trim()) {
    errors.displayOrder = 'Display order is required.'
  } else if (!/^\d+$/.test(values.displayOrder.trim())) {
    errors.displayOrder = 'Display order must be a whole number.'
  } else if (Number(values.displayOrder) < 1) {
    errors.displayOrder = 'Display order must be at least 1.'
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}
