import type { Course, CourseFormValues } from '@/types/course'
import { createSequentialId } from '@/utils/id'
import { todayDateString } from '@/utils/format'

export function getCourseById(courses: Course[], id: string): Course | undefined {
  return courses.find((course) => course.id === id)
}

export function isCourseCodeUnique(
  courses: Course[],
  code: string,
  excludeId?: string,
): boolean {
  const normalized = code.trim().toUpperCase()
  if (normalized === '-') {
    return true
  }
  return !courses.some(
    (course) => course.code.toUpperCase() === normalized && course.id !== excludeId,
  )
}

export function createCourse(courses: Course[], values: CourseFormValues): Course {
  return {
    id: createSequentialId(
      'CRS',
      courses.map((course) => course.id),
    ),
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    departmentId: values.departmentId,
    duration: values.duration.trim(),
    description: values.description.trim(),
    status: values.status,
    createdDate: todayDateString(),
  }
}

export function updateCourse(course: Course, values: CourseFormValues): Course {
  return {
    ...course,
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    departmentId: values.departmentId,
    duration: values.duration.trim(),
    description: values.description.trim(),
    status: values.status,
  }
}
