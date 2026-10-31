import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/utils/format'
import { resolveTopicHierarchy } from '@/utils/relationships'

export function TopicViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, removeTopic } = useTopics()
  const { subjects } = useSubjects()
  const { courses } = useCourses()
  const { departments } = useDepartments()

  const topic = getById(id)
  const hierarchy = topic
    ? resolveTopicHierarchy(topic, subjects, courses, departments)
    : undefined
  const subject = hierarchy?.subject
  const course = hierarchy?.course
  const department = hierarchy?.department
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!topic) {
    return (
      <div>
        <PageHeader
          title="Topic Not Found"
          breadcrumbs={[
            { label: 'Topics', path: '/topics' },
            { label: 'Not Found' },
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

  const handleDelete = () => {
    removeTopic(topic.id)
    toast.success(`Topic "${topic.name}" deleted.`)
    navigate('/topics')
  }

  return (
    <div>
      <PageHeader
        title={topic.name}
        description="Complete topic information."
        breadcrumbs={[
          { label: 'Topics', path: '/topics' },
          { label: topic.name },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/topics')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/topics/${topic.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Topic ID
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{topic.id}</p>
          </div>
          <Badge status={topic.status} />
        </div>

        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Topic Name
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{topic.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Display Order
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{topic.displayOrder}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Associated Subject
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {subject ? (
                <Link to={`/subjects/${subject.id}`} className="text-sky-700 hover:underline">
                  {subject.name}
                </Link>
              ) : (
                'Unknown subject'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Associated Course
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {course ? (
                <Link to={`/courses/${course.id}`} className="text-sky-700 hover:underline">
                  {course.name}
                </Link>
              ) : (
                'Unknown course'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Associated Department
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {department ? (
                <Link
                  to={`/departments/${department.id}`}
                  className="text-sky-700 hover:underline"
                >
                  {department.name}
                </Link>
              ) : (
                'Unknown department'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="mt-1">
              <Badge status={topic.status} />
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">
              {topic.description || 'No description provided.'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created Date
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(topic.createdDate)}</dd>
          </div>
        </dl>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-between">
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/topics')}>
              Back
            </Button>
            <Button onClick={() => navigate(`/topics/${topic.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topic.name}"? This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
