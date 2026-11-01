import type { Student } from '@/types/student'

export type StudentCardFilter = 'All' | 'Active'

export function StudentSummaryCards({
  students,
  active,
  onSelect,
}: {
  students: Student[]
  active: StudentCardFilter
  onSelect: (filter: StudentCardFilter) => void
}) {
  const unitCount = new Set(students.map((student) => student.unit)).size
  const rankCount = new Set(students.map((student) => student.rank)).size
  const activeCount = students.filter((student) => student.status === 'Active').length

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <FilterCard
        label="Total Students"
        count={students.length}
        accent="bg-slate-400"
        selected={active === 'All'}
        onClick={() => onSelect('All')}
      />
      <SummaryStat label="Total Units" count={unitCount} accent="bg-indigo-600" />
      <SummaryStat label="Total Ranks" count={rankCount} accent="bg-amber-500" />
      <FilterCard
        label="Active Students"
        count={activeCount}
        accent="bg-emerald-600"
        selected={active === 'Active'}
        onClick={() => onSelect('Active')}
      />
    </div>
  )
}

function FilterCard({
  label,
  count,
  accent,
  selected,
  onClick,
}: {
  label: string
  count: number
  accent: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-lg border bg-white p-4 text-left transition ${
        selected ? 'border-sky-600 ring-2 ring-sky-600/20' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <span className={`mb-3 block h-1 w-8 rounded-full ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{count}</p>
    </button>
  )
}

function SummaryStat({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <span className={`mb-3 block h-1 w-8 rounded-full ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{count}</p>
    </div>
  )
}
