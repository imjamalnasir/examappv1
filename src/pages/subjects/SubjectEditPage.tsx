import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { SubjectForm } from '@/modules/subjects/SubjectForm'
import type { SubjectFormValues } from '@/types/subject'

export function SubjectEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { subjects, getById, editSubject } = useSubjects()
  const { departments } = useDepartments()
  const { courses, getById: getCourseById } = useCourses()
  const subject = getById(id)
  const linkedCourse = subject ? getCourseById(subject.courseId) : undefined

  if (!subject) {
    return (
      <div>
        <PageHeader
          title="Subject Not Found"
          breadcrumbs={[
            { label: 'Subjects', path: '/subjects' },
            { label: 'Edit' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p>The requested subject does not exist or was deleted.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/subjects')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Subjects
          </Button>
        </div>
      </div>
    )
  }

  const initialValues: SubjectFormValues = {
    name: subject.name,
    code: subject.code,
    departmentId: linkedCourse?.departmentId ?? '',
    courseId: subject.courseId,
    description: subject.description,
    status: subject.status,
  }

  const handleSubmit = (values: SubjectFormValues) => {
    const updated = editSubject(subject.id, values)
    if (!updated) {
      toast.error('Unable to update subject.')
      return
    }
    toast.success(`Subject "${updated.name}" updated successfully.`)
    navigate(`/subjects/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${subject.name}`}
        description="Update subject information and associations."
        breadcrumbs={[
          { label: 'Subjects', path: '/subjects' },
          { label: subject.name, path: `/subjects/${subject.id}` },
          { label: 'Edit' },
        ]}
      />
      <SubjectForm
        initialValues={initialValues}
        subjects={subjects}
        departments={departments}
        courses={courses}
        excludeId={subject.id}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/subjects/${subject.id}`)}
      />
    </div>
  )
}
