import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useAcademics } from '@/context/AcademicContext'
import { useQuestions } from '@/context/QuestionContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { DifficultyBadge, QuestionTypeBadge } from '@/modules/question-bank/QuestionBadges'
import { QuestionContentView } from '@/modules/question-bank/QuestionContentView'
import { ClassificationBadge, ExamStatusBadge, ExamTypeBadge } from '@/modules/exams/ExamStatusBadge'
import { EXAM_WORKFLOW_LABELS } from '@/modules/exams/examLabels'
import {
  checkSelection,
  resolveExamQuestionMeta,
  summarizeSelection,
  type SelectionSummary,
} from '@/modules/exams/examRules'
import { useExamLabels } from '@/modules/exams/useExamLabels'
import type { Exam, ExamWorkflowAction, QuestionConfiguration } from '@/types/exam'
import { DraftBadge } from '@/components/ui/AcademicStatusBadge'
import { formatDate, formatDateTime } from '@/utils/format'
import { previewText } from '@/utils/richText'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

function CountCells({
  requiredFinal,
  selectedFinal,
  requiredDraft,
  selectedDraft,
}: {
  requiredFinal: number
  selectedFinal: number
  requiredDraft: number
  selectedDraft: number
}) {
  const cells = [
    { required: requiredFinal, selected: selectedFinal },
    { required: requiredDraft, selected: selectedDraft },
  ]
  return cells.map((cell) => {
    const matched = cell.required === cell.selected
    return (
      <td
        key={`${cell.required}-${cell.selected}-${matched ? 'ok' : 'gap'}-${cell === cells[0] ? 'final' : 'draft'}`}
        className={`px-4 py-3 ${matched ? 'text-slate-800' : 'font-semibold text-rose-700'}`}
      >
        {cell.selected}
        <span className="font-normal text-slate-400"> / {cell.required}</span>
      </td>
    )
  })
}

export function QuestionDistribution({
  config,
  summary,
  totalMarks,
}: {
  config: QuestionConfiguration
  summary: SelectionSummary
  totalMarks: number
}) {
  const marksMatch = summary.totalMarks === totalMarks
  const rows = [
    {
      label: 'Total questions',
      requiredFinal: config.finalTotal,
      selectedFinal: summary.finalTotal,
      requiredDraft: config.draftTotal,
      selectedDraft: summary.draftTotal,
    },
    {
      label: 'Subjective questions',
      requiredFinal: config.finalSubjective,
      selectedFinal: summary.finalSubjective,
      requiredDraft: config.draftSubjective,
      selectedDraft: summary.draftSubjective,
    },
    {
      label: 'Objective questions',
      requiredFinal: config.finalObjective,
      selectedFinal: summary.finalObjective,
      requiredDraft: config.draftObjective,
      selectedDraft: summary.draftObjective,
    },
  ]

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Distribution</th>
            <th className="px-4 py-3">Final selected / required</th>
            <th className="px-4 py-3">Draft selected / required</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="px-4 py-3 text-left font-medium text-slate-800">{row.label}</th>
              <CountCells
                requiredFinal={row.requiredFinal}
                selectedFinal={row.selectedFinal}
                requiredDraft={row.requiredDraft}
                selectedDraft={row.selectedDraft}
              />
            </tr>
          ))}
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-800">Marks</th>
            <td colSpan={2} className={`px-4 py-3 ${marksMatch ? 'text-slate-800' : 'font-semibold text-rose-700'}`}>
              {summary.totalMarks}
              <span className="font-normal text-slate-400"> / {totalMarks}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function ExamInformationPanel({ exam }: { exam: Exam }) {
  const labels = useExamLabels(exam)

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Exam Information</h2>
          <p className="mt-1 text-sm text-slate-500">Identity, schedule, and ownership of this paper.</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <ExamStatusBadge status={exam.status} />
          {exam.isDraft ? <DraftBadge /> : null}
          {exam.revisionOpen ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Revision open
            </span>
          ) : null}
        </div>
      </div>
      <dl className="grid gap-6 p-5 sm:grid-cols-2">
        <Field label="Exam ID" value={exam.id} />
        <Field label="Exam Name" value={exam.name} />
        <Field label="Academic" value={labels.academicName} />
        <Field label="Course" value={labels.courseName} />
        <Field label="Semester" value={labels.semesterName} />
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Exam Type</dt>
          <dd className="mt-1">
            <ExamTypeBadge type={exam.examType} />
          </dd>
        </div>
        <Field label="Exam Date" value={formatDate(exam.examDate)} />
        <Field label="Teacher" value={labels.teacherName} />
        <Field label="Total Marks" value={String(exam.totalMarks)} />
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Remarks</dt>
          <dd className="mt-1 text-sm leading-6 text-slate-700">{exam.remarks || 'No remarks provided.'}</dd>
        </div>
      </dl>
    </section>
  )
}

export function ExamConfigurationPanel({ exam }: { exam: Exam }) {
  const config = exam.questionConfig
  const items = [
    { label: 'Total Final Questions', value: config.finalTotal },
    { label: 'Total Draft Questions', value: config.draftTotal },
    { label: 'Subjective Final Questions', value: config.finalSubjective },
    { label: 'Subjective Draft Questions', value: config.draftSubjective },
    { label: 'Objective Final Questions', value: config.finalObjective },
    { label: 'Objective Draft Questions', value: config.draftObjective },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Question Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Required final and draft counts. Subjective and objective questions are tracked separately.
        </p>
      </div>
      <dl className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Field key={item.label} label={item.label} value={String(item.value)} />
        ))}
      </dl>
    </section>
  )
}

const dotClasses: Record<ExamWorkflowAction, string> = {
  Created: 'bg-sky-600',
  Updated: 'bg-slate-400',
  'Questions Added': 'bg-indigo-600',
  'Questions Updated': 'bg-indigo-400',
  'Forwarded to Approval': 'bg-amber-500',
  Approved: 'bg-emerald-600',
  Rejected: 'bg-rose-600',
  'Returned for Revision': 'bg-orange-500',
  'Revision Started': 'bg-amber-600',
}

export function ExamWorkflowTimeline({ exam }: { exam: Exam }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Workflow History</h2>
        <p className="mt-1 text-sm text-slate-500">Every status change is kept with the person, time, and remarks.</p>
      </div>
      <ol className="px-5 py-5">
        {exam.workflow.map((item, index) => (
          <li key={item.id} className="relative pb-6 pl-6 last:pb-0">
            {index < exam.workflow.length - 1 ? (
              <span className="absolute bottom-0 left-[5px] top-3 w-px bg-slate-200" />
            ) : null}
            <span className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${dotClasses[item.action]}`} />
            <p className="text-sm font-semibold text-slate-900">{EXAM_WORKFLOW_LABELS[item.action]}</p>
            <p className="mt-1 text-xs text-slate-500">
              {item.actorName} · {item.actorRole} · {formatDateTime(item.occurredAt)}
            </p>
            {item.remarks ? <p className="mt-1 text-sm leading-6 text-slate-700">{item.remarks}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ExamApprovalPanel({ exam }: { exam: Exam }) {
  if (!exam.approval) {
    return null
  }

  return (
    <section className="rounded-lg border border-emerald-200 bg-white">
      <div className="border-b border-emerald-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Approval</h2>
        <p className="mt-1 text-sm text-slate-500">Recorded when the approval authority accepted the paper.</p>
      </div>
      <dl className="grid gap-6 p-5 sm:grid-cols-2">
        <Field label="Approved By" value={exam.approval.approvedBy} />
        <Field label="Approval Date" value={formatDate(exam.approval.approvalDate)} />
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Remarks</dt>
          <dd className="mt-1 text-sm leading-6 text-slate-700">
            {exam.approval.remarks || 'No remarks recorded.'}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function ExamQuestionSection({
  exam,
  reviewable = true,
}: {
  exam: Exam
  reviewable?: boolean
}) {
  const { questions } = useQuestions()
  const { topics } = useTopics()
  const { subjects } = useSubjects()
  const { academics } = useAcademics()
  const [openId, setOpenId] = useState<string | null>(null)
  const academic = academics.find((item) => item.id === exam.academicId)
  const summary = summarizeSelection(exam.selectedQuestions, questions)
  const check = checkSelection(exam, exam.selectedQuestions, academic, questions, topics)
  const messages = [...check.blockers, ...check.gaps]

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Selected Questions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Final and draft questions are listed separately from the question bank. Marks are the values set for this exam.
        </p>
      </div>
      <div className="space-y-4 p-5">
        <QuestionDistribution config={exam.questionConfig} summary={summary} totalMarks={exam.totalMarks} />
        {messages.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">This paper does not yet match its blueprint.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-emerald-800">Question counts and marks match the exam configuration.</p>
        )}
        {exam.selectedQuestions.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No questions have been added to this exam.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {reviewable ? <th className="w-10 px-2 py-3" /> : null}
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Question Type</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Final / Draft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exam.selectedQuestions.map((item) => {
                  const meta = resolveExamQuestionMeta(item.questionId, questions, topics, subjects)
                  const open = openId === item.questionId
                  const preview = meta.question ? previewText(meta.question.content.questionText, 110) : ''
                  return (
                    <Fragment key={item.questionId}>
                      <tr className="align-top">
                        {reviewable ? (
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                              aria-expanded={open}
                              aria-label={`${open ? 'Hide' : 'Review'} ${item.questionId}`}
                              disabled={!meta.question}
                              onClick={() => setOpenId(open ? null : item.questionId)}
                            >
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                        ) : null}
                        <td className="min-w-56 px-4 py-3">
                          <p className="font-medium text-slate-900">{item.questionId}</p>
                          {meta.question ? (
                            <Link to={`/question-bank/${item.questionId}`} className="mt-1 block text-slate-600 hover:text-sky-800">
                              {preview}
                            </Link>
                          ) : (
                            <p className="mt-1 text-rose-700">This question is no longer in the question bank.</p>
                          )}
                        </td>
                        <td className="min-w-40 px-4 py-3 text-slate-600">{meta.subjectName}</td>
                        <td className="min-w-40 px-4 py-3 text-slate-600">{meta.topicName}</td>
                        <td className="px-4 py-3">
                          {meta.question ? <QuestionTypeBadge type={meta.question.type} /> : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {meta.question ? <DifficultyBadge level={meta.question.difficulty} /> : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.marks}</td>
                        <td className="px-4 py-3">
                          <ClassificationBadge classification={item.classification} />
                        </td>
                      </tr>
                      {reviewable && open && meta.question ? (
                        <tr className="bg-slate-50">
                          <td colSpan={8} className="px-4 py-4">
                            <QuestionContentView question={meta.question} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={reviewable ? 6 : 5} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total marks
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{summary.totalMarks}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
