import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { ImportOutcomeBadge } from '@/modules/question-import/ImportStatusBadge'
import { ImportSummaryCards } from '@/modules/question-import/ImportSummaryCards'
import { IMPORT_PAGE_SIZE } from '@/modules/question-import/importFields'
import type { ImportOutcome, QuestionImportRecord } from '@/types/questionImport'

interface ResultsStepProps {
  record: QuestionImportRecord | null
  isImporting: boolean
  progress: number
  progressLabel: string
  onDownload: () => void
  onImportAnother: () => void
  onBackToBank: () => void
}

type OutcomeFilter = 'all' | ImportOutcome

function clip(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= 90) {
    return clean || '—'
  }
  return `${clean.slice(0, 90).trimEnd()}…`
}

export function ResultsStep({
  record,
  isImporting,
  progress,
  progressLabel,
  onDownload,
  onImportAnother,
  onBackToBank,
}: ResultsStepProps) {
  const [filter, setFilter] = useState<OutcomeFilter>('all')
  const [page, setPage] = useState(1)

  const failedRows = record?.reportRows.filter((row) => row.outcome === 'failed') ?? []
  const filtered = useMemo(() => {
    if (!record) {
      return []
    }
    if (filter === 'all') {
      return record.reportRows
    }
    return record.reportRows.filter((row) => row.outcome === filter)
  }, [filter, record])

  const start = (page - 1) * IMPORT_PAGE_SIZE
  const pageRows = filtered.slice(start, start + IMPORT_PAGE_SIZE)

  if (isImporting || !record) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6" aria-live="polite">
        <h2 className="text-base font-semibold text-slate-900">Importing questions</h2>
        <p className="mt-1 text-sm text-slate-500">{progressLabel || 'Preparing the Question Bank...'}</p>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Import progress"
        >
          <div className="h-full rounded-full bg-sky-700 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm font-medium text-slate-700">{progress}%</p>
      </section>
    )
  }

  const filters: { id: OutcomeFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'imported', label: 'Imported' },
    { id: 'failed', label: 'Failed' },
    { id: 'skipped', label: 'Skipped' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Import results</h2>
        <p className="mt-1 text-sm text-slate-500">
          {record.fileName} · {record.id}
        </p>
      </div>

      <ImportSummaryCards
        items={[
          { label: 'Total Rows Processed', value: record.totalQuestions, tone: 'slate' },
          { label: 'Successfully Imported', value: record.successfullyImported, tone: 'emerald' },
          { label: 'Failed Imports', value: record.failed, tone: 'red' },
          { label: 'Skipped Rows', value: record.skipped, tone: 'amber' },
        ]}
      />

      {failedRows.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800">Failed imports</h3>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {failedRows.map((row) => (
              <li key={`${row.excelRow}-${row.message}`}>
                Row {row.excelRow}: {row.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          No questions failed during import.
          {record.skipped > 0
            ? ` ${record.skipped} invalid ${record.skipped === 1 ? 'row was' : 'rows were'} skipped.`
            : ''}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilter(item.id)
                setPage(1)
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === item.id ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Excel Row</th>
                <th className="px-4 py-3">Question ID</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No rows in this result.
                  </td>
                </tr>
              ) : null}
              {pageRows.map((row) => (
                <tr key={`${row.excelRow}-${row.outcome}-${row.questionId}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.excelRow}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.outcome === 'imported' && row.questionId ? (
                      <Link to={`/question-bank/${row.questionId}`} className="font-medium text-sky-700 hover:text-sky-800">
                        {row.questionId}
                      </Link>
                    ) : (
                      <span className="text-slate-600">{row.questionId || '—'}</span>
                    )}
                  </td>
                  <td className="min-w-56 max-w-sm px-4 py-3 text-slate-700">{clip(row.questionText)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <ImportOutcomeBadge outcome={row.outcome} />
                  </td>
                  <td className="min-w-48 px-4 py-3 text-slate-600">{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={IMPORT_PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <Button variant="secondary" onClick={onBackToBank}>
          Back to Question Bank
        </Button>
        <Button variant="secondary" onClick={onImportAnother}>
          Import Another File
        </Button>
        <Button variant="secondary" onClick={onDownload}>
          Download Import Report
        </Button>
        <Button onClick={onBackToBank}>View Imported Questions</Button>
      </div>
    </div>
  )
}
