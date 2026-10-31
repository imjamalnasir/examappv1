import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useCourses } from '@/context/CourseContext'
import { useQuestionImports } from '@/context/QuestionImportContext'
import { useQuestions } from '@/context/QuestionContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { assignQuestionIds, buildQuestionFromRow, toReportRow } from '@/modules/question-import/buildImportedQuestion'
import { ConfirmStep } from '@/modules/question-import/ConfirmStep'
import {
  createTemplateFile,
  downloadErrorReport,
  downloadImportReport,
  downloadQuestionTemplate,
  excelFileError,
  parseQuestionWorkbook,
} from '@/modules/question-import/excelWorkbook'
import { importRecordStatus, wait } from '@/modules/question-import/importFormat'
import { IMPORTED_BY } from '@/modules/question-import/importFields'
import { ImportStepper } from '@/modules/question-import/ImportStepper'
import { PreviewStep } from '@/modules/question-import/PreviewStep'
import { ResultsStep } from '@/modules/question-import/ResultsStep'
import { TemplateStep } from '@/modules/question-import/TemplateStep'
import { UploadStep } from '@/modules/question-import/UploadStep'
import { validateImportRows } from '@/modules/question-import/validateImportRows'
import type { Question } from '@/types/question'
import type { ImportReportRow, ImportRowDraft, ImportWizardStep, QuestionImportRecord } from '@/types/questionImport'
import { todayDateString } from '@/utils/format'

export function QuestionImportPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const { topics } = useTopics()
  const { questions, addQuestions } = useQuestions()
  const { history, recordImport } = useQuestionImports()
  const importingRef = useRef(false)

  const [step, setStep] = useState<ImportWizardStep>(1)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [ignoredColumns, setIgnoredColumns] = useState<string[]>([])
  const [rows, setRows] = useState<ImportRowDraft[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState<QuestionImportRecord | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const validationContext = useMemo(
    () => ({ courses, subjects, topics, questions }),
    [courses, subjects, topics, questions],
  )
  const validated = useMemo(
    () => validateImportRows(rows, validationContext),
    [rows, validationContext],
  )
  const counts = validated.reduce(
    (summary, row) => {
      summary[row.status] += 1
      return summary
    },
    { valid: 0, invalid: 0, warning: 0 },
  )
  const readyCount = counts.valid + counts.warning

  const canOpen = (target: ImportWizardStep) => {
    if (isImporting) {
      return target === step
    }
    if (result) {
      return target === 5
    }
    if (target <= 2) {
      return true
    }
    if (target === 3) {
      return rows.length > 0
    }
    if (target === 4) {
      return readyCount > 0
    }
    return false
  }

  const handleFileChange = (next: File | null) => {
    setFile(next)
    setFileError(null)
    setRows([])
    setIgnoredColumns([])
    setResult(null)
  }

  const handleLoadSample = () => {
    handleFileChange(createTemplateFile())
    toast.success('Sample workbook loaded. Click Upload and Validate.')
  }

  const handleValidate = async () => {
    if (!file) {
      setFileError('Choose an Excel file before validating.')
      return
    }
    const formatError = excelFileError(file)
    if (formatError) {
      setFileError(formatError)
      return
    }

    setIsParsing(true)
    setFileError(null)
    await wait(300)

    try {
      const parsed = parseQuestionWorkbook(await file.arrayBuffer())
      setRows(parsed.rows)
      setIgnoredColumns(parsed.ignoredColumns)
      setResult(null)
      setStep(3)
      toast.success(`Validated ${parsed.rows.length} rows from ${parsed.sheetName}.`)
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'The file could not be validated.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleConfirmImport = async () => {
    if (importingRef.current || readyCount === 0) {
      return
    }
    importingRef.current = true
    setConfirmOpen(false)
    setIsImporting(true)
    setStep(5)
    setProgress(0)
    setProgressLabel('Preparing questions...')

    const ready = validated.filter((row) => row.status !== 'invalid')
    const skipped = validated.filter((row) => row.status === 'invalid')
    const ids = assignQuestionIds(
      ready,
      questions.map((question) => question.id),
    )
    const createdDate = todayDateString()
    const report: ImportReportRow[] = []
    const imported: Question[] = []

    try {
      for (let index = 0; index < ready.length; index += 1) {
        const row = ready[index]
        const questionId = ids.get(row.rowKey) ?? ''
        setProgressLabel(`Processing row ${row.excelRow} (${index + 1} of ${ready.length})`)
        try {
          const question = buildQuestionFromRow(row, questionId, createdDate)
          imported.push(question)
          const generated = row.questionId.trim() === ''
          report.push(
            toReportRow(
              row,
              'imported',
              question.id,
              generated ? `Imported with generated Question ID ${question.id}.` : 'Imported.',
            ),
          )
        } catch (error) {
          report.push(
            toReportRow(
              row,
              'failed',
              questionId,
              error instanceof Error ? error.message : 'The question could not be saved.',
            ),
          )
        }
        setProgress(Math.round(((index + 1) / ready.length) * 100))
        await wait(ready.length > 20 ? 35 : 60)
      }

      skipped.forEach((row) => {
        report.push(
          toReportRow(
            row,
            'skipped',
            row.questionId.trim().toUpperCase(),
            row.errors.map((issue) => issue.message).join(' '),
          ),
        )
      })
      report.sort((left, right) => left.excelRow - right.excelRow)

      addQuestions(imported)
      const failed = report.filter((row) => row.outcome === 'failed').length
      const record = recordImport({
        fileName: file?.name ?? 'questions.xlsx',
        importDate: new Date().toISOString(),
        totalQuestions: rows.length,
        successfullyImported: imported.length,
        failed,
        skipped: skipped.length,
        importedBy: IMPORTED_BY,
        status: importRecordStatus(imported.length, failed, skipped.length),
        reportRows: report,
      })
      setResult(record)

      const summary = [`Imported ${imported.length} questions.`]
      if (skipped.length > 0) {
        summary.push(`${skipped.length} invalid ${skipped.length === 1 ? 'row was' : 'rows were'} skipped.`)
      }
      if (failed > 0) {
        summary.push(`${failed} ${failed === 1 ? 'row' : 'rows'} failed.`)
      }
      if (imported.length === 0) {
        toast.error(summary.join(' '))
      } else {
        toast.success(summary.join(' '))
      }
    } finally {
      setIsImporting(false)
      importingRef.current = false
    }
  }

  const resetImport = () => {
    setStep(2)
    setFile(null)
    setFileError(null)
    setIgnoredColumns([])
    setRows([])
    setResult(null)
    setProgress(0)
    setProgressLabel('')
    setConfirmOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Import Questions"
        description="Upload an Excel file, validate every row, and add the valid questions to the Question Bank."
        breadcrumbs={[
          { label: 'Question Bank', path: '/question-bank' },
          { label: 'Import Questions' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate('/question-bank/import/history')}>
            <History className="h-4 w-4" />
            Import History
          </Button>
        }
      />

      <ImportStepper current={step} canOpen={canOpen} onStepChange={setStep} />

      {step === 1 ? (
        <TemplateStep
          recentImports={history}
          onDownload={() => {
            downloadQuestionTemplate()
            toast.success('Excel template downloaded.')
          }}
          onContinue={() => setStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <UploadStep
          file={file}
          error={fileError}
          isParsing={isParsing}
          onFileChange={handleFileChange}
          onLoadSample={handleLoadSample}
          onValidate={() => {
            void handleValidate()
          }}
          onBack={() => setStep(1)}
        />
      ) : null}

      {step === 3 ? (
        <PreviewStep
          fileName={file?.name ?? 'questions.xlsx'}
          fileSize={file?.size ?? 0}
          ignoredColumns={ignoredColumns}
          rows={validated}
          context={validationContext}
          onEdit={(row) => {
            setRows((current) => current.map((item) => (item.rowKey === row.rowKey ? row : item)))
            toast.success(`Row ${row.excelRow} updated.`)
          }}
          onRemove={(rowKey) => {
            const removed = rows.find((row) => row.rowKey === rowKey)
            setRows((current) => current.filter((row) => row.rowKey !== rowKey))
            if (removed) {
              toast.success(`Row ${removed.excelRow} removed from this import.`)
            }
          }}
          onDownloadErrors={() => downloadErrorReport(validated)}
          onBack={() => setStep(2)}
          onContinue={() => setStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <ConfirmStep
          total={rows.length}
          valid={counts.valid}
          invalid={counts.invalid}
          warnings={counts.warning}
          onImport={() => setConfirmOpen(true)}
          onCancel={() => setStep(3)}
        />
      ) : null}

      {step === 5 ? (
        <ResultsStep
          record={result}
          isImporting={isImporting}
          progress={progress}
          progressLabel={progressLabel}
          onDownload={() => {
            if (result) {
              downloadImportReport(result)
            }
          }}
          onImportAnother={resetImport}
          onBackToBank={() => navigate('/question-bank')}
        />
      ) : null}

      <Modal
        open={confirmOpen}
        title="Confirm import"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleConfirmImport()}>Import Questions</Button>
          </>
        }
      >
        <p>
          Import {readyCount} {readyCount === 1 ? 'question' : 'questions'} into the Question Bank?
          {counts.invalid > 0
            ? ` ${counts.invalid} invalid ${counts.invalid === 1 ? 'row' : 'rows'} will be skipped.`
            : ' Every row in this file is ready.'}
        </p>
      </Modal>
    </div>
  )
}
