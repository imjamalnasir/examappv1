import type { Course } from '@/types/course'
import type { Department } from '@/types/department'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'

export function getCoursesByDepartment(courses: Course[], departmentId: string): Course[] {
  return courses.filter((course) => course.departmentId === departmentId)
}

export function getSubjectsByCourse(subjects: Subject[], courseId: string): Subject[] {
  return subjects.filter((subject) => subject.courseId === courseId)
}

export function getSubjectsByDepartment(
  subjects: Subject[],
  courses: Course[],
  departmentId: string,
): Subject[] {
  const courseIds = new Set(
    getCoursesByDepartment(courses, departmentId).map((course) => course.id),
  )
  return subjects.filter((subject) => courseIds.has(subject.courseId))
}

export function getTopicsBySubject(topics: Topic[], subjectId: string): Topic[] {
  return topics.filter((topic) => topic.subjectId === subjectId)
}

export function getTopicsByCourse(
  topics: Topic[],
  subjects: Subject[],
  courseId: string,
): Topic[] {
  const subjectIds = new Set(
    getSubjectsByCourse(subjects, courseId).map((subject) => subject.id),
  )
  return topics.filter((topic) => subjectIds.has(topic.subjectId))
}

export function getTopicsByDepartment(
  topics: Topic[],
  subjects: Subject[],
  courses: Course[],
  departmentId: string,
): Topic[] {
  const subjectIds = new Set(
    getSubjectsByDepartment(subjects, courses, departmentId).map((subject) => subject.id),
  )
  return topics.filter((topic) => subjectIds.has(topic.subjectId))
}

export interface HierarchyLinks {
  subject?: Subject
  course?: Course
  department?: Department
}

export function resolveSubjectHierarchy(
  subject: Subject,
  courses: Course[],
  departments: Department[],
): HierarchyLinks {
  const course = courses.find((item) => item.id === subject.courseId)
  const department = course
    ? departments.find((item) => item.id === course.departmentId)
    : undefined

  return { subject, course, department }
}

export function resolveTopicHierarchy(
  topic: Topic,
  subjects: Subject[],
  courses: Course[],
  departments: Department[],
): HierarchyLinks {
  const subject = subjects.find((item) => item.id === topic.subjectId)
  if (!subject) {
    return {}
  }
  return resolveSubjectHierarchy(subject, courses, departments)
}

export interface DependencyCounts {
  courses: number
  subjects: number
  topics: number
}

export function getDepartmentDependencyCounts(
  departmentId: string,
  courses: Course[],
  subjects: Subject[],
  topics: Topic[],
): DependencyCounts {
  const linkedCourses = getCoursesByDepartment(courses, departmentId)
  const linkedSubjects = getSubjectsByDepartment(subjects, courses, departmentId)
  const linkedTopics = getTopicsByDepartment(topics, subjects, courses, departmentId)

  return {
    courses: linkedCourses.length,
    subjects: linkedSubjects.length,
    topics: linkedTopics.length,
  }
}

export function getCourseDependencyCounts(
  courseId: string,
  subjects: Subject[],
  topics: Topic[],
): DependencyCounts {
  const linkedSubjects = getSubjectsByCourse(subjects, courseId)
  const linkedTopics = getTopicsByCourse(topics, subjects, courseId)

  return {
    courses: 0,
    subjects: linkedSubjects.length,
    topics: linkedTopics.length,
  }
}

export function getSubjectDependencyCounts(subjectId: string, topics: Topic[]): DependencyCounts {
  return {
    courses: 0,
    subjects: 0,
    topics: getTopicsBySubject(topics, subjectId).length,
  }
}

export function hasDependencies(counts: DependencyCounts): boolean {
  return counts.courses > 0 || counts.subjects > 0 || counts.topics > 0
}

export function formatDependencyBlockMessage(
  entityLabel: string,
  entityName: string,
  counts: DependencyCounts,
): string {
  const parts: string[] = []

  if (counts.courses > 0) {
    parts.push(`${counts.courses} course${counts.courses === 1 ? '' : 's'}`)
  }
  if (counts.subjects > 0) {
    parts.push(`${counts.subjects} subject${counts.subjects === 1 ? '' : 's'}`)
  }
  if (counts.topics > 0) {
    parts.push(`${counts.topics} topic${counts.topics === 1 ? '' : 's'}`)
  }

  return `Cannot delete ${entityLabel} "${entityName}" while it has linked ${parts.join(', ')}. Remove related records first.`
}
