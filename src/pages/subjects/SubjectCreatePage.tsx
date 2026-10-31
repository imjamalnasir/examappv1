import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { SubjectForm } from '@/modules/subjects/SubjectForm'
import type { SubjectFormValues } from '@/types/subject'

const emptyValues: SubjectFormValues = {
  name: '',
  code: '',
  departmentId: '',
  courseId: '',
  description: '',
  status: 'Active',
}

export function SubjectCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { subjects, addSubject } = useSubjects()
  const { departments } = useDepartments()
  const { courses } = useCourses()

  const handleSubmit = (values: SubjectFormValues) => {
    const created = addSubject(values)
    toast.success(`Subject "${created.name}" created successfully.`)
    navigate(`/subjects/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Subject"
        description="Create a new subject and link it to a department and course."
        breadcrumbs={[
          { label: 'Subjects', path: '/subjects' },
          { label: 'Add' },
        ]}
      />
      <SubjectForm
        initialValues={emptyValues}
        subjects={subjects}
        departments={departments}
        courses={courses}
        submitLabel="Create Subject"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/subjects')}
      />
    </div>
  )
}
