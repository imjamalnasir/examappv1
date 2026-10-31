import type { EntityStatus } from '@/types/common'

interface BadgeProps {
  status: EntityStatus
}

export function Badge({ status }: BadgeProps) {
  const isActive = status === 'Active'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}
