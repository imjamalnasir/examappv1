import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useExams } from '@/context/ExamContext'
import { useStudents } from '@/context/StudentContext'
import { useToast } from '@/context/ToastContext'
import { StudentForm } from '@/modules/students/StudentForm'
import { studentToFormValues } from '@/modules/students/studentFormState'
import { examsForStudent } from '@/modules/students/studentRules'
import { StudentNotFound } from '@/pages/students/StudentNotFound'
import type { StudentFormValues } from '@/types/student'

export function StudentEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { students, getById, editStudent } = useStudents()
  const { academics } = useAcademics()
  const { departments } = useDepartments()
  const { courses } = useCourses()
  const { exams } = useExams()
  const student = getById(id)

  if (!student) {
    return <StudentNotFound />
  }

  const enrollmentLocked = examsForStudent(student, exams).length > 0

  const handleSubmit = (values: StudentFormValues) => {
    const updated = editStudent(student.id, values)
    if (!updated) {
      toast.error('Unable to update this student.')
      return
    }
    toast.success(`Student "${updated.name}" updated.`)
    navigate(`/students/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${student.name}`}
        description="Update the student register. Enrollment stays fixed while examinations exist for this semester."
        breadcrumbs={[
          { label: 'Students', path: '/students' },
          { label: student.name, path: `/students/${student.id}` },
          { label: 'Edit' },
        ]}
      />
      <StudentForm
        initialValues={studentToFormValues(student)}
        students={students}
        academics={academics}
        departments={departments}
        courses={courses}
        excludeId={student.id}
        mode="edit"
        enrollmentLocked={enrollmentLocked}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/students/${student.id}`)}
      />
    </div>
  )
}
