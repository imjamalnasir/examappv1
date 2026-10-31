import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  MAX_MCQ_OPTIONS,
  MIN_MCQ_OPTIONS,
  createOptionClientId,
  optionLabel,
} from '@/modules/question-bank/questionFormState'
import type { McqAnswerMode, McqFormContent, QuestionFormErrors } from '@/types/question'

interface McqFieldsProps {
  content: McqFormContent
  errors: QuestionFormErrors
  onChange: (update: McqFormContent | ((current: McqFormContent) => McqFormContent)) => void
}

export function McqFields({ content, errors, onChange }: McqFieldsProps) {
  const [modeNotice, setModeNotice] = useState('')
  const atMinimum = content.options.length <= MIN_MCQ_OPTIONS
  const atMaximum = content.options.length >= MAX_MCQ_OPTIONS

  const setMode = (answerMode: McqAnswerMode) => {
    if (answerMode === content.answerMode) {
      return
    }

    if (answerMode === 'single') {
      const correctCount = content.options.filter((option) => option.isCorrect).length
      setModeNotice(
        correctCount > 1
          ? 'Single-answer mode keeps only the first correct option. Extra correct marks were cleared.'
          : '',
      )
    } else {
      setModeNotice('')
    }

    onChange((current) => {
      if (answerMode === 'single') {
        let kept = false
        const options = current.options.map((option) => {
          if (!option.isCorrect || kept) {
            return { ...option, isCorrect: false }
          }
          kept = true
          return option
        })
        return { ...current, answerMode, options }
      }

      return { ...current, answerMode }
    })
  }

  const markCorrect = (clientId: string) => {
    onChange((current) => ({
      ...current,
      options: current.options.map((option) => {
        if (current.answerMode === 'single') {
          return { ...option, isCorrect: option.clientId === clientId }
        }
        if (option.clientId !== clientId) {
          return option
        }
        return { ...option, isCorrect: !option.isCorrect }
      }),
    }))
  }

  return (
    <div className="space-y-5">
      <RichTextEditor
        label="Question Text"
        required
        value={content.questionText}
        error={errors.questionText}
        placeholder="Write the question students will answer by choosing options"
        hint="Select text, then use the toolbar to format it."
        onChange={(questionText) => onChange((current) => ({ ...current, questionText }))}
      />

      <div className="space-y-3 rounded-md border border-indigo-200 bg-white p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Answer mode</h3>
          <p className="mt-1 text-xs text-slate-500">
            {content.answerMode === 'single'
              ? 'Single correct answer. Students choose one option, and only one option can be marked correct.'
              : 'Multiple correct answers. Students may select more than one option. Mark every correct option.'}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="MCQ answer mode">
          <button
            type="button"
            role="radio"
            aria-checked={content.answerMode === 'single'}
            onClick={() => setMode('single')}
            className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
              content.answerMode === 'single'
                ? 'border-sky-600 bg-sky-50 text-sky-900'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Single correct answer
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={content.answerMode === 'multiple'}
            onClick={() => setMode('multiple')}
            className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
              content.answerMode === 'multiple'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Multiple correct answers
          </button>
        </div>
        {modeNotice ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {modeNotice}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Answer options</h3>
            <p className="mt-1 text-xs text-slate-500">
              Option labels are assigned automatically. At least two options are required, and four are
              included by default.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange((current) => ({
                ...current,
                options: [
                  ...current.options,
                  { clientId: createOptionClientId(), text: '', isCorrect: false },
                ],
              }))
            }
            disabled={atMaximum}
            title={atMaximum ? 'You can add up to 8 options.' : 'Add Option'}
          >
            <Plus className="h-4 w-4" />
            Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {content.options.map((option, index) => {
            const label = optionLabel(index)
            return (
              <div key={option.clientId} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                    {label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={atMinimum}
                    title={atMinimum ? 'At least two options are required.' : 'Remove Option'}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        options: current.options.filter((item) => item.clientId !== option.clientId),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <Input
                  label={`Option ${label} text`}
                  name={`option-${option.clientId}`}
                  required
                  value={option.text}
                  error={errors.optionTexts?.[option.clientId]}
                  placeholder="Enter the answer option"
                  onChange={(event) => {
                    const text = event.target.value
                    onChange((current) => ({
                      ...current,
                      options: current.options.map((item) =>
                        item.clientId === option.clientId ? { ...item, text } : item,
                      ),
                    }))
                  }}
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type={content.answerMode === 'single' ? 'radio' : 'checkbox'}
                    name={content.answerMode === 'single' ? 'mcq-correct-answer' : undefined}
                    checked={option.isCorrect}
                    onChange={() => markCorrect(option.clientId)}
                    className={
                      content.answerMode === 'single' ? 'accent-sky-700' : 'accent-indigo-700'
                    }
                  />
                  {content.answerMode === 'single' ? 'Correct answer' : 'Mark as a correct answer'}
                </label>
              </div>
            )
          })}
        </div>
        {errors.options ? <p className="text-xs text-red-600">{errors.options}</p> : null}
      </div>

      <Textarea
        label="Explanation"
        name="mcqExplanation"
        value={content.explanation}
        placeholder="Why the marked option or options are correct (optional)"
        onChange={(event) => {
          const explanation = event.target.value
          onChange((current) => ({ ...current, explanation }))
        }}
      />
    </div>
  )
}
