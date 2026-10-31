import {
  DIFFICULTY_DESCRIPTIONS,
  QUESTION_TYPE_DESCRIPTIONS,
  questionTypeLabel,
} from '@/modules/question-bank/questionLabels'
import type { DifficultyLevel, QuestionStatus, QuestionType } from '@/types/question'

const typeClasses: Record<QuestionType, string> = {
  'true-false': 'bg-sky-50 text-sky-800',
  mcq: 'bg-indigo-50 text-indigo-700',
  subjective: 'bg-fuchsia-50 text-fuchsia-800',
}

const difficultyClasses: Record<DifficultyLevel, string> = {
  Easy: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-800',
  Hard: 'bg-rose-50 text-rose-700',
}

const statusClasses: Record<QuestionStatus, string> = {
  Draft: 'bg-violet-50 text-violet-700',
  Published: 'bg-emerald-50 text-emerald-700',
}

export function QuestionTypeBadge({ type }: { type: QuestionType }) {
  return (
    <span
      title={QUESTION_TYPE_DESCRIPTIONS[type]}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeClasses[type]}`}
    >
      {questionTypeLabel(type)}
    </span>
  )
}

export function DifficultyBadge({ level }: { level: DifficultyLevel }) {
  return (
    <span
      title={DIFFICULTY_DESCRIPTIONS[level]}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyClasses[level]}`}
    >
      {level}
    </span>
  )
}

export function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  )
}
