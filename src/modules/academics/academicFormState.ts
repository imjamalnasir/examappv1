import type { AcademicFormValues, AcademicSession, SemesterFormValue } from '@/types/academic'

export const emptyAcademicForm: AcademicFormValues = {
  name: '',
  academicId: '',
  courseId: '',
  startDate: '',
  endDate: '',
  description: '',
  semesters: [],
}

export function createClientId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function nextSemesterNumber(semesters: SemesterFormValue[]): number {
  const numbers = semesters
    .map((semester) => Number(semester.number))
    .filter((value) => Number.isInteger(value) && value > 0)

  return (numbers.length > 0 ? Math.max(...numbers) : 0) + 1
}

export function createEmptySemester(
  semesters: SemesterFormValue[],
  academicStart: string,
  academicEnd: string,
): SemesterFormValue {
  const number = nextSemesterNumber(semesters)

  return {
    clientId: createClientId('sem'),
    name: `Semester ${number}`,
    number: String(number),
    startDate: academicStart,
    endDate: academicEnd,
    description: '',
    expanded: true,
    subjectIds: [],
  }
}

export function academicToFormValues(academic: AcademicSession): AcademicFormValues {
  const semesters = academic.semesters
    .slice()
    .sort((left, right) => left.number - right.number)
    .map((semester, index) => ({
      clientId: semester.id,
      id: semester.id,
      name: semester.name,
      number: String(semester.number),
      startDate: semester.startDate,
      endDate: semester.endDate,
      description: semester.description,
      expanded: index === 0,
      subjectIds: semester.subjects.map((item) => item.subjectId),
    }))

  return {
    name: academic.name,
    academicId: academic.id,
    courseId: academic.courseId,
    startDate: academic.startDate,
    endDate: academic.endDate,
    description: academic.description,
    semesters,
  }
}
