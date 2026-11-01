import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Exam } from '@/types/exam'

function DeleteDialogSession({
  exam,
  needsAuthorization,
  onCancel,
  onConfirm,
}: {
  exam: Exam
  needsAuthorization: boolean
  onCancel: () => void
  onConfirm: (authorized: boolean) => void
}) {
  const [authorized, setAuthorized] = useState(false)

  return (
    <Modal
      open
      wide
      title="Delete exam"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={needsAuthorization && !authorized}
            onClick={() => onConfirm(needsAuthorization ? authorized : true)}
          >
            Delete exam
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p>
          Delete <span className="font-medium text-slate-900">{exam.name}</span> ({exam.id})? This removes the exam,
          its question list, and its workflow history.
        </p>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
          Questions stay in the question bank. Only this exam's selection is removed.
        </div>
        {needsAuthorization ? (
          <div className="space-y-3">
            <p className="font-medium text-rose-700">
              This exam is approved and locked. Deleting it needs explicit authorization.
            </p>
            <label className="flex items-start gap-2 text-slate-800">
              <input
                type="checkbox"
                className="mt-1"
                checked={authorized}
                onChange={(event) => setAuthorized(event.target.checked)}
              />
              <span>I am authorized to delete this approved examination.</span>
            </label>
          </div>
        ) : exam.status === 'Forwarded to Approval' ? (
          <p>This paper is currently waiting for approval.</p>
        ) : null}
      </div>
    </Modal>
  )
}

export function ExamDeleteDialog({
  exam,
  open,
  needsAuthorization,
  onCancel,
  onConfirm,
}: {
  exam: Exam | null
  open: boolean
  needsAuthorization: boolean
  onCancel: () => void
  onConfirm: (authorized: boolean) => void
}) {
  if (!open || !exam) {
    return null
  }

  return (
    <DeleteDialogSession
      key={exam.id}
      exam={exam}
      needsAuthorization={needsAuthorization}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
