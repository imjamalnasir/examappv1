import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { ImportRowStatusBadge } from '@/modules/question-import/ImportStatusBadge'
import { ImportSummaryCards } from '@/modules/question-import/ImportSummaryCards'
import { RowEditorDialog } from '@/modules/question-import/RowEditorDialog'
import { IMPORT_PAGE_SIZE } from '@/modules/question-import/importFields'
import { formatFileSize } from '@/modules/question-import/importFormat'
import { parseMcqAnswerLabels, type ImportValidationContext } from '@/modules/question-import/validateImportRows'
import { DifficultyBadge, QuestionTypeBadge } from '@/modules/question-bank/QuestionBadges'
import type { ImportField, ImportRowDraft, ImportRowStatus, ValidatedImportRow } from '@/types/questionImport'

interface PreviewStepProps {
  fileName: string
  fileSize: number
  ignoredColumns: string[]
  rows: ValidatedImportRow[]
  context: ImportValidationContext
  onEdit: (row: ImportRowDraft) => void
  onRemove: (rowKey: string) => void
  onDownloadErrors: () => void
  onBack: () => void
  onContinue: () => void
}

type StatusFilter = 'all' | ImportRowStatus

function clip(text: string, max = 110): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) {
    return '—'
  }
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean
}

function fieldClass(row: ValidatedImportRow, field: ImportField): string {
  if (row.errors.some((issue) => issue.field === field)) {
    return 'border-red-300 bg-red-50'
  }
  if (row.warnings.some((issue) => issue.field === field)) {
    return 'border-amber-300 bg-amber-50'
  }
  return 'border-slate-200 bg-slate-50'
}

function DetailPanel({ row }: { row: ValidatedImportRow }) {
  const options = [
    ['A', row.optionA],
    ['B', row.optionB],
    ['C', row.optionC],
    ['D', row.optionD],
  ] as const
  const correctLabels =
    row.normalizedType === 'mcq' ? new Set(parseMcqAnswerLabels(row.correctAnswer).unique) : new Set<string>()

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className={`rounded-md border px-3 py-2 ${fieldClass(row, 'questionText')}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Question Text</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{row.questionText || '—'}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`rounded-md border px-3 py-2 ${fieldClass(row, 'course')}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Course</p>
            <p className="mt-1 text-sm text-slate-800">{row.course || '—'}</p>
            {row.resolvedCourseLabel ? (
              <p className="mt-1 text-xs text-slate-500">Matched {row.resolvedCourseLabel}</p>
            ) : null}
          </div>
          <div className={`rounded-md border px-3 py-2 ${fieldClass(row, 'topic')}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Topic</p>
            <p className="mt-1 text-sm text-slate-800">{row.topic || '—'}</p>
            {row.resolvedTopicLabel ? (
              <p className="mt-1 text-xs text-slate-500">Matched {row.resolvedTopicLabel}</p>
            ) : null}
          </div>
        </div>
        {row.normalizedType === 'mcq' ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Options</p>
            <ul className="space-y-2">
              {options.map(([label, text]) => (
                <li
                  key={label}
                  className={`rounded-md border px-3 py-2 text-sm ${fieldClass(row, `option${label}` as ImportField)}`}
                >
                  <span className="font-medium text-slate-900">{label}.</span>{' '}
                  <span className="text-slate-700">{text || 'Empty'}</span>
                  {correctLabels.has(label) && text.trim() ? (
                    <span className="ml-2 text-xs font-medium text-emerald-700">Correct</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        <div className={`rounded-md border px-3 py-2 ${fieldClass(row, 'correctAnswer')}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Correct Answer</p>
          <p className="mt-1 text-sm text-slate-800">{row.correctAnswer || '—'}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Explanation</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{row.explanation || '—'}</p>
        </div>
        <div className={`rounded-md border px-3 py-2 ${fieldClass(row, 'modelAnswer')}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Model Answer</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{row.modelAnswer || '—'}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Answer Guidelines</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{row.answerGuidelines || '—'}</p>
        </div>
        <div className={`rounded-md border px-3 py-2 ${fieldClass(row, 'marks')}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Marks</p>
          <p className="mt-1 text-sm text-slate-800">{row.marks || '—'}</p>
        </div>
        {row.errors.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-red-700">
            {row.errors.map((issue) => (
              <li key={issue.message}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
        {row.warnings.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-amber-800">
            {row.warnings.map((issue) => (
              <li key={issue.message}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export function PreviewStep({
  fileName,
  fileSize,
  ignoredColumns,
  rows,
  context,
  onEdit,
  onRemove,
  onDownloadErrors,
  onBack,
  onContinue,
}: PreviewStepProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [removeKey, setRemoveKey] = useState<string | null>(null)

  const counts = useMemo(
    () =>
      rows.reduce(
        (summary, row) => {
          summary[row.status] += 1
          return summary
        },
        { valid: 0, invalid: 0, warning: 0 },
      ),
    [rows],
  )
  const ready = counts.valid + counts.warning

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) {
        return false
      }
      if (!query) {
        return true
      }
      const haystack = [
        row.questionId,
        row.course,
        row.topic,
        row.questionText,
        row.questionType,
        row.difficulty,
        ...row.errors.map((issue) => issue.message),
        ...row.warnings.map((issue) => issue.message),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [filter, rows, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / IMPORT_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * IMPORT_PAGE_SIZE
  const pageRows = filtered.slice(start, start + IMPORT_PAGE_SIZE)
  const editingRow = rows.find((row) => row.rowKey === editingKey)
  const removingRow = rows.find((row) => row.rowKey === removeKey)

  const filters: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: rows.length },
    { id: 'valid', label: 'Valid', count: counts.valid },
    { id: 'invalid', label: 'Invalid', count: counts.invalid },
    { id: 'warning', label: 'Warning', count: counts.warning },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Preview and validation</h2>
          <p className="text-sm text-slate-500">
            {fileName} · {formatFileSize(fileSize)}
          </p>
        </div>
        <p className="text-sm text-slate-600">
          {ready} {ready === 1 ? 'question is' : 'questions are'} ready to import.
        </p>
      </div>

      <ImportSummaryCards
        items={[
          { label: 'Total Rows', value: rows.length, tone: 'slate' },
          { label: 'Valid Questions', value: counts.valid, tone: 'emerald' },
          { label: 'Invalid Questions', value: counts.invalid, tone: 'red' },
          { label: 'Warning Rows', value: counts.warning, tone: 'amber' },
        ]}
      />

      {ignoredColumns.length > 0 ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Unrecognized columns were ignored: {ignoredColumns.join(', ')}.
        </p>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
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
                {item.label} ({item.count})
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search question text, ID, course, or topic"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 lg:max-w-sm"
            aria-label="Search import rows"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No rows left to import"
            description="Every row was removed. Upload the file again to start over."
            action={
              <Button variant="secondary" onClick={onBack}>
                Upload another file
              </Button>
            }
          />
        ) : pageRows.length === 0 ? (
          <EmptyState title="No matching rows" description="Try another status or search." />
        ) : (
          <>
            <div className="max-h-[32rem] overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Excel Row</th>
                    <th className="whitespace-nowrap px-4 py-3">Question ID</th>
                    <th className="whitespace-nowrap px-4 py-3">Course</th>
                    <th className="whitespace-nowrap px-4 py-3">Topic</th>
                    <th className="whitespace-nowrap px-4 py-3">Question Type</th>
                    <th className="whitespace-nowrap px-4 py-3">Difficulty</th>
                    <th className="whitespace-nowrap px-4 py-3">Question Text</th>
                    <th className="whitespace-nowrap px-4 py-3">Validation Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((row) => {
                    const open = expandedKey === row.rowKey
                    const rowTint =
                      row.status === 'invalid' ? 'bg-red-50/70' : row.status === 'warning' ? 'bg-amber-50/70' : ''
                    return (
                      <Fragment key={row.rowKey}>
                        <tr className={rowTint}>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.excelRow}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                            {row.questionId.trim() || <span className="text-slate-400">Auto</span>}
                          </td>
                          <td className="min-w-36 max-w-48 px-4 py-3 text-slate-700">{row.course || '—'}</td>
                          <td className="min-w-36 max-w-48 px-4 py-3 text-slate-700">{row.topic || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {row.normalizedType ? (
                              <QuestionTypeBadge type={row.normalizedType} />
                            ) : (
                              <span className="text-slate-700">{row.questionType || '—'}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {row.normalizedDifficulty ? (
                              <DifficultyBadge level={row.normalizedDifficulty} />
                            ) : (
                              <span className="text-slate-700">{row.difficulty || '—'}</span>
                            )}
                          </td>
                          <td className="min-w-64 max-w-sm px-4 py-3">
                            <p className="line-clamp-2 text-slate-800" title={row.questionText}>
                              {clip(row.questionText)}
                            </p>
                            {row.errors.slice(0, 2).map((issue) => (
                              <p key={issue.message} className="mt-1 text-xs text-red-700">
                                {issue.message}
                              </p>
                            ))}
                            {row.warnings.slice(0, 2).map((issue) => (
                              <p key={issue.message} className="mt-1 text-xs text-amber-800">
                                {issue.message}
                              </p>
                            ))}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <ImportRowStatusBadge status={row.status} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setExpandedKey(open ? null : row.rowKey)}
                                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                                aria-expanded={open}
                                aria-label={`${open ? 'Hide' : 'View'} details for row ${row.excelRow}`}
                                title="View question"
                              >
                                {open ? <ChevronDown className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingKey(row.rowKey)}
                                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                                aria-label={`Edit row ${row.excelRow}`}
                                title="Edit row"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRemoveKey(row.rowKey)}
                                className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label={`Remove row ${row.excelRow}`}
                                title="Remove row"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {open ? (
                          <tr className={rowTint}>
                            <td colSpan={9} className="px-4 py-4">
                              <DetailPanel row={row} />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              pageSize={IMPORT_PAGE_SIZE}
              totalItems={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={onDownloadErrors} disabled={counts.invalid === 0}>
            <Download className="h-4 w-4" />
            Download Error Report
          </Button>
          <Button onClick={onContinue} disabled={ready === 0}>
            Continue to Import
          </Button>
        </div>
      </div>

      {editingRow ? (
        <RowEditorDialog
          source={editingRow}
          rows={rows}
          context={context}
          onClose={() => setEditingKey(null)}
          onSave={(row) => {
            onEdit(row)
            setEditingKey(null)
          }}
        />
      ) : null}

      <Modal
        open={Boolean(removingRow)}
        title="Remove row"
        onClose={() => setRemoveKey(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveKey(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (removingRow) {
                  onRemove(removingRow.rowKey)
                }
                setRemoveKey(null)
                setExpandedKey(null)
              }}
            >
              Remove Row
            </Button>
          </>
        }
      >
        <p>
          Remove Excel row {removingRow?.excelRow} from this import? The question will not be saved, and the
          spreadsheet file itself will not change.
        </p>
      </Modal>
    </div>
  )
}
