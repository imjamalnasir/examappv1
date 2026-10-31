import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { RelationshipSummary } from '@/components/RelationshipSummary'
import { AcademicStatusBadge, DraftBadge } from '@/components/ui/AcademicStatusBadge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { countAllocatedSubjects, formatCredits } from '@/modules/academics/academicLookups'
import { AcademicNotFound } from '@/pages/academics/AcademicNotFound'
import { getAcademicStatus } from '@/services/academicService'
import type { AcademicSemester } from '@/types/academic'
import type { Subject } from '@/types/subject'
import { formatDate } from '@/utils/format'

export function AcademicViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, removeAcademic } = useAcademics()
  const { subjects } = useSubjects()
  const { courses } = useCourses()
  const academic = getById(id)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const semesters = useMemo(
    () => (academic ? academic.semesters.slice().sort((left, right) => left.number - right.number) : []),
    [academic],
  )

  if (!academic) {
    return <AcademicNotFound />
  }

  const status = getAcademicStatus(academic.startDate, academic.endDate)
  const totalSubjects = countAllocatedSubjects(academic)
  const selectedCourse = courses.find((course) => course.id === academic.courseId)

  const isExpanded = (semesterId: string, index: number) => {
    if (semesterId in expanded) {
      return expanded[semesterId]
    }
    return index === 0
  }

  const handleDelete = () => {
    removeAcademic(academic.id)
    toast.success(`Academic session "${academic.name}" deleted.`)
    navigate('/academics')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={academic.name}
        description="Academic session overview, semesters, and allocated subjects."
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: academic.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/academics')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Academics
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/academics/${academic.id}/semesters`)}>
              Manage Semesters
            </Button>
            <Button onClick={() => navigate(`/academics/${academic.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit Academic
            </Button>
          </div>
        }
      />

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Academic ID</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{academic.id}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            <AcademicStatusBadge status={status} />
            {academic.isDraft ? <DraftBadge /> : null}
          </div>
        </div>

        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Academic Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{academic.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Academic ID</dt>
            <dd className="mt-1 text-sm text-slate-900">{academic.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {selectedCourse ? (
                <Link to={`/courses/${selectedCourse.id}`} className="text-sky-700 hover:underline">
                  {selectedCourse.name}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(academic.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">End Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(academic.endDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Academic Status</dt>
            <dd className="mt-1">
              <AcademicStatusBadge status={status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(academic.createdDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Semesters</dt>
            <dd className="mt-1 text-sm text-slate-900">{academic.semesters.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Subjects</dt>
            <dd className="mt-1 text-sm text-slate-900">{totalSubjects}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Academic Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">
              {academic.description || 'No description provided.'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Structure</dt>
            <dd className="mt-2">
              <RelationshipSummary
                items={[
                  { label: academic.semesters.length === 1 ? 'semester' : 'semesters', value: academic.semesters.length },
                  { label: totalSubjects === 1 ? 'subject' : 'subjects', value: totalSubjects },
                ]}
              />
            </dd>
          </div>
        </dl>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-between">
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/academics')}>
              Back to Academics
            </Button>
            <Button onClick={() => navigate(`/academics/${academic.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit Academic
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Semester Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Each semester lists subjects from this session’s course.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/academics/${academic.id}/semesters`)}>
            Manage Semesters
          </Button>
        </div>

        {semesters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-800">No semesters yet</p>
            <p className="mt-1 text-sm text-slate-500">Add a semester to start allocating subjects.</p>
          </div>
        ) : (
          semesters.map((semester, index) => (
            <SemesterOverview
              key={semester.id}
              semester={semester}
              open={isExpanded(semester.id, index)}
              onToggle={() =>
                setExpanded((current) => ({
                  ...current,
                  [semester.id]: !isExpanded(semester.id, index),
                }))
              }
              academicId={academic.id}
              subjects={subjects}
            />
          ))
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Academic Session"
        message={`Are you sure you want to delete "${academic.name}"? Semesters and subject allocations in this session will be removed. This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function SemesterOverview({
  semester,
  open,
  onToggle,
  academicId,
  subjects,
}: {
  semester: AcademicSemester
  open: boolean
  onToggle: () => void
  academicId: string
  subjects: Subject[]
}) {
  const navigate = useNavigate()

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${semester.name}`}
        >
          <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-slate-900">{semester.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Semester {semester.number} · {formatDate(semester.startDate)} – {formatDate(semester.endDate)} ·{' '}
            {semester.subjects.length} {semester.subjects.length === 1 ? 'subject' : 'subjects'}
          </p>
        </button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/academics/${academicId}/semesters/${semester.id}`)}
        >
          Manage Subjects
        </Button>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-slate-200 p-4 sm:p-5">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Semester Name</dt>
              <dd className="mt-1 text-sm text-slate-900">{semester.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Semester Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{semester.number}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start Date</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(semester.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">End Date</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(semester.endDate)}</dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700">
                {semester.description || 'No description provided.'}
              </dd>
            </div>
          </dl>

          {semester.subjects.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No subjects allocated to this semester.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Subject Code</th>
                    <th className="px-4 py-3">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {semester.subjects.map((allocation) => {
                    const subject = subjects.find((item) => item.id === allocation.subjectId)
                    return (
                      <tr key={allocation.subjectId}>
                        <td className="min-w-44 px-4 py-3 text-slate-800">
                          {subject ? (
                            <Link
                              to={`/subjects/${subject.id}`}
                              className="font-medium text-sky-700 hover:underline"
                            >
                              {subject.name}
                            </Link>
                          ) : (
                            'Unknown subject'
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {subject?.code ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatCredits(subject?.credits)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </article>
  )
}
