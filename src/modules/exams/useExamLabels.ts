import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { initialTeachers } from '@/mock-data/teachers'
import type { Exam } from '@/types/exam'

export function useExamLabels(exam: Exam) {
  const { academics } = useAcademics()
  const { courses } = useCourses()
  const { departments } = useDepartments()
  const academic = academics.find((item) => item.id === exam.academicId)
  const course = courses.find((item) => item.id === exam.courseId)
  const semester = academic?.semesters.find((item) => item.id === exam.semesterId)
  const teacher = initialTeachers.find((item) => item.id === exam.teacherId)
  const department = departments.find((item) => item.id === teacher?.departmentId)
  const missing: string[] = []

  if (!academic) {
    missing.push('academic session')
  }
  if (!course) {
    missing.push('course')
  }
  if (academic && !semester) {
    missing.push('semester')
  }
  if (!teacher) {
    missing.push('teacher')
  }

  const teacherName = teacher
    ? `${teacher.name}${department ? ` · ${department.name}` : ''}`
    : 'Unknown teacher'

  return {
    academic,
    course,
    semester,
    teacher,
    missing,
    academicName: academic?.name ?? 'Unknown academic',
    courseName: course ? `${course.name} (${course.code})` : 'Unknown course',
    semesterName: semester?.name ?? 'Unknown semester',
    teacherName,
  }
}
