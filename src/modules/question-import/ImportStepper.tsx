import { Check } from 'lucide-react'
import type { ImportWizardStep } from '@/types/questionImport'

const STEPS: { id: ImportWizardStep; label: string }[] = [
  { id: 1, label: 'Download Template' },
  { id: 2, label: 'Upload Excel' },
  { id: 3, label: 'Preview & Validate' },
  { id: 4, label: 'Confirm Import' },
  { id: 5, label: 'Import Results' },
]

interface ImportStepperProps {
  current: ImportWizardStep
  canOpen: (step: ImportWizardStep) => boolean
  onStepChange: (step: ImportWizardStep) => void
}

export function ImportStepper({ current, canOpen, onStepChange }: ImportStepperProps) {
  return (
    <ol className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">
      {STEPS.map((step, index) => {
        const complete = step.id < current
        const active = step.id === current
        const enabled = canOpen(step.id)
        return (
          <li key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!enabled}
              aria-current={active ? 'step' : undefined}
              onClick={() => onStepChange(step.id)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left disabled:cursor-not-allowed ${
                active ? 'bg-sky-50' : 'hover:bg-slate-50 disabled:hover:bg-transparent'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? 'bg-sky-700 text-white'
                    : complete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {complete ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span className={`whitespace-nowrap text-sm font-medium ${active ? 'text-sky-900' : 'text-slate-700'}`}>
                {step.label}
              </span>
            </button>
            {index < STEPS.length - 1 ? <span className="hidden h-px w-4 bg-slate-200 sm:block" /> : null}
          </li>
        )
      })}
    </ol>
  )
}
