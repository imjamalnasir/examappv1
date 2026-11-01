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
import { canForwardExam, checkSelection } from '@/modules/exams/examRules'
import { ExamNotFound } from '@/pages/exams/ExamNotFound'
import type { Exam } from '@/types/exam'

function ExamForwardContent({ exam }: { exam: Exam }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { role, forwardExam } = useExams()
  const { academics } = useAcademics()
  const { questions } = useQuestions()
  const { topics } = useTopics()
  const [remarks, setRemarks] = useState('')
  const [pending, setPending] = useState(false)
  const academic = academics.find((item) => item.id === exam.academicId)
  const allowed = canForwardExam(exam, role)
  const check = useMemo(
    () => checkSelection(exam, exam.selectedQuestions, academic, questions, topics),
    [academic, exam, questions, topics],
  )
  const messages = [...check.blockers, ...check.gaps]

  const submit = () => {
    setPending(true)
    window.setTimeout(() => {
      const result = forwardExam(exam.id, remarks)
      setPending(false)
      if (!result.exam) {
        toast.error(result.messages[0] ?? 'Unable to forward this exam.')
        return
      }
      toast.success(`"${exam.name}" was forwarded for approval.`)
      navigate(`/exams/${exam.id}`)
    }, 300)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forward to Approval"
        description="Confirm the paper and its questions before sending it to the approval authority."
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: exam.name, path: `/exams/${exam.id}` },
          { label: 'Forward to Approval' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Exam
          </Button>
        }
      />
      <ExamRoleBar />
      {!allowed ? (
        <ExamNotice
          tone="warning"
          title="This paper cannot be forwarded right now"
          description="An administrator or teacher can forward an exam after questions have been added, or after it is rejected or returned. Papers already in review stay read-only."
        />
      ) : null}
      {messages.length > 0 ? (
        <ExamNotice
          tone="error"
          title="Fix the question list before forwarding"
          description={messages.join(' ')}
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate(`/exams/${exam.id}/questions`)}>
              Edit questions
            </Button>
          }
        />
      ) : (
        <ExamNotice
          tone="info"
          title="Ready for approval"
          description="Question counts and marks match the blueprint. Forwarding moves the status to Forwarded to Approval and pauses editing."
        />
      )}
      <ExamInformationPanel exam={exam} />
      <ExamConfigurationPanel exam={exam} />
      <ExamQuestionSection exam={exam} />
      {allowed ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Submission note</h2>
          <p className="mt-1 text-sm text-slate-500">Optional remarks are stored on the workflow history.</p>
          <textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            rows={4}
            placeholder="Notes for the approval authority"
            className="mt-4 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}`)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={pending || messages.length > 0}>
              {pending ? 'Forwarding...' : 'Forward to Approval'}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export function ExamForwardPage() {
  const { id = '' } = useParams()
  const { getById } = useExams()
  const exam = getById(id)

  if (!exam) {
    return <ExamNotFound />
  }

  return <ExamForwardContent exam={exam} />
}
