import type { ExamFormErrors, ExamFormValues } from '@/types/exam'

const rows: { label: string; final: keyof ExamFormValues; draft: keyof ExamFormValues }[] = [
  { label: 'Total Questions', final: 'finalTotal', draft: 'draftTotal' },
  { label: 'Subjective Questions', final: 'finalSubjective', draft: 'draftSubjective' },
  { label: 'Objective Questions', final: 'finalObjective', draft: 'draftObjective' },
]

function readCount(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) {
    return null
  }
  return Number(value.trim())
}

function distributionLine(total: number | null, subjective: number | null, objective: number | null): string {
  if (total === null || subjective === null || objective === null) {
    return 'Enter all three counts to see this distribution.'
  }
  const assigned = subjective + objective
  const remainder = total - assigned
  if (remainder > 0) {
    return `${total} total · ${subjective} subjective · ${objective} objective · ${remainder} still unassigned`
  }
  if (remainder < 0) {
    return `${total} total · ${subjective} subjective · ${objective} objective · ${Math.abs(remainder)} over the total`
  }
  return `${total} total · ${subjective} subjective · ${objective} objective`
}

export function QuestionConfigFields({
  values,
  errors,
  onChange,
}: {
  values: ExamFormValues
  errors: ExamFormErrors
  onChange: (field: keyof ExamFormValues, value: string) => void
}) {
  const finalLine = distributionLine(
    readCount(values.finalTotal),
    readCount(values.finalSubjective),
    readCount(values.finalObjective),
  )
  const draftLine = distributionLine(
    readCount(values.draftTotal),
    readCount(values.draftSubjective),
    readCount(values.draftObjective),
  )
  const finalRemainder =
    readCount(values.finalTotal) !== null &&
    readCount(values.finalSubjective) !== null &&
    readCount(values.finalObjective) !== null
      ? (readCount(values.finalTotal) ?? 0) -
        (readCount(values.finalSubjective) ?? 0) -
        (readCount(values.finalObjective) ?? 0)
      : 0
  const draftRemainder =
    readCount(values.draftTotal) !== null &&
    readCount(values.draftSubjective) !== null &&
    readCount(values.draftObjective) !== null
      ? (readCount(values.draftTotal) ?? 0) -
        (readCount(values.draftSubjective) ?? 0) -
        (readCount(values.draftObjective) ?? 0)
      : 0

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Question Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Final questions make up the paper students sit. Draft questions are a separate reserve.
          Subjective and objective counts cannot exceed the total, and they must add up to it.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide">
              <th className="px-4 py-3 text-slate-500">Question Type</th>
              <th className="bg-sky-50 px-4 py-3 text-sky-800">Final Questions</th>
              <th className="bg-violet-50 px-4 py-3 text-violet-800">Draft Questions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.label}>
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-slate-800">
                  {row.label}
                </th>
                {([row.final, row.draft] as const).map((field) => {
                  const error = errors[field]
                  return (
                    <td key={field} className="px-4 py-3">
                      <input
                        inputMode="numeric"
                        aria-label={`${row.label}, ${field.startsWith('draft') ? 'draft' : 'final'}`}
                        aria-invalid={Boolean(error)}
                        value={values[field]}
                        onChange={(event) => onChange(field, event.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                        className={`h-10 w-full max-w-36 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sky-600/20 ${
                          error ? 'border-red-400' : 'border-slate-300 focus:border-sky-600'
                        }`}
                      />
                      {error ? <p className="mt-1 max-w-48 text-xs text-red-600">{error}</p> : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors.questionConfig ? <p className="text-sm text-red-600">{errors.questionConfig}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Final paper</p>
          <p className={`mt-2 text-sm ${finalRemainder < 0 ? 'text-rose-700' : 'text-sky-950'}`}>{finalLine}</p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Draft reserve</p>
          <p className={`mt-2 text-sm ${draftRemainder < 0 ? 'text-rose-700' : 'text-violet-950'}`}>{draftLine}</p>
        </div>
      </div>
    </section>
  )
}
