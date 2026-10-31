import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { formatDateRange } from '@/modules/academics/academicLookups'
import { academicToFormValues } from '@/modules/academics/academicFormState'
import { hasAcademicFormErrors, validateAcademicForm } from '@/modules/academics/academicValidation'
import { SubjectAllocationEditor } from '@/modules/academics/SubjectAllocationEditor'
import { AcademicNotFound } from '@/pages/academics/AcademicNotFound'
import type { AcademicSemester, AcademicSession } from '@/types/academic'
import { formatDate } from '@/utils/format'

export function ManageSemesterSubjectsPage() {
  const { id = '', semesterId = '' } = useParams()
  const { getById } = useAcademics()
  const academic = getById(id)
  const semester = academic?.semesters.find((item) => item.id === semesterId)

  if (!academic) {
    return <AcademicNotFound />
  }

  if (!semester) {
    return <SemesterNotFound academicId={academic.id} academicName={academic.name} />
  }

  return (
    <ManageSubjectsEditor
      key={`${academic.id}-${semester.id}`}
      academic={academic}
      semester={semester}
    />
  )
}

function SemesterNotFound({
  academicId,
  academicName,
}: {
  academicId: string
  academicName: string
}) {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Semester Not Found"
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: academicName, path: `/academics/${academicId}` },
          { label: 'Not Found' },
        ]}
      />
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p>This semester does not exist on the academic session.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate(`/academics/${academicId}`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Academic
        </Button>
      </div>
    </div>
  )
}

function ManageSubjectsEditor({
  academic,
  semester,
}: {
  academic: AcademicSession
  semester: AcademicSemester
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const { academics, editAcademic } = useAcademics()
  const { courses } = useCourses()
  const course = courses.find((item) => item.id === academic.courseId)
  const { subjects } = useSubjects()
  const [subjectIds, setSubjectIds] = useState<string[]>(() => semester.subjects.map((item) => item.subjectId))
  const [subjectError, setSubjectError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSave = () => {
    const values = academicToFormValues(academic)
    const nextValues = {
      ...values,
      semesters: values.semesters.map((item) =>
        item.id === semester.id ? { ...item, subjectIds } : item,
      ),
    }
    const nextErrors = validateAcademicForm(nextValues, academics, subjects, courses, academic.id)
    const allocationError = nextErrors.semesters?.[semester.id]?.subjects

    if (hasAcademicFormErrors(nextErrors)) {
      setSubjectError(allocationError ?? '')
      setFormError(
        allocationError
          ? ''
          : 'Resolve the academic or semester details before saving subject allocations.',
      )
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      const updated = editAcademic(academic.id, nextValues, academic.isDraft)
      setSubmitting(false)
      if (!updated) {
        toast.error('Unable to save subject allocations.')
        return
      }
      const saved = updated.semesters.find((item) => item.id === semester.id)
      setSubjectIds(saved ? saved.subjects.map((item) => item.subjectId) : subjectIds)
      setSubjectError('')
      setFormError('')
      toast.success(`Subjects for "${semester.name}" saved.`)
    }, 300)
  }

  return (
    <div>
      <PageHeader
        title="Manage Subjects"
        description={`Allocate subjects for ${semester.name} in ${academic.name}.`}
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: academic.name, path: `/academics/${academic.id}` },
          { label: 'Semesters', path: `/academics/${academic.id}/semesters` },
          { label: semester.name },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate(`/academics/${academic.id}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Academic
          </Button>
        }
      />

      <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <dl className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Semester</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {semester.name} · #{semester.number}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dates</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDateRange(semester.startDate, semester.endDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Academic</dt>
            <dd className="mt-1 text-sm text-slate-900">{academic.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {course ? (
                <Link to={`/courses/${course.id}`} className="text-sky-700 hover:underline">
                  {course.name}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(academic.createdDate)}</dd>
          </div>
        </dl>

        {formError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <SubjectAllocationEditor
          subjectIds={subjectIds}
          subjects={subjects}
          courseId={academic.courseId}
          error={subjectError}
          onChange={(nextIds) => {
            setSubjectIds(nextIds)
            setSubjectError('')
          }}
        />

        <p className="text-xs text-slate-500">Changes are saved when you click Save Allocations.</p>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled={submitting} onClick={() => navigate(`/academics/${academic.id}`)}>
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSave}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Saving...' : 'Save Allocations'}
          </Button>
        </div>
      </div>
    </div>
  )
}
