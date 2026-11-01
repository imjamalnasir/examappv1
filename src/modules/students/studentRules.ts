import type { Exam } from '@/types/exam'
import type { Student } from '@/types/student'

export function examsForStudent(student: Student, exams: Exam[]): Exam[] {
  return exams.filter(
    (exam) =>
      exam.academicId === student.academicId &&
      exam.courseId === student.courseId &&
      exam.semesterId === student.semesterId,
  )
}

export function studentsForExam(students: Student[], exam: Pick<Exam, 'academicId' | 'courseId' | 'semesterId'>): Student[] {
  return students.filter(
    (student) =>
      student.academicId === exam.academicId &&
      student.courseId === exam.courseId &&
      student.semesterId === exam.semesterId,
  )
}

export type StudentDeletion = 'delete' | 'withdraw' | 'blocked'

export function studentDeletion(student: Student, exams: Exam[]): StudentDeletion {
  if (examsForStudent(student, exams).length === 0) {
    return 'delete'
  }
  return student.status === 'Active' ? 'withdraw' : 'blocked'
}

export function findRosterProblem(students: Student[]): string | null {
  const ids = new Set<string>()
  const rolls = new Set<string>()

  for (const student of students) {
    if (ids.has(student.id)) {
      return `Student ID ${student.id} is duplicated in the register.`
    }
    ids.add(student.id)
    const roll = student.rollNumber.trim().toLowerCase()
    if (rolls.has(roll)) {
      return `Army number ${student.rollNumber} is assigned to more than one student.`
    }
    rolls.add(roll)
  }

  return null
}
