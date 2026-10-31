import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQuestionImports } from '@/context/QuestionImportContext'
import { useQuestions } from '@/context/QuestionContext'
import { downloadImportReport } from '@/modules/question-import/excelWorkbook'
import { formatImportDate } from '@/modules/question-import/importFormat'
import { ImportOutcomeBadge, ImportRecordStatusBadge } from '@/modules/question-import/ImportStatusBadge'
import { ImportSummaryCards } from '@/modules/question-import/ImportSummaryCards'

export function ImportHistoryDetailPage() {
  const navigate = useNavigate()
  const { importId = '' } = useParams()
  const { getImport } = useQuestionImports()
  const { getById } = useQuestions()
  const record = getImport(importId)

  if (!record) {
    return (
      <div>
        <PageHeader
          title="Import Details"
          breadcrumbs={[
            { label: 'Question Bank', path: '/question-bank' },
            { label: 'Import History', path: '/question-bank/import/history' },
            { label: 'Not Found' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white">
          <EmptyState
            title="Import not found"
            description="This import is not in the current history."
            action={
              <Button variant="secondary" onClick={() => navigate('/question-bank/import/history')}>
                Back to Import History
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const failedRows = record.reportRows.filter((row) => row.outcome === 'failed')

  return (
    <div>
      <PageHeader
        title={record.id}
        description={`${record.fileName} · ${formatImportDate(record.importDate)} · ${record.importedBy}`}
        breadcrumbs={[
          { label: 'Question Bank', path: '/question-bank' },
          { label: 'Import History', path: '/question-bank/import/history' },
          { label: record.id },
        ]}
        actions={
          <>
            <ImportRecordStatusBadge status={record.status} />
            <Button variant="secondary" onClick={() => downloadImportReport(record)}>
              Download Report
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <ImportSummaryCards
          items={[
            { label: 'Total Questions', value: record.totalQuestions, tone: 'slate' },
            { label: 'Successfully Imported', value: record.successfullyImported, tone: 'emerald' },
            { label: 'Failed', value: record.failed, tone: 'red' },
            { label: 'Skipped', value: record.skipped, tone: 'amber' },
          ]}
        />

        {failedRows.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h2 className="text-sm font-semibold text-red-800">Failed imports</h2>
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {failedRows.map((row) => (
                <li key={`${row.excelRow}-${row.message}`}>
                  Row {row.excelRow}: {row.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Excel Row</th>
                  <th className="px-4 py-3">Question ID</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.reportRows.map((row) => (
                  <tr key={`${row.excelRow}-${row.outcome}`}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.excelRow}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.outcome === 'imported' && row.questionId && getById(row.questionId) ? (
                        <Link
                          to={`/question-bank/${row.questionId}`}
                          className="font-medium text-sky-700 hover:text-sky-800"
                        >
                          {row.questionId}
                        </Link>
                      ) : (
                        <span className="text-slate-600">{row.questionId || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.course || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.topic || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.questionType || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ImportOutcomeBadge outcome={row.outcome} />
                    </td>
                    <td className="min-w-56 px-4 py-3 text-slate-600">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => navigate('/question-bank/import/history')}>
            Back to Import History
          </Button>
        </div>
      </div>
    </div>
  )
}
