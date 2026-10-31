import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useToast } from '@/context/ToastContext'
import { CourseForm } from '@/modules/courses/CourseForm'
import type { CourseFormValues } from '@/types/course'

const emptyValues: CourseFormValues = {
  name: '',
  code: '',
  departmentId: '',
  duration: '',
  description: '',
  status: 'Active',
}

export function CourseCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { courses, addCourse } = useCourses()
  const { departments } = useDepartments()

  const handleSubmit = (values: CourseFormValues) => {
    const created = addCourse(values)
    toast.success(`Course "${created.name}" created successfully.`)
    navigate(`/courses/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Course"
        description="Create a new course and link it to a department."
        breadcrumbs={[
          { label: 'Courses', path: '/courses' },
          { label: 'Add' },
        ]}
      />
      <CourseForm
        initialValues={emptyValues}
        courses={courses}
        departments={departments}
        submitLabel="Create Course"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/courses')}
      />
    </div>
  )
}
