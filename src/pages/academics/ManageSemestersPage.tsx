import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { formatDateRange } from '@/modules/academics/academicLookups'
import { academicToFormValues, createEmptySemester } from '@/modules/academics/academicFormState'
import {
  hasAcademicFormErrors,
  semesterHasErrors,
  validateAcademicForm,
} from '@/modules/academics/academicValidation'
import { SemesterCard } from '@/modules/academics/SemesterCard'
import { AcademicNotFound } from '@/pages/academics/AcademicNotFound'
import type { AcademicFormErrors, AcademicSession, SemesterFormValue } from '@/types/academic'

export function ManageSemestersPage() {
  const { id = '' } = useParams()
  const { getById } = useAcademics()
  const academic = getById(id)

  if (!academic) {
    return <AcademicNotFound />
  }

  return <ManageSemestersEditor key={academic.id} academic={academic} />
}

function ManageSemestersEditor({ academic }: { academic: AcademicSession }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { academics, editAcademic } = useAcademics()
  const { courses } = useCourses()
  const course = courses.find((item) => item.id === academic.courseId)
  const { subjects } = useSubjects()
  const [semesters, setSemesters] = useState<SemesterFormValue[]>(
    () => academicToFormValues(academic).semesters,
  )
  const [errors, setErrors] = useState<AcademicFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const updateSemester = (clientId: string, nextSemester: SemesterFormValue) => {
    setSemesters((current) =>
      current.map((semester) => (semester.clientId === clientId ? nextSemester : semester)),
    )
    setErrors((current) => {
      if (!current.semesters?.[clientId]) {
        return current
      }
      const nextSemesters = { ...current.semesters }
      delete nextSemesters[clientId]
      return { ...current, semesters: nextSemesters }
    })
  }

  const handleSave = () => {
    const values = {
      ...academicToFormValues(academic),
      semesters,
    }
    const nextErrors = validateAcademicForm(values, academics, subjects, courses, academic.id)
    if (hasAcademicFormErrors(nextErrors)) {
      setErrors(nextErrors)
      setSemesters((current) =>
        current.map((semester) => ({
          ...semester,
          expanded: semester.expanded || semesterHasErrors(nextErrors.semesters?.[semester.clientId]),
        })),
      )
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      const updated = editAcademic(academic.id, values, academic.isDraft)
      setSubmitting(false)
      if (!updated) {
        toast.error('Unable to save semesters.')
        return
      }
      const openNumbers = new Set(semesters.filter((semester) => semester.expanded).map((semester) => semester.number))
      setSemesters(
        academicToFormValues(updated).semesters.map((semester) => ({
          ...semester,
          expanded: openNumbers.has(semester.number),
        })),
      )
      setErrors({})
      toast.success(`Semesters for "${updated.name}" saved.`)
    }, 300)
  }

  return (
    <div>
      <PageHeader
        title="Manage Semesters"
        description={`Add, edit, or remove semesters for ${academic.name}.`}
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: academic.name, path: `/academics/${academic.id}` },
          { label: 'Semesters' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate(`/academics/${academic.id}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Academic
          </Button>
        }
      />

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{academic.name}</p>
          <p className="mt-1">
            {academic.id} · {course?.name ?? 'No course'} · {formatDateRange(academic.startDate, academic.endDate)}
          </p>
          <p className="mt-1">
            Semester dates must fall within this academic session. Subjects must belong to {course?.name ?? 'its course'}.
          </p>
        </div>

        {hasAcademicFormErrors(errors) ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Please correct the highlighted semester fields before saving.
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setSemesters((current) => [
                ...current,
                createEmptySemester(current, academic.startDate, academic.endDate),
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Add Semester
          </Button>
        </div>

        {semesters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-800">No semesters yet</p>
            <p className="mt-1 text-sm text-slate-500">Add a semester to start allocating subjects.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {semesters.map((semester) => (
              <SemesterCard
                key={semester.clientId}
                semester={semester}
                errors={errors.semesters?.[semester.clientId]}
                subjects={subjects}
                courseId={academic.courseId}
                onChange={(nextSemester) => updateSemester(semester.clientId, nextSemester)}
                onRemove={() =>
                  setSemesters((current) => current.filter((item) => item.clientId !== semester.clientId))
                }
              />
            ))}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled={submitting} onClick={() => navigate(`/academics/${academic.id}`)}>
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSave}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Saving...' : 'Save Semesters'}
          </Button>
        </div>
      </div>
    </div>
  )
}
