import type { AcademicStatus } from '@/types/academic'

const statusClasses: Record<AcademicStatus, string> = {
  Upcoming: 'bg-amber-50 text-amber-800',
  Active: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-slate-100 text-slate-600',
}

export function AcademicStatusBadge({ status }: { status: AcademicStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  )
}

export function DraftBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
      Draft
    </span>
  )
}
