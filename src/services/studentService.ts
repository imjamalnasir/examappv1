import type { Student, StudentFormValues } from '@/types/student'
import { todayDateString } from '@/utils/format'
import { createSequentialId } from '@/utils/id'
import { isStudentRank, isStudentUnit } from '@/modules/students/studentValidation'

export function getStudentById(students: Student[], id: string): Student | undefined {
  return students.find((student) => student.id === id)
}

function toStudentFields(values: StudentFormValues) {
  if (!isStudentRank(values.rank) || !isStudentUnit(values.unit)) {
    throw new Error('Student rank and unit are required.')
  }

  return {
    name: values.name.trim(),
    rollNumber: values.rollNumber.trim(),
    rank: values.rank,
    unit: values.unit,
    academicId: values.academicId,
    departmentId: values.departmentId,
    courseId: values.courseId,
    semesterId: values.semesterId,
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    remarks: values.remarks.trim(),
    status: values.status,
  }
}

export function createStudent(students: Student[], values: StudentFormValues): Student {
  return {
    id: createSequentialId(
      'STU',
      students.map((student) => student.id),
    ),
    ...toStudentFields(values),
    createdDate: todayDateString(),
  }
}

export function updateStudent(student: Student, values: StudentFormValues): Student {
  return {
    ...student,
    ...toStudentFields(values),
  }
}

export function withdrawStudent(student: Student): Student {
  if (student.status === 'Inactive') {
    return student
  }
  const note = 'Withdrawn so examination records stay intact.'
  const remarks = student.remarks.trim()
  return {
    ...student,
    status: 'Inactive',
    remarks: remarks.includes(note) ? remarks : remarks ? `${remarks} ${note}` : note,
  }
}
