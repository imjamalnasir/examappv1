import type { StudentRank, StudentUnit } from '@/types/student'

export function StudentRankBadge({ rank }: { rank: StudentRank }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">
      {rank}
    </span>
  )
}

export function StudentUnitBadge({ unit }: { unit: StudentUnit }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {unit}
    </span>
  )
}
