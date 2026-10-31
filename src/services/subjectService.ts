import type { Subject, SubjectFormValues } from '@/types/subject'
import { createSequentialId } from '@/utils/id'
import { todayDateString } from '@/utils/format'

export function getSubjectById(subjects: Subject[], id: string): Subject | undefined {
  return subjects.find((subject) => subject.id === id)
}

export function isSubjectCodeUnique(
  subjects: Subject[],
  code: string,
  excludeId?: string,
): boolean {
  const normalized = code.trim().toUpperCase()
  return !subjects.some(
    (subject) => subject.code.toUpperCase() === normalized && subject.id !== excludeId,
  )
}

export function createSubject(subjects: Subject[], values: SubjectFormValues): Subject {
  return {
    id: createSequentialId(
      'SUB',
      subjects.map((subject) => subject.id),
    ),
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    courseId: values.courseId,
    description: values.description.trim(),
    status: values.status,
    createdDate: todayDateString(),
  }
}

export function updateSubject(subject: Subject, values: SubjectFormValues): Subject {
  return {
    ...subject,
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    courseId: values.courseId,
    description: values.description.trim(),
    status: values.status,
  }
}
