import { useMemo, useRef, useState, type FormEvent } from 'react'
import { ChevronsDownUp, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { createEmptySemester } from '@/modules/academics/academicFormState'
import { formatDateRange } from '@/modules/academics/academicLookups'
import {
  hasAcademicFormErrors,
  semesterHasErrors,
  validateAcademicForm,
} from '@/modules/academics/academicValidation'
import { SemesterCard } from '@/modules/academics/SemesterCard'
import { suggestAcademicId } from '@/services/academicService'
import type { AcademicFormErrors, AcademicFormValues, AcademicSession } from '@/types/academic'
import type { Course } from '@/types/course'
import type { Subject } from '@/types/subject'

interface AcademicFormProps {
  initialValues: AcademicFormValues
  academics: AcademicSession[]
  courses: Course[]
  subjects: Subject[]
  excludeId?: string
  submitLabel: string
  onSubmit: (values: AcademicFormValues, asDraft: boolean) => void
  onCancel: () => void
}

export function AcademicForm({
  initialValues,
  academics,
  courses,
  subjects,
  excludeId,
  submitLabel,
  onSubmit,
  onCancel,
}: AcademicFormProps) {
  const [values, setValues] = useState<AcademicFormValues>(initialValues)
  const [errors, setErrors] = useState<AcademicFormErrors>({})
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const submitting = pendingAction !== null
  const courseOptions = useMemo(
    () =>
      courses
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((course) => ({
          label: `${course.name} (${course.code})`,
          value: course.id,
        })),
    [courses],
  )

  const updateSemester = (clientId: string, nextSemester: AcademicFormValues['semesters'][number]) => {
    setValues((current) => ({
      ...current,
      semesters: current.semesters.map((semester) =>
        semester.clientId === clientId ? nextSemester : semester,
      ),
    }))
    setErrors((current) => {
      if (!current.semesters?.[clientId]) {
        return current
      }
      const nextSemesters = { ...current.semesters }
      delete nextSemesters[clientId]
      return { ...current, semesters: nextSemesters }
    })
  }

  const addSemester = () => {
    setValues((current) => ({
      ...current,
      semesters: [
        ...current.semesters,
        createEmptySemester(current.semesters, current.startDate, current.endDate),
      ],
    }))
  }

  const removeSemester = (clientId: string) => {
    setValues((current) => ({
      ...current,
      semesters: current.semesters.filter((semester) => semester.clientId !== clientId),
    }))
  }

  const setAllExpanded = (expanded: boolean) => {
    setValues((current) => ({
      ...current,
      semesters: current.semesters.map((semester) => ({ ...semester, expanded })),
    }))
  }

  const generateId = () => {
    const nextId = suggestAcademicId(academics.filter((academic) => academic.id !== excludeId))
    setValues((current) => ({ ...current, academicId: nextId }))
    setErrors((current) => ({ ...current, academicId: undefined }))
  }

  const save = (asDraft: boolean) => {
    const nextErrors = validateAcademicForm(values, academics, subjects, courses, excludeId)
    if (hasAcademicFormErrors(nextErrors)) {
      setErrors(nextErrors)
      setValues((current) => ({
        ...current,
        semesters: current.semesters.map((semester) => ({
          ...semester,
          expanded: semester.expanded || semesterHasErrors(nextErrors.semesters?.[semester.clientId]),
        })),
      }))
      window.setTimeout(() => {
        alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }

    setErrors({})
    setPendingAction(asDraft ? 'draft' : 'publish')
    window.setTimeout(() => {
      onSubmit(values, asDraft)
    }, 300)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submitting) {
      save(false)
    }
  }

  const showAlert = hasAcademicFormErrors(errors)
  const academicRangeReady = values.endDate > values.startDate && Boolean(values.startDate)
  const dateHint = academicRangeReady
    ? `Semester dates must fall within ${formatDateRange(values.startDate, values.endDate)}.`
    : 'Set a valid academic date range before confirming semester dates.'

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="space-y-8 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      {showAlert ? (
        <div
          ref={alertRef}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Please correct the highlighted fields before continuing.
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Academic Information</h2>
          <p className="mt-1 text-sm text-slate-500">Name the session and set the dates it covers.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Academic Name"
            name="name"
            required
            value={values.name}
            error={errors.name}
            placeholder="e.g. Academic Year 2026–2027"
            onChange={(event) => {
              setValues((current) => ({ ...current, name: event.target.value }))
              setErrors((current) => ({ ...current, name: undefined }))
            }}
          />
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Input
                label="Academic ID"
                name="academicId"
                required
                value={values.academicId}
                error={errors.academicId}
                placeholder="e.g. ACD-008"
                hint="Must be unique. Generate one or type your own."
                onChange={(event) => {
                  setValues((current) => ({ ...current, academicId: event.target.value.toUpperCase() }))
                  setErrors((current) => ({ ...current, academicId: undefined }))
                }}
              />
            </div>
            <Button type="button" variant="secondary" className="mt-7 shrink-0" onClick={generateId}>
              Generate
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Course"
              name="courseId"
              required
              options={courseOptions}
              value={values.courseId}
              error={errors.courseId}
              placeholder="Select a course"
              onChange={(event) => {
                const courseId = event.target.value
                setValues((current) => ({
                  ...current,
                  courseId,
                  semesters: current.semesters.map((semester) => ({
                    ...semester,
                    subjectIds: semester.subjectIds.filter((subjectId) =>
                      subjects.some(
                        (subject) => subject.id === subjectId && subject.courseId === courseId,
                      ),
                    ),
                  })),
                }))
                setErrors((current) => ({ ...current, courseId: undefined }))
              }}
            />
          </div>
          <p className="text-xs text-slate-500">
            An academic session belongs to one course. Semesters can only include subjects from that course.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            required
            value={values.startDate}
            error={errors.startDate}
            onChange={(event) => {
              setValues((current) => ({ ...current, startDate: event.target.value }))
              setErrors((current) => ({ ...current, startDate: undefined }))
            }}
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            required
            value={values.endDate}
            error={errors.endDate}
            onChange={(event) => {
              setValues((current) => ({ ...current, endDate: event.target.value }))
              setErrors((current) => ({ ...current, endDate: undefined }))
            }}
          />
        </div>

        <Textarea
          label="Academic Description"
          name="description"
          value={values.description}
          placeholder="Optional summary of this academic session"
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
        />
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Semester Management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the semesters that belong to this academic session. {dateHint}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {values.semesters.length > 1 ? (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => setAllExpanded(true)}>
                  <ChevronsUpDown className="h-4 w-4" />
                  Expand all
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setAllExpanded(false)}>
                  <ChevronsDownUp className="h-4 w-4" />
                  Collapse all
                </Button>
              </>
            ) : null}
            <Button type="button" variant="secondary" onClick={addSemester}>
              <Plus className="h-4 w-4" />
              Add Semester
            </Button>
          </div>
        </div>

        {values.semesters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-800">No semesters yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a semester to start allocating subjects.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {values.semesters.map((semester) => (
              <SemesterCard
                key={semester.clientId}
                semester={semester}
                errors={errors.semesters?.[semester.clientId]}
                subjects={subjects}
                courseId={values.courseId}
                onChange={(nextSemester) => updateSemester(semester.clientId, nextSemester)}
                onRemove={() => removeSemester(semester.clientId)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <p className="mr-auto hidden text-xs text-slate-500 sm:block">
          Save as Draft keeps the session unpublished. {submitLabel} publishes it.
        </p>
        <Button type="button" variant="secondary" disabled={submitting} onClick={() => save(true)}>
          {pendingAction === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pendingAction === 'draft' ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {pendingAction === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pendingAction === 'publish' ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
