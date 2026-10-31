import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Textarea } from '@/components/ui/Textarea'
import type { QuestionFormErrors, TrueFalseFormContent } from '@/types/question'

interface TrueFalseFieldsProps {
  content: TrueFalseFormContent
  errors: QuestionFormErrors
  onChange: (
    update: TrueFalseFormContent | ((current: TrueFalseFormContent) => TrueFalseFormContent),
  ) => void
}

const answers = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
] as const

export function TrueFalseFields({ content, errors, onChange }: TrueFalseFieldsProps) {
  return (
    <div className="space-y-5">
      <RichTextEditor
        label="Question Text"
        required
        value={content.questionText}
        error={errors.questionText}
        placeholder="Write a statement that is either true or false"
        hint="Select text, then use the toolbar to format it."
        onChange={(questionText) => onChange({ ...content, questionText })}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">
          Correct Answer
          <span className="ml-0.5 text-red-600">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {answers.map((answer) => {
            const selected = content.correctAnswer === answer.value
            return (
              <label
                key={answer.value}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition ${
                  selected
                    ? 'border-sky-600 bg-white text-sky-900 ring-2 ring-sky-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="true-false-answer"
                  value={answer.value}
                  checked={selected}
                  onChange={() => onChange({ ...content, correctAnswer: answer.value })}
                  className="accent-sky-700"
                />
                {answer.label}
              </label>
            )
          })}
        </div>
        {errors.correctAnswer ? <p className="text-xs text-red-600">{errors.correctAnswer}</p> : null}
      </fieldset>

      <Textarea
        label="Explanation"
        name="trueFalseExplanation"
        value={content.explanation}
        placeholder="Why this answer is correct (optional)"
        onChange={(event) => onChange({ ...content, explanation: event.target.value })}
      />
    </div>
  )
}
