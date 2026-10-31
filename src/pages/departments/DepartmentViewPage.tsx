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
  getDepartmentDependencyCounts,
  hasDependencies,
} from '@/utils/relationships'

export function DepartmentViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, removeDepartment } = useDepartments()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const { topics } = useTopics()
  const department = getById(id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dependencyCounts = useMemo(
    () =>
      department
        ? getDepartmentDependencyCounts(department.id, courses, subjects, topics)
        : { courses: 0, subjects: 0, topics: 0 },
    [department, courses, subjects, topics],
  )

  if (!department) {
    return (
      <div>
        <PageHeader
          title="Department Not Found"
          breadcrumbs={[
            { label: 'Departments', path: '/departments' },
            { label: 'Not Found' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p>The requested department does not exist or was deleted.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/departments')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Departments
          </Button>
        </div>
      </div>
    )
  }

  const requestDelete = () => {
    if (hasDependencies(dependencyCounts)) {
      toast.error(
        formatDependencyBlockMessage('department', department.name, dependencyCounts),
      )
      return
    }
    setConfirmOpen(true)
  }

  const handleDelete = () => {
    removeDepartment(department.id)
    toast.success(`Department "${department.name}" deleted.`)
    navigate('/departments')
  }

  return (
    <div>
      <PageHeader
        title={department.name}
        description="Complete department information."
        breadcrumbs={[
          { label: 'Departments', path: '/departments' },
          { label: department.name },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/departments')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/departments/${department.id}/edit`)}>
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
              Department ID
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{department.id}</p>
          </div>
          <Badge status={department.status} />
        </div>

        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Department Name
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{department.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Department Code
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{department.code}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">
              {department.description || 'No description provided.'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="mt-1">
              <Badge status={department.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created Date
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(department.createdDate)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Linked Records
            </dt>
            <dd className="mt-2">
              <RelationshipSummary
                items={[
                  { label: 'courses', value: dependencyCounts.courses },
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
            <Button variant="secondary" onClick={() => navigate('/departments')}>
              Back
            </Button>
            <Link to={`/departments/${department.id}/edit`}>
              <Button>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Department"
        message={`Are you sure you want to delete "${department.name}"? This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
