import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Question } from '@/types/question'
import { previewText } from '@/utils/richText'

interface QuestionDeleteDialogProps {
  question: Question | null
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function QuestionDeleteDialog({
  question,
  open,
  onCancel,
  onConfirm,
}: QuestionDeleteDialogProps) {
  return (
    <Modal
      open={open && question !== null}
      title="Delete Question"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      {question ? (
        <div className="space-y-3">
          <p>This question will be removed from the question bank. This action cannot be undone.</p>
          <dl className="space-y-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Question ID
              </dt>
              <dd className="mt-1 font-medium text-slate-900">{question.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Question
              </dt>
              <dd className="mt-1 text-slate-700">
                {previewText(question.content.questionText, 180) || 'No question text'}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </Modal>
  )
}
