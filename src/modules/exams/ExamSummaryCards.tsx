import type { Exam, ExamStatus } from '@/types/exam'

export type ExamCardFilter = 'All' | ExamStatus

const cards: { id: ExamCardFilter; label: string; accent: string }[] = [
  { id: 'All', label: 'Total Exams', accent: 'bg-slate-400' },
  { id: 'Initiated', label: 'Initiated Exams', accent: 'bg-sky-600' },
  { id: 'Forwarded', label: 'Forwarded Exams', accent: 'bg-indigo-600' },
  { id: 'Forwarded to Approval', label: 'Pending Approval', accent: 'bg-amber-500' },
  { id: 'Approved', label: 'Approved Exams', accent: 'bg-emerald-600' },
]

export function ExamSummaryCards({
  exams,
  active,
  onSelect,
}: {
  exams: Exam[]
  active: ExamCardFilter
  onSelect: (filter: ExamCardFilter) => void
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((card) => {
        const selected = active === card.id
        const count =
          card.id === 'All' ? exams.length : exams.filter((exam) => exam.status === card.id).length
        return (
          <button
            key={card.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(card.id)}
            className={`rounded-lg border bg-white p-4 text-left transition ${
              selected
                ? 'border-sky-600 ring-2 ring-sky-600/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className={`mb-3 block h-1 w-8 rounded-full ${card.accent}`} />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{count}</p>
          </button>
        )
      })}
    </div>
  )
}
