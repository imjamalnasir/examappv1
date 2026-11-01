import type { Student, StudentFormValues } from '@/types/student'

export const emptyStudentForm: StudentFormValues = {
  name: '',
  rollNumber: '',
  rank: '',
  unit: '',
  academicId: '',
  departmentId: '',
  courseId: '',
  semesterId: '',
  phone: '',
  email: '',
  address: '',
  remarks: '',
  status: 'Active',
}

export function studentToFormValues(student: Student): StudentFormValues {
  return {
    name: student.name,
    rollNumber: student.rollNumber,
    rank: student.rank,
    unit: student.unit,
    academicId: student.academicId,
    departmentId: student.departmentId,
    courseId: student.courseId,
    semesterId: student.semesterId,
    phone: student.phone,
    email: student.email,
    address: student.address,
    remarks: student.remarks,
    status: student.status,
  }
}
