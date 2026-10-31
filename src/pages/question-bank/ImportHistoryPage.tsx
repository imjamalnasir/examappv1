import { Link, useNavigate } from 'react-router-dom'
import { Download, Eye } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQuestionImports } from '@/context/QuestionImportContext'
import { downloadImportReport } from '@/modules/question-import/excelWorkbook'
import { formatImportDate } from '@/modules/question-import/importFormat'
import { ImportRecordStatusBadge } from '@/modules/question-import/ImportStatusBadge'

export function ImportHistoryPage() {
  const navigate = useNavigate()
  const { history } = useQuestionImports()

  return (
    <div>
      <PageHeader
        title="Import History"
        description="Review previous question imports, open their details, and download the import report."
        breadcrumbs={[
          { label: 'Question Bank', path: '/question-bank' },
          { label: 'Import Questions', path: '/question-bank/import' },
          { label: 'History' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate('/question-bank/import')}>
            Import Questions
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {history.length === 0 ? (
          <EmptyState
            title="No imports yet"
            description="Completed imports will be listed here."
            action={
              <Button onClick={() => navigate('/question-bank/import')}>Import Questions</Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Import ID</th>
                  <th className="whitespace-nowrap px-4 py-3">File Name</th>
                  <th className="whitespace-nowrap px-4 py-3">Import Date</th>
                  <th className="whitespace-nowrap px-4 py-3">Total Questions</th>
                  <th className="whitespace-nowrap px-4 py-3">Successfully Imported</th>
                  <th className="whitespace-nowrap px-4 py-3">Failed</th>
                  <th className="whitespace-nowrap px-4 py-3">Skipped</th>
                  <th className="whitespace-nowrap px-4 py-3">Imported By</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{record.id}</td>
                    <td className="min-w-44 px-4 py-3 text-slate-700">{record.fileName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatImportDate(record.importDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.totalQuestions}</td>
                    <td className="px-4 py-3 text-slate-700">{record.successfullyImported}</td>
                    <td className="px-4 py-3 text-slate-700">{record.failed}</td>
                    <td className="px-4 py-3 text-slate-700">{record.skipped}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{record.importedBy}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ImportRecordStatusBadge status={record.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/question-bank/import/history/${record.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-sky-700"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Import Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => downloadImportReport(record)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-sky-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
