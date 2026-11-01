import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useStudents } from '@/context/StudentContext'
import { useToast } from '@/context/ToastContext'
import { StudentForm } from '@/modules/students/StudentForm'
import { emptyStudentForm } from '@/modules/students/studentFormState'
import type { StudentFormValues } from '@/types/student'

export function StudentCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [formKey, setFormKey] = useState(0)
  const { students, addStudent } = useStudents()
  const { academics } = useAcademics()
  const { departments } = useDepartments()
  const { courses } = useCourses()

  const initialValues = useMemo(() => {
    if (formKey > 0) {
      return emptyStudentForm
    }
    const academic = academics.find((item) => item.id === searchParams.get('academic'))
    const semesterId = searchParams.get('semester') ?? ''
    const course = courses.find((item) => item.id === academic?.courseId)
    const semesterMatches = academic?.semesters.some((semester) => semester.id === semesterId) ?? false
    if (!academic || !course || !semesterMatches) {
      return emptyStudentForm
    }
    return {
      ...emptyStudentForm,
      academicId: academic.id,
      departmentId: course.departmentId,
      courseId: course.id,
      semesterId,
    }
  }, [academics, courses, formKey, searchParams])

  const save = (values: StudentFormValues) => {
    const created = addStudent(values)
    toast.success(`Student "${created.name}" registered.`)
    return created
  }

  return (
    <div>
      <PageHeader
        title="Add Student"
        description="Register a student and connect the enrollment to an academic session, course, and semester."
        breadcrumbs={[
          { label: 'Students', path: '/students' },
          { label: 'Add' },
        ]}
      />
      <StudentForm
        key={formKey}
        initialValues={initialValues}
        students={students}
        academics={academics}
        departments={departments}
        courses={courses}
        mode="create"
        enrollmentLocked={false}
        onSubmit={(values) => {
          const created = save(values)
          navigate(`/students/${created.id}`)
        }}
        onSaveAnother={(values) => {
          save(values)
          setFormKey((current) => current + 1)
        }}
        onCancel={() => navigate('/students')}
      />
    </div>
  )
}
