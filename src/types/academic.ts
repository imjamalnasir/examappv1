export type AcademicStatus = 'Upcoming' | 'Active' | 'Completed'

export interface AllocatedSubject {
  subjectId: string
}

export interface AcademicSemester {
  id: string
  name: string
  number: number
  startDate: string
  endDate: string
  description: string
  subjects: AllocatedSubject[]
}

export interface AcademicSession {
  id: string
  name: string
  courseId: string
  startDate: string
  endDate: string
  description: string
  isDraft: boolean
  createdDate: string
  semesters: AcademicSemester[]
}

export interface SemesterFormValue {
  clientId: string
  id?: string
  name: string
  number: string
  startDate: string
  endDate: string
  description: string
  expanded: boolean
  subjectIds: string[]
}

export interface AcademicFormValues {
  name: string
  academicId: string
  courseId: string
  startDate: string
  endDate: string
  description: string
  semesters: SemesterFormValue[]
}

export interface SemesterFormErrors {
  name?: string
  number?: string
  startDate?: string
  endDate?: string
  subjects?: string
}

export interface AcademicFormErrors {
  name?: string
  academicId?: string
  courseId?: string
  startDate?: string
  endDate?: string
  semesters?: Record<string, SemesterFormErrors>
}
