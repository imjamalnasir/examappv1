import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { TopicForm } from '@/modules/topics/TopicForm'
import type { TopicFormValues } from '@/types/topic'
import { resolveTopicHierarchy } from '@/utils/relationships'

export function TopicEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, editTopic } = useTopics()
  const { departments } = useDepartments()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const topic = getById(id)
  const hierarchy = topic
    ? resolveTopicHierarchy(topic, subjects, courses, departments)
    : undefined

  if (!topic) {
    return (
      <div>
        <PageHeader
          title="Topic Not Found"
          breadcrumbs={[
            { label: 'Topics', path: '/topics' },
            { label: 'Edit' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p>The requested topic does not exist or was deleted.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/topics')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Button>
        </div>
      </div>
    )
  }

  const initialValues: TopicFormValues = {
    departmentId: hierarchy?.department?.id ?? '',
    courseId: hierarchy?.course?.id ?? '',
    subjectId: topic.subjectId,
    name: topic.name,
    description: topic.description,
    displayOrder: String(topic.displayOrder),
    status: topic.status,
  }

  const handleSubmit = (values: TopicFormValues) => {
    const updated = editTopic(topic.id, values)
    if (!updated) {
      toast.error('Unable to update topic.')
      return
    }
    toast.success(`Topic "${updated.name}" updated successfully.`)
    navigate(`/topics/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${topic.name}`}
        description="Update topic information and hierarchy associations."
        breadcrumbs={[
          { label: 'Topics', path: '/topics' },
          { label: topic.name, path: `/topics/${topic.id}` },
          { label: 'Edit' },
        ]}
      />
      <TopicForm
        initialValues={initialValues}
        departments={departments}
        courses={courses}
        subjects={subjects}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/topics/${topic.id}`)}
      />
    </div>
  )
}
