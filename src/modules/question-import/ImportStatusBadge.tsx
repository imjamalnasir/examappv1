import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { ImportOutcome, ImportRecordStatus, ImportRowStatus } from '@/types/questionImport'
import { rowStatusLabel } from '@/modules/question-import/importFormat'

const rowClasses: Record<ImportRowStatus, string> = {
  valid: 'bg-emerald-50 text-emerald-700',
  invalid: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-800',
}

const recordClasses: Record<ImportRecordStatus, string> = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Partial: 'bg-amber-50 text-amber-800',
  Failed: 'bg-red-50 text-red-700',
}

const outcomeClasses: Record<ImportOutcome, string> = {
  imported: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  skipped: 'bg-amber-50 text-amber-800',
}

function StatusPill({ className, label }: { className: string; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export function ImportRowStatusBadge({ status }: { status: ImportRowStatus }) {
  const Icon = status === 'valid' ? CheckCircle2 : status === 'invalid' ? XCircle : AlertTriangle
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${rowClasses[status]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {rowStatusLabel(status)}
    </span>
  )
}

export function ImportRecordStatusBadge({ status }: { status: ImportRecordStatus }) {
  return <StatusPill className={recordClasses[status]} label={status} />
}

export function ImportOutcomeBadge({ outcome }: { outcome: ImportOutcome }) {
  const label = outcome === 'imported' ? 'Imported' : outcome === 'failed' ? 'Failed' : 'Skipped'
  return <StatusPill className={outcomeClasses[outcome]} label={label} />
}
