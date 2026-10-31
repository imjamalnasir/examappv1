import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ImportRowStatusBadge } from '@/modules/question-import/ImportStatusBadge'
import {
  issuesForField,
  matchCourse,
  matchTopic,
  normalizeDifficulty,
  normalizeQuestionType,
  questionTypeImportLabel,
  validateImportRows,
  type ImportValidationContext,
} from '@/modules/question-import/validateImportRows'
import { getTopicsByCourse } from '@/utils/relationships'
import type { ImportField, ImportRowDraft } from '@/types/questionImport'

interface RowEditorDialogProps {
  source: ImportRowDraft
  rows: ImportRowDraft[]
  context: ImportValidationContext
  onClose: () => void
  onSave: (row: ImportRowDraft) => void
}

interface EditorForm {
  questionId: string
  courseId: string
  topicId: string
  questionType: string
  difficulty: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  modelAnswer: string
  answerGuidelines: string
  marks: string
}

function initialForm(source: ImportRowDraft, context: ImportValidationContext): EditorForm {
  const course = matchCourse(context.courses, source.course)
  const courseTopics = course ? getTopicsByCourse(context.topics, context.subjects, course.id) : []
  const topic = matchTopic(courseTopics, source.topic)
  const type = normalizeQuestionType(source.questionType)
  const difficulty = normalizeDifficulty(source.difficulty)

  return {
    questionId: source.questionId,
    courseId: course?.id ?? '',
    topicId: topic?.id ?? '',
    questionType: type ? questionTypeImportLabel(type) : source.questionType,
    difficulty: difficulty ?? source.difficulty,
    questionText: source.questionText,
    optionA: source.optionA,
    optionB: source.optionB,
    optionC: source.optionC,
    optionD: source.optionD,
    correctAnswer: source.correctAnswer,
    explanation: source.explanation,
    modelAnswer: source.modelAnswer,
    answerGuidelines: source.answerGuidelines,
    marks: source.marks,
  }
}

export function RowEditorDialog({ source, rows, context, onClose, onSave }: RowEditorDialogProps) {
  const [form, setForm] = useState<EditorForm>(() => initialForm(source, context))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const courseTopics = useMemo(() => {
    if (!form.courseId) {
      return []
    }
    return getTopicsByCourse(context.topics, context.subjects, form.courseId).slice().sort((left, right) =>
      left.name.localeCompare(right.name),
    )
  }, [context.subjects, context.topics, form.courseId])

  const draft = useMemo<ImportRowDraft>(() => {
    const course = context.courses.find((item) => item.id === form.courseId)
    const topic = context.topics.find((item) => item.id === form.topicId)
    return {
      ...source,
      questionId: form.questionId,
      course: course?.code ?? source.course,
      topic: topic?.name ?? source.topic,
      questionType: form.questionType,
      difficulty: form.difficulty,
      questionText: form.questionText,
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
      modelAnswer: form.modelAnswer,
      answerGuidelines: form.answerGuidelines,
      marks: form.marks,
    }
  }, [context.courses, context.topics, form, source])

  const validated = useMemo(() => {
    const nextRows = rows.map((row) => (row.rowKey === source.rowKey ? draft : row))
    return validateImportRows(nextRows, context).find((row) => row.rowKey === source.rowKey)
  }, [context, draft, rows, source.rowKey])

  const errorFor = (field: ImportField) => (validated ? issuesForField(validated.errors, field) : undefined)

  const setField = (field: keyof EditorForm, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'courseId') {
        const topics = getTopicsByCourse(context.topics, context.subjects, value)
        if (!topics.some((topic) => topic.id === current.topicId)) {
          next.topicId = ''
        }
      }
      return next
    })
  }

  const typeOptions = ['T/F', 'MCQs', 'Subjective']
  if (form.questionType && !typeOptions.includes(form.questionType)) {
    typeOptions.unshift(form.questionType)
  }
  const difficultyOptions = ['Easy', 'Medium', 'Hard']
  if (form.difficulty && !difficultyOptions.includes(form.difficulty)) {
    difficultyOptions.unshift(form.difficulty)
  }

  const courseOptions = context.courses
    .slice()
    .sort((left, right) => left.code.localeCompare(right.code))
    .map((course) => ({
      value: course.id,
      label: `${course.code} — ${course.name}`,
    }))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-row-editor-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="import-row-editor-title" className="text-base font-semibold text-slate-900">
              Edit row {source.excelRow}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Spreadsheet values: {source.course || 'No course'} · {source.topic || 'No topic'}
            </p>
          </div>
          {validated ? <ImportRowStatusBadge status={validated.status} /> : null}
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          {validated && validated.errors.length > 0 ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <ul className="list-disc space-y-1 pl-4">
                {validated.errors.map((issue) => (
                  <li key={issue.message}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {validated && validated.warnings.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <ul className="list-disc space-y-1 pl-4">
                {validated.warnings.map((issue) => (
                  <li key={issue.message}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Question ID"
              name="questionId"
              value={form.questionId}
              onChange={(event) => setField('questionId', event.target.value)}
              error={errorFor('questionId')}
              hint="Leave blank to generate an ID during import."
            />
            <Select
              label="Question Type"
              name="questionType"
              value={form.questionType}
              onChange={(event) => setField('questionType', event.target.value)}
              options={typeOptions.map((value) => ({ value, label: value }))}
              placeholder="Select a question type"
              error={errorFor('questionType')}
              required
            />
            <Select
              label="Course"
              name="courseId"
              value={form.courseId}
              onChange={(event) => setField('courseId', event.target.value)}
              options={courseOptions}
              placeholder="Select a course"
              error={errorFor('course')}
              required
            />
            <Select
              label="Topic"
              name="topicId"
              value={form.topicId}
              onChange={(event) => setField('topicId', event.target.value)}
              options={courseTopics.map((topic) => ({
                value: topic.id,
                label: `${topic.id} — ${topic.name}`,
              }))}
              placeholder={form.courseId ? 'Select a topic' : 'Select a course first'}
              disabled={!form.courseId}
              error={errorFor('topic')}
              required
            />
            <Select
              label="Difficulty Level"
              name="difficulty"
              value={form.difficulty}
              onChange={(event) => setField('difficulty', event.target.value)}
              options={difficultyOptions.map((value) => ({ value, label: value }))}
              placeholder="Select difficulty"
              error={errorFor('difficulty')}
              required
            />
            <Input
              label="Marks"
              name="marks"
              value={form.marks}
              onChange={(event) => setField('marks', event.target.value)}
              error={errorFor('marks')}
              hint="Optional. Used for subjective questions."
            />
          </div>

          <Textarea
            label="Question Text"
            name="questionText"
            value={form.questionText}
            onChange={(event) => setField('questionText', event.target.value)}
            error={errorFor('questionText')}
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Option A" name="optionA" value={form.optionA} onChange={(event) => setField('optionA', event.target.value)} error={errorFor('optionA')} />
            <Input label="Option B" name="optionB" value={form.optionB} onChange={(event) => setField('optionB', event.target.value)} error={errorFor('optionB')} />
            <Input label="Option C" name="optionC" value={form.optionC} onChange={(event) => setField('optionC', event.target.value)} error={errorFor('optionC')} />
            <Input label="Option D" name="optionD" value={form.optionD} onChange={(event) => setField('optionD', event.target.value)} error={errorFor('optionD')} />
          </div>

          <Input
            label="Correct Answer"
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={(event) => setField('correctAnswer', event.target.value)}
            error={errorFor('correctAnswer')}
            hint="True or False, or MCQ labels such as A or A,C."
          />
          <Textarea
            label="Explanation"
            name="explanation"
            value={form.explanation}
            onChange={(event) => setField('explanation', event.target.value)}
          />
          <Textarea
            label="Model Answer"
            name="modelAnswer"
            value={form.modelAnswer}
            onChange={(event) => setField('modelAnswer', event.target.value)}
            error={errorFor('modelAnswer')}
          />
          <Textarea
            label="Answer Guidelines"
            name="answerGuidelines"
            value={form.answerGuidelines}
            onChange={(event) => setField('answerGuidelines', event.target.value)}
            error={errorFor('answerGuidelines')}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)}>Save Row</Button>
        </div>
      </div>
    </div>
  )
}
