import { Button } from '@/components/ui/Button'
import { ImportSummaryCards } from '@/modules/question-import/ImportSummaryCards'

interface ConfirmStepProps {
  total: number
  valid: number
  invalid: number
  warnings: number
  onImport: () => void
  onCancel: () => void
}

export function ConfirmStep({ total, valid, invalid, warnings, onImport, onCancel }: ConfirmStepProps) {
  const ready = valid + warnings

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Confirm import</h2>
        <p className="mt-1 text-sm text-slate-500">
          Invalid questions are never saved. Rows with warnings can still be imported. New questions are stored as
          published, and blank Question IDs are generated.
        </p>
      </div>

      <ImportSummaryCards
        items={[
          { label: 'Total Questions in Excel', value: total, tone: 'slate' },
          { label: 'Valid Questions', value: valid, tone: 'emerald' },
          { label: 'Invalid Questions', value: invalid, tone: 'red' },
          { label: 'Questions Ready to Import', value: ready, tone: 'sky' },
        ]}
      />

      {warnings > 0 ? (
        <p className="text-sm text-amber-800">
          {warnings} warning {warnings === 1 ? 'row is' : 'rows are'} included in the ready count. Review them on the
          preview screen if you want to edit or remove them first.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Import valid questions only</h3>
          <p className="mt-2 text-sm text-slate-600">
            Import {ready} {ready === 1 ? 'question' : 'questions'} and skip {invalid} invalid{' '}
            {invalid === 1 ? 'row.' : 'rows.'}
          </p>
          <Button className="mt-4" onClick={onImport} disabled={ready === 0}>
            Import Valid Questions Only
          </Button>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Cancel import</h3>
          <p className="mt-2 text-sm text-slate-600">
            Return to the preview and validation screen. Nothing will be written to the Question Bank.
          </p>
          <Button className="mt-4" variant="secondary" onClick={onCancel}>
            Cancel Import
          </Button>
        </section>
      </div>
    </div>
  )
}
