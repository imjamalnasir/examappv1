import type { ReactNode } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { useExams } from '@/context/ExamContext'
import { examActionHint, stageIndicator, type StageIndicator } from '@/modules/exams/examRules'
import { EXAM_WORKFLOW_STAGES, type Exam, type ExamWorkflowStage } from '@/types/exam'

const stageCopy: Record<ExamWorkflowStage, string> = {
  Initiated: 'Exam created',
  Forwarded: 'Questions added',
  'Forwarded to Approval': 'Awaiting review',
  Approved: 'Paper locked',
}

const indicatorClasses: Record<StageIndicator, string> = {
  complete: 'bg-emerald-600 text-white',
  active: 'bg-sky-700 text-white',
  pending: 'bg-slate-100 text-slate-500',
  rejected: 'bg-rose-600 text-white',
  returned: 'bg-orange-500 text-white',
}

export function ExamWorkflowStepper({ exam, children }: { exam: Exam; children?: ReactNode }) {
  const { role } = useExams()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Examination workflow</h2>
          <p className="mt-1 text-sm text-slate-500">{examActionHint(exam, role)}</p>
        </div>
      </div>
      <ol className="flex gap-2 overflow-x-auto">
        {EXAM_WORKFLOW_STAGES.map((stage, index) => {
          const indicator = stageIndicator(exam.status, stage)
          const showCheck =
            indicator === 'complete' || (indicator === 'active' && exam.status === 'Approved')
          return (
            <li key={stage} className="flex min-w-44 flex-1 items-center gap-2">
              <div
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 ${
                  indicator === 'active' ? 'bg-sky-50' : ''
                }`}
                aria-current={indicator === 'active' ? 'step' : undefined}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${indicatorClasses[indicator]}`}
                >
                  {showCheck ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : indicator === 'rejected' ? (
                    <X className="h-3.5 w-3.5" />
                  ) : indicator === 'returned' ? (
                    <RotateCcw className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">{stage}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {indicator === 'rejected'
                      ? 'Rejected'
                      : indicator === 'returned'
                        ? 'Returned for revision'
                        : stageCopy[stage]}
                  </span>
                </span>
              </div>
              {index < EXAM_WORKFLOW_STAGES.length - 1 ? (
                <span className="hidden h-px w-3 shrink-0 bg-slate-200 sm:block" />
              ) : null}
            </li>
          )
        })}
      </ol>
      {children ? <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{children}</div> : null}
    </section>
  )
}
