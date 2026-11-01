import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

function RemarksSession({
  title,
  message,
  confirmLabel,
  remarksLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  message: string
  confirmLabel: string
  remarksLabel: string
  onCancel: () => void
  onConfirm: (remarks: string) => void
}) {
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')

  const confirm = () => {
    if (remarks.trim().length === 0) {
      setError('Enter a reason before continuing.')
      return
    }
    onConfirm(remarks.trim())
  }

  return (
    <Modal
      open
      wide
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={confirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p>{message}</p>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            {remarksLabel}
            <span className="ml-0.5 text-red-600">*</span>
          </span>
          <textarea
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value)
              setError('')
            }}
            rows={4}
            className={`min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600/20 ${
              error ? 'border-red-400' : 'border-slate-300 focus:border-sky-600'
            }`}
          />
          {error ? <span className="block text-xs text-red-600">{error}</span> : null}
        </label>
      </div>
    </Modal>
  )
}

export function ExamRemarksDialog({
  open,
  title,
  message,
  confirmLabel,
  remarksLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  remarksLabel: string
  onCancel: () => void
  onConfirm: (remarks: string) => void
}) {
  if (!open) {
    return null
  }

  return (
    <RemarksSession
      key={title}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      remarksLabel={remarksLabel}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
