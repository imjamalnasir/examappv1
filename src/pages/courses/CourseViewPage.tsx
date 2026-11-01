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
  getCourseDependencyCounts,
  hasDependencies,
} from '@/utils/relationships'

export function CourseViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, removeCourse } = useCourses()
  const { getById: getDepartmentById } = useDepartments()
  const { subjects } = useSubjects()
  const { topics } = useTopics()
  const course = getById(id)
  const department = course ? getDepartmentById(course.departmentId) : undefined
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dependencyCounts = useMemo(
    () =>
      course
        ? getCourseDependencyCounts(course.id, subjects, topics)
        : { courses: 0, subjects: 0, topics: 0 },
    [course, subjects, topics],
  )

  if (!course) {
    return (
      <div>
        <PageHeader
          title="Course Not Found"
          breadcrumbs={[
            { label: 'Courses', path: '/courses' },
            { label: 'Not Found' },
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

  const requestDelete = () => {
    if (hasDependencies(dependencyCounts)) {
      toast.error(formatDependencyBlockMessage('course', course.name, dependencyCounts))
      return
    }
    setConfirmOpen(true)
  }

  const handleDelete = () => {
    removeCourse(course.id)
    toast.success(`Course "${course.name}" deleted.`)
    navigate('/courses')
  }

  return (
    <div>
      <PageHeader
        title={course.name}
        description="Complete course information."
        breadcrumbs={[
          { label: 'Courses', path: '/courses' },
          { label: course.name },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/courses')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/courses/${course.id}/edit`)}>
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
              Course ID
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{course.id}</p>
          </div>
          <Badge status={course.status} />
        </div>

        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Course Name
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{course.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Course Code
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{course.code}</dd>
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
              Duration
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{course.duration || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">
              {course.description || 'No description provided.'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="mt-1">
              <Badge status={course.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created Date
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(course.createdDate)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Linked Records
            </dt>
            <dd className="mt-2">
              <RelationshipSummary
                items={[
                  { label: 'subjects', value: dependencyCounts.subjects },
                  { label: 'topics', value: dependencyCounts.topics },
                ]}
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
            <Button variant="secondary" onClick={() => navigate('/courses')}>
              Back
            </Button>
            <Button onClick={() => navigate(`/courses/${course.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.name}"? This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
