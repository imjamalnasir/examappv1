import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { TopicForm } from '@/modules/topics/TopicForm'
import type { TopicFormValues } from '@/types/topic'

const emptyValues: TopicFormValues = {
  departmentId: '',
  courseId: '',
  subjectId: '',
  name: '',
  description: '',
  displayOrder: '1',
  status: 'Active',
}

export function TopicCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { addTopic } = useTopics()
  const { departments } = useDepartments()
  const { courses } = useCourses()
  const { subjects } = useSubjects()

  const handleSubmit = (values: TopicFormValues) => {
    const created = addTopic(values)
    toast.success(`Topic "${created.name}" created successfully.`)
    navigate(`/topics/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Topic"
        description="Create a new topic under a department, course, and subject."
        breadcrumbs={[
          { label: 'Topics', path: '/topics' },
          { label: 'Add' },
        ]}
      />
      <TopicForm
        initialValues={emptyValues}
        departments={departments}
        courses={courses}
        subjects={subjects}
        submitLabel="Create Topic"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/topics')}
      />
    </div>
  )
}
