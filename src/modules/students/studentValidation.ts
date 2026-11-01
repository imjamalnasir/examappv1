import type { AcademicSession } from '@/types/academic'
import type { Course } from '@/types/course'
import type { Department } from '@/types/department'
import {
  STUDENT_RANKS,
  STUDENT_UNITS,
  type Student,
  type StudentFormErrors,
  type StudentFormValues,
  type StudentRank,
  type StudentUnit,
} from '@/types/student'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isStudentRank(value: string): value is StudentRank {
  return (STUDENT_RANKS as readonly string[]).includes(value)
}

export function isStudentUnit(value: string): value is StudentUnit {
  return (STUDENT_UNITS as readonly string[]).includes(value)
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!/^\+?[0-9][0-9\s().-]{6,20}$/.test(trimmed)) {
    return false
  }
  const digits = trimmed.replace(/\D/g, '').length
  return digits >= 7 && digits <= 15
}

export function isRollNumberUnique(
  students: Student[],
  rollNumber: string,
  excludeId?: string,
): boolean {
  const normalized = rollNumber.trim().toLowerCase()
  return !students.some(
    (student) => student.rollNumber.trim().toLowerCase() === normalized && student.id !== excludeId,
  )
}

export function validateStudentForm(
  values: StudentFormValues,
  students: Student[],
  academics: AcademicSession[],
  departments: Department[],
  courses: Course[],
  excludeId?: string,
): StudentFormErrors {
  const errors: StudentFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Enter the student name.'
  } else if (name.length < 2) {
    errors.name = 'Enter at least 2 characters.'
  } else if (name.length > 80) {
    errors.name = 'Use 80 characters or fewer.'
  }

  const rollNumber = values.rollNumber.trim()
  if (!rollNumber) {
    errors.rollNumber = 'Enter an army number.'
  } else if (!/^[A-Za-z0-9][A-Za-z0-9/-]{1,19}$/.test(rollNumber)) {
    errors.rollNumber = 'Use 2–20 letters, numbers, or dashes.'
  } else if (!isRollNumberUnique(students, rollNumber, excludeId)) {
    errors.rollNumber = 'This army number is already assigned.'
  }

  if (!isStudentRank(values.rank)) {
    errors.rank = 'Select a rank.'
  }
  if (!isStudentUnit(values.unit)) {
    errors.unit = 'Select a unit.'
  }

  const academic = academics.find((item) => item.id === values.academicId)
  if (!values.academicId || !academic) {
    errors.academicId = 'Select an academic session.'
  }

  const department = departments.find((item) => item.id === values.departmentId)
  if (!values.departmentId || !department) {
    errors.departmentId = 'Select a wing.'
  }

  const course = courses.find((item) => item.id === values.courseId)
  if (!values.courseId || !course) {
    errors.courseId = 'Select a course.'
  } else if (department && course.departmentId !== department.id) {
    errors.courseId = 'Choose a course offered by the selected wing.'
  } else if (academic && academic.courseId !== course.id) {
    errors.courseId = 'Choose the course linked to the selected academic session.'
  }

  if (!values.semesterId || !academic?.semesters.some((semester) => semester.id === values.semesterId)) {
    errors.semesterId = 'Select a semester from the academic session.'
  }

  const phone = values.phone.trim()
  if (!phone) {
    errors.phone = 'Enter a contact number.'
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Enter a valid phone number, including the area code.'
  }

  const email = values.email.trim()
  if (!email) {
    errors.email = 'Enter an email address.'
  } else if (email.length > 120 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.address.trim().length > 300) {
    errors.address = 'Use 300 characters or fewer.'
  }
  if (values.remarks.trim().length > 500) {
    errors.remarks = 'Use 500 characters or fewer.'
  }
  if (values.status !== 'Active' && values.status !== 'Inactive') {
    errors.status = 'Select a status.'
  }

  return errors
}

export function hasStudentFormErrors(errors: StudentFormErrors): boolean {
  return Object.values(errors).some(Boolean)
}
