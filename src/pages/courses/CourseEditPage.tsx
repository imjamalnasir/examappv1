import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useToast } from '@/context/ToastContext'
import { CourseForm } from '@/modules/courses/CourseForm'
import type { CourseFormValues } from '@/types/course'

export function CourseEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { courses, getById, editCourse } = useCourses()
  const { departments } = useDepartments()
  const course = getById(id)

  if (!course) {
    return (
      <div>
        <PageHeader
          title="Course Not Found"
          breadcrumbs={[
            { label: 'Courses', path: '/courses' },
            { label: 'Edit' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p>The requested course does not exist or was deleted.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/courses')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  const initialValues: CourseFormValues = {
    name: course.name,
    code: course.code,
    departmentId: course.departmentId,
    duration: course.duration,
    description: course.description,
    status: course.status,
  }

  const handleSubmit = (values: CourseFormValues) => {
    const updated = editCourse(course.id, values)
    if (!updated) {
      toast.error('Unable to update course.')
      return
    }
    toast.success(`Course "${updated.name}" updated successfully.`)
    navigate(`/courses/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${course.name}`}
        description="Update course information and wing association."
        breadcrumbs={[
          { label: 'Courses', path: '/courses' },
          { label: course.name, path: `/courses/${course.id}` },
          { label: 'Edit' },
        ]}
      />
      <CourseForm
        initialValues={initialValues}
        courses={courses}
        departments={departments}
        excludeId={course.id}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/courses/${course.id}`)}
      />
    </div>
  )
}
