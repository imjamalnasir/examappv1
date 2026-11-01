import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useAcademics } from '@/context/AcademicContext'
import { useExams } from '@/context/ExamContext'
import { useQuestions } from '@/context/QuestionContext'
import { useToast } from '@/context/ToastContext'
import { useTopics } from '@/context/TopicContext'
import { ExamNotice } from '@/modules/exams/ExamNotice'
import {
  ExamConfigurationPanel,
  ExamInformationPanel,
  ExamQuestionSection,
} from '@/modules/exams/ExamRecordSections'
import { ExamRoleBar } from '@/modules/exams/ExamRoleBar'
import { canDecideExam, checkSelection } from '@/modules/exams/examRules'
import { ExamNotFound } from '@/pages/exams/ExamNotFound'
import type { Exam } from '@/types/exam'

type Decision = 'approve' | 'reject' | 'return'

function ExamApprovalContent({ exam }: { exam: Exam }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { role, approveExam, rejectExam, returnExam } = useExams()
  const { academics } = useAcademics()
  const { questions } = useQuestions()
  const { topics } = useTopics()
  const [decision, setDecision] = useState<Decision>('approve')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const academic = academics.find((item) => item.id === exam.academicId)
  const allowed = canDecideExam(exam, role)
  const check = useMemo(
    () => checkSelection(exam, exam.selectedQuestions, academic, questions, topics),
    [academic, exam, questions, topics],
  )
  const messages = [...check.blockers, ...check.gaps]
  const remarksRequired = decision !== 'approve'

  const submit = () => {
    if (remarksRequired && remarks.trim().length === 0) {
      setFormError('Enter a reason before continuing.')
      return
    }
    setFormError('')
    setError('')
    setPending(true)
    window.setTimeout(() => {
      const result =
        decision === 'approve'
          ? approveExam(exam.id, remarks)
          : decision === 'reject'
            ? rejectExam(exam.id, remarks)
            : returnExam(exam.id, remarks)
      setPending(false)
      if (!result.exam) {
        setError(result.messages.join(' '))
        toast.error(result.messages[0] ?? 'Unable to record the decision.')
        return
      }
      const label =
        decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'returned for revision'
      toast.success(`"${exam.name}" was ${label}.`)
      navigate(`/exams/${exam.id}`)
    }, 300)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Approval"
        description="Review the examination, its question distribution, and each selected question."
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: exam.name, path: `/exams/${exam.id}` },
          { label: 'Approval' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Exam
          </Button>
        }
      />
      <ExamRoleBar />
      {exam.revisionOpen ? (
        <ExamNotice
          tone="warning"
          title="This submission is a revision"
          description="An earlier approval was reopened. Review the current question list before deciding."
        />
      ) : null}
      {!allowed ? (
        <ExamNotice
          tone="info"
          title="Read-only review"
          description={
            exam.status === 'Forwarded to Approval'
              ? 'Switch to the Approver role to approve, reject, or return this paper.'
              : 'Decisions are available only while the status is Forwarded to Approval.'
          }
        />
      ) : null}
      {messages.length > 0 ? (
        <ExamNotice
          tone="error"
          title="This paper cannot be approved yet"
          description={`${messages.join(' ')} You can still reject it or send it back.`}
        />
      ) : null}
      <ExamInformationPanel exam={exam} />
      <ExamConfigurationPanel exam={exam} />
      <ExamQuestionSection exam={exam} />
      {allowed ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Decision</h2>
          <p className="mt-1 text-sm text-slate-500">
            Approve locks the paper. Reject and return both require a reason and send it back for revision.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              ['approve', 'Approve'],
              ['reject', 'Reject'],
              ['return', 'Return for revision'],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                variant={decision === value ? 'primary' : 'secondary'}
                onClick={() => {
                  setDecision(value)
                  setFormError('')
                }}
              >
                {label}
              </Button>
            ))}
          </div>
          <label className="mt-4 block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              {decision === 'approve' ? 'Remarks' : 'Reason'}
              {remarksRequired ? <span className="ml-0.5 text-red-600">*</span> : null}
            </span>
            <textarea
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value)
                setFormError('')
              }}
              rows={4}
              placeholder={
                decision === 'approve'
                  ? 'Optional remarks for the approval record'
                  : 'Explain what must change'
              }
              className={`min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-600/20 ${
                formError ? 'border-red-400' : 'border-slate-300 focus:border-sky-600'
              }`}
            />
            {formError ? <span className="block text-xs text-red-600">{formError}</span> : null}
          </label>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          <div className="mt-4 flex justify-end">
            <Button
              variant={decision === 'reject' ? 'danger' : 'primary'}
              onClick={submit}
              disabled={pending || (decision === 'approve' && messages.length > 0)}
            >
              {pending ? 'Saving...' : decision === 'approve' ? 'Approve exam' : decision === 'reject' ? 'Reject exam' : 'Send back'}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export function ExamApprovalPage() {
  const { id = '' } = useParams()
  const { getById } = useExams()
  const exam = getById(id)

  if (!exam) {
    return <ExamNotFound />
  }

  return <ExamApprovalContent exam={exam} />
}
