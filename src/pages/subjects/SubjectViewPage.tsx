import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { RelationshipSummary } from '@/components/RelationshipSummary'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/utils/format'
import {
  formatDependencyBlockMessage,
  getSubjectDependencyCounts,
  hasDependencies,
} from '@/utils/relationships'

export function SubjectViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, removeSubject } = useSubjects()
  const { getById: getCourseById } = useCourses()
  const { getById: getDepartmentById } = useDepartments()
  const { topics } = useTopics()
  const subject = getById(id)
  const course = subject ? getCourseById(subject.courseId) : undefined
  const department = course ? getDepartmentById(course.departmentId) : undefined
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dependencyCounts = useMemo(
    () =>
      subject
        ? getSubjectDependencyCounts(subject.id, topics)
        : { courses: 0, subjects: 0, topics: 0 },
    [subject, topics],
  )

  if (!subject) {
    return (
      <div>
        <PageHeader
          title="Subject Not Found"
          breadcrumbs={[
            { label: 'Subjects', path: '/subjects' },
            { label: 'Not Found' },
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

  const requestDelete = () => {
    if (hasDependencies(dependencyCounts)) {
      toast.error(formatDependencyBlockMessage('subject', subject.name, dependencyCounts))
      return
    }
    setConfirmOpen(true)
  }

  const handleDelete = () => {
    removeSubject(subject.id)
    toast.success(`Subject "${subject.name}" deleted.`)
    navigate('/subjects')
  }

  return (
    <div>
      <PageHeader
        title={subject.name}
        description="Complete subject information."
        breadcrumbs={[
          { label: 'Subjects', path: '/subjects' },
          { label: subject.name },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/subjects')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/subjects/${subject.id}/edit`)}>
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
              Subject ID
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{subject.id}</p>
          </div>
          <Badge status={subject.status} />
        </div>

        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subject Name
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{subject.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subject Code
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{subject.code}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Associated Wing
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {department ? (
                <Link
                  to={`/wings/${department.id}`}
                  className="text-sky-700 hover:underline"
                >
                  {department.name}
                </Link>
              ) : (
                'Unknown wing'
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
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">
              {subject.description || 'No description provided.'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="mt-1">
              <Badge status={subject.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created Date
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(subject.createdDate)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Linked Records
            </dt>
            <dd className="mt-2">
              <RelationshipSummary
                items={[{ label: 'topics', value: dependencyCounts.topics }]}
              />
            </dd>
          </div>
        </dl>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-between">
          <Button variant="danger" onClick={requestDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/subjects')}>
              Back
            </Button>
            <Button onClick={() => navigate(`/subjects/${subject.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
