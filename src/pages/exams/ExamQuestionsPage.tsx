import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAcademics } from '@/context/AcademicContext'
import { useExams } from '@/context/ExamContext'
import { useQuestions } from '@/context/QuestionContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { useTopics } from '@/context/TopicContext'
import { ExamNotice } from '@/modules/exams/ExamNotice'
import { ExamQuestionSection, QuestionDistribution } from '@/modules/exams/ExamRecordSections'
import { ExamRoleBar } from '@/modules/exams/ExamRoleBar'
import { QuestionBankPicker } from '@/modules/exams/QuestionBankPicker'
import { SelectedQuestionEditor } from '@/modules/exams/SelectedQuestionEditor'
import {
  bankMarks,
  canEditExamQuestions,
  canForwardExam,
  checkSelection,
  eligibleQuestions,
  selectionsEqual,
  summarizeSelection,
} from '@/modules/exams/examRules'
import { ExamNotFound } from '@/pages/exams/ExamNotFound'
import type { Exam, ExamQuestionSelection, QuestionClassification } from '@/types/exam'

function ExamQuestionsEditor({ exam }: { exam: Exam }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { role, saveQuestions } = useExams()
  const { questions } = useQuestions()
  const { topics } = useTopics()
  const { subjects } = useSubjects()
  const { academics } = useAcademics()
  const academic = academics.find((item) => item.id === exam.academicId)
  const semester = academic?.semesters.find((item) => item.id === exam.semesterId)
  const [selected, setSelected] = useState<ExamQuestionSelection[]>(exam.selectedQuestions)
  const [replacingId, setReplacingId] = useState<string | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const bankRef = useRef<HTMLDivElement>(null)
  const canEdit = canEditExamQuestions(exam, role)

  const eligible = useMemo(
    () => eligibleQuestions(exam, academic, questions, topics),
    [academic, exam, questions, topics],
  )
  const summary = useMemo(() => summarizeSelection(selected, questions), [questions, selected])
  const check = useMemo(
    () => checkSelection(exam, selected, academic, questions, topics),
    [academic, exam, questions, selected, topics],
  )
  const dirty = !selectionsEqual(selected, exam.selectedQuestions)
  const messages = [...check.blockers, ...check.gaps]
  const canSubmitForward =
    canForwardExam(exam, role) && !dirty && check.blockers.length === 0 && check.gaps.length === 0

  const goBack = () => {
    if (dirty) {
      setLeaveOpen(true)
      return
    }
    navigate(`/exams/${exam.id}`)
  }

  const handleAdd = (questionId: string, classification: QuestionClassification) => {
    if (selected.some((item) => item.questionId === questionId)) {
      toast.error('That question is already on this paper.')
      return
    }
    const question = questions.find((item) => item.id === questionId)
    if (!question) {
      return
    }
    setSelected((current) => [...current, { questionId, classification, marks: bankMarks(question) }])
  }

  const handleReplace = (questionId: string) => {
    if (!replacingId || replacingId === questionId) {
      return
    }
    if (selected.some((item) => item.questionId === questionId)) {
      toast.error('That question is already on this paper.')
      return
    }
    setSelected((current) =>
      current.map((item) => (item.questionId === replacingId ? { ...item, questionId } : item)),
    )
    setReplacingId(null)
    toast.success(`Replaced the question with ${questionId}. Marks were kept.`)
  }

  const handleSave = () => {
    const result = saveQuestions(exam.id, selected)
    if (!result.exam) {
      toast.error(result.messages[0] ?? 'Unable to save the question list.')
      return
    }
    const moved = exam.status === 'Initiated' && result.exam.status === 'Forwarded'
    toast.success(
      moved ? `Questions saved. "${exam.name}" is now Forwarded.` : `Question list saved for "${exam.name}".`,
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Select Questions"
        description={`Choose final and draft questions for ${exam.name}. Counts and marks are checked before the paper can be forwarded.`}
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: exam.name, path: `/exams/${exam.id}` },
          { label: 'Questions' },
        ]}
        actions={
          <Button variant="secondary" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to Exam
          </Button>
        }
      />
      <ExamRoleBar />

      {!academic || !semester ? (
        <ExamNotice
          tone="error"
          title="This exam cannot load its semester"
          description="The academic session or semester is missing, so subjects and question-bank items cannot be resolved."
          action={
            <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}`)}>
              Back to exam
            </Button>
          }
        />
      ) : (
        <>
          {!canEdit ? (
            <>
              <ExamNotice
                tone="warning"
                title="Question changes are locked"
                description="Questions can be changed while the exam is Initiated, Forwarded, Rejected, or Returned. An approver reviews the paper from the approval screen."
              />
              <ExamQuestionSection exam={exam} />
            </>
          ) : (
            <>
              <QuestionDistribution config={exam.questionConfig} summary={summary} totalMarks={exam.totalMarks} />
              {messages.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <p className="font-medium">Requirements still open</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {messages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ExamNotice
                  tone="info"
                  title="Blueprint matched"
                  description="Selected counts and marks match this exam. Save the list, then forward it for approval."
                />
              )}
              {replacingId ? (
                <ExamNotice
                  tone="warning"
                  title={`Replacing ${replacingId}`}
                  description="Choose a question that is not already on the paper. Classification and marks stay with the row."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setReplacingId(null)}>
                      Cancel replace
                    </Button>
                  }
                />
              ) : null}
              <div ref={bankRef}>
                {eligible.length === 0 ? (
                  <ExamNotice
                    tone="warning"
                    title="No questions are available for this semester"
                    description="Add questions to the allocated subjects, or allocate subjects on the academic session."
                    action={
                      <Link
                        to={`/academics/${exam.academicId}/semesters/${exam.semesterId}`}
                        className="text-sm font-medium text-sky-800 hover:text-sky-950"
                      >
                        Manage semester subjects
                      </Link>
                    }
                  />
                ) : (
                  <QuestionBankPicker
                    questions={eligible}
                    topics={topics}
                    subjects={subjects}
                    selected={selected}
                    replacingId={replacingId}
                    onAdd={handleAdd}
                    onReplace={handleReplace}
                  />
                )}
              </div>
              <SelectedQuestionEditor
                selected={selected}
                questions={questions}
                topics={topics}
                subjects={subjects}
                replacingId={replacingId}
                onChange={setSelected}
                onStartReplace={(questionId) => {
                  setReplacingId(questionId)
                  bankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                onCancelReplace={() => setReplacingId(null)}
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={goBack}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!dirty || check.blockers.length > 0}>
                  Save Questions
                </Button>
                {canForwardExam(exam, role) ? (
                  <Button
                    variant="secondary"
                    disabled={!canSubmitForward}
                    onClick={() => navigate(`/exams/${exam.id}/forward`)}
                  >
                    Forward to Approval
                  </Button>
                ) : null}
              </div>
              {dirty ? (
                <p className="text-right text-xs text-slate-500">Save the question list before forwarding.</p>
              ) : null}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={leaveOpen}
        title="Discard question changes?"
        message="The question list on this screen has not been saved."
        confirmLabel="Discard changes"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => navigate(`/exams/${exam.id}`)}
      />
    </div>
  )
}

export function ExamQuestionsPage() {
  const { id = '' } = useParams()
  const { getById } = useExams()
  const exam = getById(id)

  if (!exam) {
    return <ExamNotFound />
  }

  return <ExamQuestionsEditor key={`${exam.id}-${exam.status}-${exam.workflow.length}`} exam={exam} />
}
