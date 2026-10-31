import type {
  AcademicSemester,
  AcademicSession,
  AcademicStatus,
  AcademicFormValues,
} from '@/types/academic'
import { createSequentialId } from '@/utils/id'
import { todayDateString } from '@/utils/format'

export function getAcademicById(
  academics: AcademicSession[],
  id: string,
): AcademicSession | undefined {
  return academics.find((academic) => academic.id === id)
}

export function getAcademicStatus(
  startDate: string,
  endDate: string,
  today = todayDateString(),
): AcademicStatus {
  if (!startDate || today < startDate) {
    return 'Upcoming'
  }
  if (endDate && today > endDate) {
    return 'Completed'
  }
  return 'Active'
}

export function isAcademicIdUnique(
  academics: AcademicSession[],
  academicId: string,
  excludeId?: string,
): boolean {
  const normalized = academicId.trim().toUpperCase()
  return !academics.some(
    (academic) => academic.id.toUpperCase() === normalized && academic.id !== excludeId,
  )
}

export function suggestAcademicId(academics: AcademicSession[]): string {
  return createSequentialId(
    'ACD',
    academics.map((academic) => academic.id),
  )
}

export function toAcademicSession(
  values: AcademicFormValues,
  meta: { isDraft: boolean; createdDate: string },
): AcademicSession {
  const usedSemesterIds = values.semesters
    .map((semester) => semester.id)
    .filter((id): id is string => Boolean(id))

  const semesters: AcademicSemester[] = values.semesters.map((semester) => {
    let id = semester.id
    if (!id) {
      id = createSequentialId('SEM', usedSemesterIds)
      usedSemesterIds.push(id)
    }

    return {
      id,
      name: semester.name.trim(),
      number: Number(semester.number),
      startDate: semester.startDate,
      endDate: semester.endDate,
      description: semester.description.trim(),
      subjects: semester.subjectIds.map((subjectId) => ({ subjectId })),
    }
  })

  return {
    id: values.academicId.trim().toUpperCase(),
    name: values.name.trim(),
    courseId: values.courseId,
    startDate: values.startDate,
    endDate: values.endDate,
    description: values.description.trim(),
    isDraft: meta.isDraft,
    createdDate: meta.createdDate,
    semesters,
  }
}
