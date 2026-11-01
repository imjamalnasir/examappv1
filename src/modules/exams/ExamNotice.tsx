import type { ReactNode } from 'react'
import { AlertTriangle, Info, XCircle } from 'lucide-react'

type ExamNoticeTone = 'info' | 'warning' | 'error'

const toneClasses: Record<ExamNoticeTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-rose-200 bg-rose-50 text-rose-950',
}

const iconClasses: Record<ExamNoticeTone, string> = {
  info: 'text-sky-700',
  warning: 'text-amber-700',
  error: 'text-rose-700',
}

export function ExamNotice({
  tone,
  title,
  description,
  action,
}: {
  tone: ExamNoticeTone
  title: string
  description: string
  action?: ReactNode
}) {
  const Icon = tone === 'error' ? XCircle : tone === 'warning' ? AlertTriangle : Info

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses[tone]}`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClasses[tone]}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}
