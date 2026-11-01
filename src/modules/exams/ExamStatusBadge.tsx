import { EXAM_STATUS_DESCRIPTIONS } from '@/modules/exams/examLabels'
import type { ExamStatus, ExamType, QuestionClassification } from '@/types/exam'

const statusClasses: Record<ExamStatus, string> = {
  Initiated: 'bg-sky-50 text-sky-800',
  Forwarded: 'bg-indigo-50 text-indigo-700',
  'Forwarded to Approval': 'bg-amber-50 text-amber-800',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
  Returned: 'bg-orange-50 text-orange-800',
}

const typeClasses: Record<ExamType, string> = {
  Midterm: 'bg-sky-50 text-sky-800',
  'Final Term': 'bg-indigo-50 text-indigo-700',
  Quiz: 'bg-emerald-50 text-emerald-700',
  Assignment: 'bg-amber-50 text-amber-800',
  Practical: 'bg-fuchsia-50 text-fuchsia-800',
  Viva: 'bg-teal-50 text-teal-800',
}

export function ExamStatusBadge({ status }: { status: ExamStatus }) {
  return (
    <span
      title={EXAM_STATUS_DESCRIPTIONS[status]}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  )
}

export function ExamTypeBadge({ type }: { type: ExamType }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${typeClasses[type]}`}
    >
      {type}
    </span>
  )
}

export function ClassificationBadge({ classification }: { classification: QuestionClassification }) {
  const isFinal = classification === 'Final'
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isFinal ? 'bg-sky-50 text-sky-800' : 'bg-violet-50 text-violet-700'
      }`}
    >
      {classification}
    </span>
  )
}
