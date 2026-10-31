import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatFileSize } from '@/modules/question-import/importFormat'

interface UploadStepProps {
  file: File | null
  error: string | null
  isParsing: boolean
  onFileChange: (file: File | null) => void
  onLoadSample: () => void
  onValidate: () => void
  onBack: () => void
}

export function UploadStep({
  file,
  error,
  isParsing,
  onFileChange,
  onLoadSample,
  onValidate,
  onBack,
}: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const openPicker = () => {
    inputRef.current?.click()
  }

  const takeFile = (next: File | undefined) => {
    if (!next) {
      return
    }
    onFileChange(next)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Upload Excel file</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a .xlsx or .xls file using the template columns. Validation runs before any question is saved.
        </p>

        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            takeFile(event.dataTransfer.files[0])
          }}
          className={`mt-4 rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
            isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900">Drag and drop an Excel file here</p>
          <p className="mt-1 text-sm text-slate-500">.xlsx or .xls, up to 5 MB and 2,000 questions</p>
          <Button className="mt-4" variant="secondary" onClick={openPicker}>
            <Upload className="h-4 w-4" />
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => {
              takeFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </div>

        {file ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={openPicker}>
                Replace File
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onFileChange(null)}>
                Remove File
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" onClick={onLoadSample} disabled={isParsing}>
            Load sample workbook
          </Button>
          <p className="text-xs text-slate-500">
            The sample is the Excel template, including valid questions and rows that fail validation.
          </p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack} disabled={isParsing}>
          Back
        </Button>
        <Button onClick={onValidate} disabled={!file || isParsing}>
          {isParsing ? 'Validating...' : 'Upload and Validate'}
        </Button>
      </div>
    </div>
  )
}
