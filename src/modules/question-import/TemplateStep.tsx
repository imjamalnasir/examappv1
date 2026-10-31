import { Download, FileSpreadsheet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ImportRecordStatusBadge } from '@/modules/question-import/ImportStatusBadge'
import { QUESTION_IMPORT_SEEDS } from '@/modules/question-import/sampleRows'
import { formatImportDate } from '@/modules/question-import/importFormat'
import type { QuestionImportRecord } from '@/types/questionImport'

interface TemplateStepProps {
  recentImports: QuestionImportRecord[]
  onDownload: () => void
  onContinue: () => void
}

const TYPE_GUIDES = [
  {
    title: 'True / False',
    body: 'Set Question Type to T/F. Question text is required, and Correct Answer must be True or False. Leave the option columns empty.',
  },
  {
    title: 'MCQs',
    body: 'Set Question Type to MCQs. Add at least two options. Correct Answer uses A, B, C, or D, and multiple answers are separated by commas, such as A,C.',
  },
  {
    title: 'Subjective',
    body: 'Set Question Type to Subjective. Question text is required. Model Answer, Answer Guidelines, and Marks are optional. Marks must be a positive number when used.',
  },
]

export function TemplateStep({ recentImports, onDownload, onContinue }: TemplateStepProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Download Excel template</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                The template has the required column headers, an instructions sheet, and example rows for
                true/false, MCQ, and subjective questions. Some examples are intentionally invalid so you can
                preview validation before a real import.
              </p>
            </div>
          </div>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download Excel Template
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Template instructions</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Keep the header row on the Questions sheet. Do not insert a title row above it.</li>
          <li>Course must match an existing course name, code, or ID. Topic must match an existing topic name or ID.</li>
          <li>The topic must belong to that course. Import does not create courses or topics.</li>
          <li>Question ID is optional. A blank ID is generated when the row is imported.</li>
          <li>Difficulty Level must be Easy, Medium, or Hard.</li>
          <li>One file can mix true/false, MCQ, and subjective questions.</li>
        </ul>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {TYPE_GUIDES.map((guide) => (
          <article key={guide.title} className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">{guide.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{guide.body}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Example rows in the template</h2>
          <p className="mt-1 text-sm text-slate-500">
            Excel row 1 is the header. These notes describe the sample questions that follow it.
          </p>
        </div>
        <div className="max-h-80 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Excel Row</th>
                <th className="px-4 py-3">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {QUESTION_IMPORT_SEEDS.map((item, index) => (
                <tr key={item.guide}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{index + 2}</td>
                  <td className="px-4 py-3 text-slate-600">{item.guide}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {recentImports.length > 0 ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Recent imports</h2>
            <Link to="/question-bank/import/history" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View import history
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Import ID</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Import Date</th>
                  <th className="px-4 py-3">Imported</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentImports.slice(0, 3).map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/question-bank/import/history/${record.id}`}
                        className="font-medium text-sky-700 hover:text-sky-800"
                      >
                        {record.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.fileName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatImportDate(record.importDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.successfullyImported}</td>
                    <td className="px-4 py-3">
                      <ImportRecordStatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={onContinue}>Continue to Upload</Button>
      </div>
    </div>
  )
}
