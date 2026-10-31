import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { QuestionFormErrors, SubjectiveFormContent } from '@/types/question'

interface SubjectiveFieldsProps {
  content: SubjectiveFormContent
  errors: QuestionFormErrors
  onChange: (
    update: SubjectiveFormContent | ((current: SubjectiveFormContent) => SubjectiveFormContent),
  ) => void
}

export function SubjectiveFields({ content, errors, onChange }: SubjectiveFieldsProps) {
  return (
    <div className="space-y-5">
      <RichTextEditor
        label="Question Text"
        required
        value={content.questionText}
        error={errors.questionText}
        placeholder="Write a question that students answer in their own words"
        hint="Select text, then use the toolbar to format it."
        onChange={(questionText) => onChange({ ...content, questionText })}
      />

      <Textarea
        label="Expected Answer / Model Answer"
        name="modelAnswer"
        value={content.modelAnswer}
        placeholder="A sample answer teachers can use while grading (optional)"
        rows={5}
        onChange={(event) => onChange({ ...content, modelAnswer: event.target.value })}
      />

      <Textarea
        label="Answer Guidelines"
        name="guidelines"
        value={content.guidelines}
        placeholder="How the written answer should be evaluated (optional)"
        onChange={(event) => onChange({ ...content, guidelines: event.target.value })}
      />

      <div className="max-w-xs">
        <Input
          label="Marks"
          name="marks"
          type="number"
          min={1}
          max={100}
          step="0.5"
          value={content.marks}
          error={errors.marks}
          placeholder="e.g. 10"
          hint="Optional. Leave blank if marks are not assigned yet."
          onChange={(event) => onChange({ ...content, marks: event.target.value })}
        />
      </div>
    </div>
  )
}
