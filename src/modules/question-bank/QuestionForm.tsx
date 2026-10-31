import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Select } from '@/components/ui/Select'
import { McqFields } from '@/modules/question-bank/McqFields'
import { SubjectiveFields } from '@/modules/question-bank/SubjectiveFields'
import { TrueFalseFields } from '@/modules/question-bank/TrueFalseFields'
import {
  changeQuestionType,
  discardMessage,
  hasDiscardableContent,
} from '@/modules/question-bank/questionFormState'
import {
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_DESCRIPTIONS,
  QUESTION_TYPE_OPTIONS,
  isDifficultyLevel,
  isQuestionType,
} from '@/modules/question-bank/questionLabels'
import {
  hasQuestionFormErrors,
  validateQuestionForm,
} from '@/modules/question-bank/questionValidation'
import { suggestQuestionId } from '@/services/questionService'
import type { Course } from '@/types/course'
import type { Question, QuestionFormErrors, QuestionFormValues, QuestionType } from '@/types/question'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'
import { getTopicsByCourse } from '@/utils/relationships'

interface QuestionFormProps {
  initialValues: QuestionFormValues
  questions: Question[]
  courses: Course[]
  subjects: Subject[]
  topics: Topic[]
  excludeId?: string
  submitLabel: string
  onSubmit: (values: QuestionFormValues, asDraft: boolean) => void
  onCancel: () => void
}

const contentPanelClass: Record<QuestionType, string> = {
  'true-false': 'border-sky-200 bg-sky-50/60',
  mcq: 'border-indigo-200 bg-indigo-50/50',
  subjective: 'border-fuchsia-200 bg-fuchsia-50/50',
}

export function QuestionForm({
  initialValues,
  questions,
  courses,
  subjects,
  topics,
  excludeId,
  submitLabel,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [values, setValues] = useState<QuestionFormValues>(initialValues)
  const [errors, setErrors] = useState<QuestionFormErrors>({})
  const [pendingType, setPendingType] = useState<QuestionType | null>(null)
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

  const topicOptions = useMemo(
    () =>
      getTopicsByCourse(topics, subjects, values.courseId)
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((topic) => ({
          label: topic.name,
          value: topic.id,
        })),
    [topics, subjects, values.courseId],
  )

  const selectedTopic = topics.find((topic) => topic.id === values.topicId)
  const selectedSubject = subjects.find((subject) => subject.id === selectedTopic?.subjectId)

  const clearContentErrors = (current: QuestionFormErrors): QuestionFormErrors => ({
    ...current,
    type: undefined,
    questionText: undefined,
    correctAnswer: undefined,
    options: undefined,
    optionTexts: undefined,
    marks: undefined,
  })

  const applyType = (nextType: QuestionType) => {
    setValues((current) => changeQuestionType(current, nextType))
    setErrors((current) => clearContentErrors(current))
  }

  const requestTypeChange = (nextType: QuestionType) => {
    if (values.type === nextType) {
      return
    }
    if (values.type && hasDiscardableContent(values, values.type)) {
      setPendingType(nextType)
      return
    }
    applyType(nextType)
  }

  const generateId = () => {
    const nextId = suggestQuestionId(questions.filter((question) => question.id !== excludeId))
    setValues((current) => ({ ...current, questionId: nextId }))
    setErrors((current) => ({ ...current, questionId: undefined }))
  }

  const save = (asDraft: boolean) => {
    const nextErrors = validateQuestionForm(
      values,
      questions,
      courses,
      subjects,
      topics,
      excludeId,
    )
    if (hasQuestionFormErrors(nextErrors)) {
      setErrors(nextErrors)
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

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="space-y-8 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      {hasQuestionFormErrors(errors) ? (
        <div
          ref={alertRef}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Please correct the highlighted fields before continuing.
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Question Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each question belongs to one course and one topic. Topics are limited to the selected
            course.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Input
              label="Question ID"
              name="questionId"
              required
              value={values.questionId}
              error={errors.questionId}
              placeholder="e.g. QB-016"
              hint="Generated automatically. You can edit it, and it must stay unique."
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  questionId: event.target.value.toUpperCase(),
                }))
                setErrors((current) => ({ ...current, questionId: undefined }))
              }}
            />
          </div>
          <Button type="button" variant="secondary" className="mt-7 shrink-0" onClick={generateId}>
            Generate
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SearchableSelect
            label="Course"
            name="courseId"
            required
            options={courseOptions}
            value={values.courseId}
            error={errors.courseId}
            placeholder="Select a course"
            emptyMessage="No courses found."
            onChange={(courseId) => {
              setValues((current) => ({ ...current, courseId, topicId: '' }))
              setErrors((current) => ({ ...current, courseId: undefined, topicId: undefined }))
            }}
          />
          <div className="space-y-1.5">
            <SearchableSelect
              label="Topic"
              name="topicId"
              required
              options={topicOptions}
              value={values.topicId}
              error={errors.topicId}
              placeholder={values.courseId ? 'Select a topic' : 'Select a course first'}
              disabled={!values.courseId}
              emptyMessage="No topics are linked to this course."
              onChange={(topicId) => {
                setValues((current) => ({ ...current, topicId }))
                setErrors((current) => ({ ...current, topicId: undefined }))
              }}
            />
            {selectedSubject ? (
              <p className="text-xs text-slate-500">
                This topic belongs to {selectedSubject.name} ({selectedSubject.code}).
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Question Type"
            name="type"
            required
            options={QUESTION_TYPE_OPTIONS}
            value={values.type}
            error={errors.type}
            placeholder="Select a question type"
            onChange={(event) => {
              if (isQuestionType(event.target.value)) {
                requestTypeChange(event.target.value)
              }
            }}
          />
          <div className="space-y-1.5">
            <Select
              label="Difficulty Level"
              name="difficulty"
              required
              options={DIFFICULTY_OPTIONS}
              value={values.difficulty}
              error={errors.difficulty}
              placeholder="Select a difficulty"
              onChange={(event) => {
                if (!isDifficultyLevel(event.target.value)) {
                  return
                }
                const difficulty = event.target.value
                setValues((current) => ({ ...current, difficulty }))
                setErrors((current) => ({ ...current, difficulty: undefined }))
              }}
            />
            {values.difficulty ? (
              <p className="text-xs text-slate-500">{DIFFICULTY_DESCRIPTIONS[values.difficulty]}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Question Content</h2>
          <p className="mt-1 text-sm text-slate-500">
            {values.type
              ? QUESTION_TYPE_DESCRIPTIONS[values.type]
              : 'Choose True / False, MCQs, or Subjective. The fields below change to match that type.'}
          </p>
        </div>

        {values.type === 'true-false' ? (
          <div className={`rounded-lg border p-4 sm:p-5 ${contentPanelClass['true-false']}`}>
            <TrueFalseFields
              content={values.trueFalse}
              errors={errors}
              onChange={(update) => {
                setValues((current) => ({
                  ...current,
                  trueFalse: typeof update === 'function' ? update(current.trueFalse) : update,
                }))
                setErrors((current) => ({
                  ...current,
                  questionText: undefined,
                  correctAnswer: undefined,
                }))
              }}
            />
          </div>
        ) : null}

        {values.type === 'mcq' ? (
          <div className={`rounded-lg border p-4 sm:p-5 ${contentPanelClass.mcq}`}>
            <McqFields
              content={values.mcq}
              errors={errors}
              onChange={(update) => {
                setValues((current) => ({
                  ...current,
                  mcq: typeof update === 'function' ? update(current.mcq) : update,
                }))
                setErrors((current) => ({
                  ...current,
                  questionText: undefined,
                  options: undefined,
                  optionTexts: undefined,
                }))
              }}
            />
          </div>
        ) : null}

        {values.type === 'subjective' ? (
          <div className={`rounded-lg border p-4 sm:p-5 ${contentPanelClass.subjective}`}>
            <SubjectiveFields
              content={values.subjective}
              errors={errors}
              onChange={(update) => {
                setValues((current) => ({
                  ...current,
                  subjective: typeof update === 'function' ? update(current.subjective) : update,
                }))
                setErrors((current) => ({
                  ...current,
                  questionText: undefined,
                  marks: undefined,
                }))
              }}
            />
          </div>
        ) : null}

        {!values.type ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-800">No question type selected</p>
            <p className="mt-1 text-sm text-slate-500">
              True / False, MCQs, and Subjective questions each use their own content fields.
            </p>
          </div>
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <p className="mr-auto hidden text-xs text-slate-500 lg:block">
          Save as Draft keeps the question unpublished. {submitLabel} publishes it.
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

      <Modal
        open={pendingType !== null && values.type !== ''}
        title="Change question type?"
        onClose={() => setPendingType(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingType(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingType) {
                  applyType(pendingType)
                }
                setPendingType(null)
              }}
            >
              Change type
            </Button>
          </>
        }
      >
        <p>
          {pendingType && values.type ? discardMessage(values.type, pendingType) : ''}
        </p>
      </Modal>
    </form>
  )
}
