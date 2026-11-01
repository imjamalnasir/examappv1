import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { formatDateRange } from '@/modules/academics/academicLookups'
import { EXAM_TYPE_OPTIONS } from '@/modules/exams/examLabels'
import { QuestionConfigFields } from '@/modules/exams/QuestionConfigFields'
import { hasExamFormErrors, validateExamForm } from '@/modules/exams/examValidation'
import type { AcademicSession } from '@/types/academic'
import type { Course } from '@/types/course'
import type { Department } from '@/types/department'
import type { ExamFormErrors, ExamFormValues } from '@/types/exam'
import type { Teacher } from '@/types/teacher'

interface ExamFormProps {
  initialValues: ExamFormValues
  academics: AcademicSession[]
  courses: Course[]
  teachers: Teacher[]
  departments: Department[]
  submitLabel: string
  allowDraft: boolean
  onSubmit: (values: ExamFormValues, asDraft: boolean) => void
  onCancel: () => void
}

export function ExamForm({
  initialValues,
  academics,
  courses,
  teachers,
  departments,
  submitLabel,
  allowDraft,
  onSubmit,
  onCancel,
}: ExamFormProps) {
  const [values, setValues] = useState<ExamFormValues>(initialValues)
  const [errors, setErrors] = useState<ExamFormErrors>({})
  const [pendingAction, setPendingAction] = useState<'draft' | 'continue' | null>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const submitting = pendingAction !== null

  const academicOptions = useMemo(
    () =>
      academics
        .slice()
        .sort((left, right) => right.startDate.localeCompare(left.startDate))
        .map((academic) => ({
          label: academic.isDraft ? `${academic.name} (Draft)` : academic.name,
          value: academic.id,
        })),
    [academics],
  )

  const selectedAcademic = academics.find((academic) => academic.id === values.academicId)
  const courseOptions = useMemo(() => {
    if (!selectedAcademic) {
      return []
    }
    return courses
      .filter((course) => course.id === selectedAcademic.courseId)
      .map((course) => ({ label: `${course.name} (${course.code})`, value: course.id }))
  }, [courses, selectedAcademic])

  const semesterOptions = useMemo(() => {
    if (!selectedAcademic) {
      return []
    }
    return selectedAcademic.semesters
      .slice()
      .sort((left, right) => left.number - right.number)
      .map((semester) => ({
        label: `${semester.name} · ${formatDateRange(semester.startDate, semester.endDate)}`,
        value: semester.id,
      }))
  }, [selectedAcademic])

  const teacherOptions = useMemo(
    () =>
      teachers
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((teacher) => {
          const department = departments.find((item) => item.id === teacher.departmentId)
          const suffix = department ? ` · ${department.name}` : ''
          return { label: `${teacher.name}${suffix}`, value: teacher.id }
        }),
    [departments, teachers],
  )

  const selectedSemester = selectedAcademic?.semesters.find((semester) => semester.id === values.semesterId)
  const dateOutside =
    selectedSemester &&
    values.examDate &&
    (values.examDate < selectedSemester.startDate || values.examDate > selectedSemester.endDate)

  const update = (field: keyof ExamFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, questionConfig: undefined }))
  }

  const handleAcademic = (academicId: string) => {
    const academic = academics.find((item) => item.id === academicId)
    const nextSemester =
      academic?.semesters.length === 1
        ? academic.semesters[0].id
        : academic?.semesters.some((semester) => semester.id === values.semesterId)
          ? values.semesterId
          : ''
    setValues((current) => ({
      ...current,
      academicId,
      courseId: academic?.courseId ?? '',
      semesterId: nextSemester,
    }))
    setErrors((current) => ({
      ...current,
      academicId: undefined,
      courseId: undefined,
      semesterId: undefined,
    }))
  }

  const save = (asDraft: boolean) => {
    const nextErrors = validateExamForm(values, academics, courses, teachers)
    if (hasExamFormErrors(nextErrors)) {
      setErrors(nextErrors)
      window.setTimeout(() => {
        alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }
    setErrors({})
    setPendingAction(asDraft ? 'draft' : 'continue')
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

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="space-y-8 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      {hasExamFormErrors(errors) ? (
        <div
          ref={alertRef}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Please correct the highlighted fields before continuing.
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Basic Examination Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Link the paper to an academic session, course, and semester. A new exam starts as Initiated.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SearchableSelect
            label="Academic"
            name="academicId"
            required
            options={academicOptions}
            value={values.academicId}
            error={errors.academicId}
            placeholder="Select an academic session"
            emptyMessage="No academic sessions found."
            onChange={handleAcademic}
          />
          <SearchableSelect
            label="Course"
            name="courseId"
            required
            options={courseOptions}
            value={values.courseId}
            error={errors.courseId}
            placeholder={selectedAcademic ? 'Select a course' : 'Select an academic session first'}
            disabled={!selectedAcademic}
            emptyMessage="This academic session has no linked course."
            onChange={(courseId) => update('courseId', courseId)}
          />
          <Select
            label="Semester"
            name="semesterId"
            required
            options={semesterOptions}
            value={values.semesterId}
            error={errors.semesterId}
            placeholder={selectedAcademic ? 'Select a semester' : 'Select an academic session first'}
            disabled={!selectedAcademic}
            onChange={(event) => update('semesterId', event.target.value)}
          />
          <Select
            label="Exam Type"
            name="examType"
            required
            options={EXAM_TYPE_OPTIONS}
            value={values.examType}
            error={errors.examType}
            placeholder="Select an exam type"
            onChange={(event) => update('examType', event.target.value)}
          />
          <Input
            label="Exam Name"
            name="name"
            required
            value={values.name}
            error={errors.name}
            placeholder="e.g. Programming Midterm"
            onChange={(event) => update('name', event.target.value)}
          />
          <Input
            label="Exam Date"
            name="examDate"
            type="date"
            required
            value={values.examDate}
            error={errors.examDate}
            onChange={(event) => update('examDate', event.target.value)}
          />
          <SearchableSelect
            label="Teacher"
            name="teacherId"
            required
            options={teacherOptions}
            value={values.teacherId}
            error={errors.teacherId}
            placeholder="Select a teacher"
            emptyMessage="No teachers found."
            onChange={(teacherId) => update('teacherId', teacherId)}
          />
          <Input
            label="Total Marks"
            name="totalMarks"
            required
            inputMode="numeric"
            value={values.totalMarks}
            error={errors.totalMarks}
            hint="Selected question marks must add up to this total before approval."
            placeholder="e.g. 100"
            onChange={(event) => update('totalMarks', event.target.value.replace(/[^\d]/g, '').slice(0, 3))}
          />
        </div>
        {dateOutside && selectedSemester ? (
          <p className="text-sm text-amber-800">
            This date sits outside {selectedSemester.name} ({formatDateRange(selectedSemester.startDate, selectedSemester.endDate)}). You can still save it.
          </p>
        ) : null}
        <Textarea
          label="Remarks / Details"
          name="remarks"
          value={values.remarks}
          error={errors.remarks}
          placeholder="Instructions, coverage notes, or other details for the paper"
          onChange={(event) => update('remarks', event.target.value)}
        />
      </section>

      <QuestionConfigFields values={values} errors={errors} onChange={update} />

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <p className="mr-auto hidden text-xs text-slate-500 sm:block">
          {allowDraft
            ? 'Save as Draft keeps the exam at Initiated. Save & Continue opens question selection.'
            : 'Saving keeps the current workflow status.'}
        </p>
        {allowDraft ? (
          <Button type="button" variant="secondary" disabled={submitting} onClick={() => save(true)}>
            {pendingAction === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pendingAction === 'draft' ? 'Saving...' : 'Save as Draft'}
          </Button>
        ) : null}
        <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {pendingAction === 'continue' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pendingAction === 'continue' ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
