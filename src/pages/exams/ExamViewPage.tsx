import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useExams } from '@/context/ExamContext'
import { useToast } from '@/context/ToastContext'
import { ExamDeleteDialog } from '@/modules/exams/ExamDeleteDialog'
import { ExamNotice } from '@/modules/exams/ExamNotice'
import {
  ExamApprovalPanel,
  ExamConfigurationPanel,
  ExamInformationPanel,
  ExamQuestionSection,
  ExamWorkflowTimeline,
} from '@/modules/exams/ExamRecordSections'
import { ExamRemarksDialog } from '@/modules/exams/ExamRemarksDialog'
import { ExamRoleBar } from '@/modules/exams/ExamRoleBar'
import { ExamWorkflowStepper } from '@/modules/exams/ExamWorkflowStepper'
import { ExamEnrolledStudents } from '@/modules/students/ExamEnrolledStudents'
import {
  canDecideExam,
  canEditExamInfo,
  canEditExamQuestions,
  canForwardExam,
  canReviseExam,
  deleteAccess,
} from '@/modules/exams/examRules'
import { useExamLabels } from '@/modules/exams/useExamLabels'
import { ExamNotFound } from '@/pages/exams/ExamNotFound'
import type { Exam, ExamWorkflowAction } from '@/types/exam'

function latestRemark(exam: Exam, action: ExamWorkflowAction): string {
  const event = [...exam.workflow].reverse().find((item) => item.action === action)
  return event?.remarks ?? ''
}

function ExamViewContent({ exam }: { exam: Exam }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { role, removeExam, startRevision } = useExams()
  const labels = useExamLabels(exam)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [revisionOpen, setRevisionOpen] = useState(false)
  const access = deleteAccess(exam, role)
  const questionLabel = exam.selectedQuestions.length === 0 ? 'Add Questions' : 'Edit Questions'

  const handleDelete = (authorized: boolean) => {
    const result = removeExam(exam.id, authorized)
    if (!result.ok) {
      toast.error(result.message)
      setDeleteOpen(false)
      return
    }
    toast.success(`Exam "${exam.name}" deleted.`)
    navigate('/exams')
  }

  const handleRevision = (remarks: string) => {
    const result = startRevision(exam.id, remarks)
    if (!result.exam) {
      toast.error(result.messages[0] ?? 'Unable to start a revision.')
      return
    }
    toast.success(`Revision opened for "${exam.name}".`)
    setRevisionOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.name}
        description="Exam details, question blueprint, selected questions, and workflow history."
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: exam.name },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/exams')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Exams
            </Button>
            {canEditExamInfo(exam, role) ? (
              <Button onClick={() => navigate(`/exams/${exam.id}/edit`)}>
                <Pencil className="h-4 w-4" />
                Edit Exam
              </Button>
            ) : null}
            {access !== 'no' ? (
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </>
        }
      />
      <ExamRoleBar />
      {labels.missing.length > 0 ? (
        <ExamNotice
          tone="error"
          title="Linked records are missing"
          description={`This exam still points at a removed ${labels.missing.join(', ')}. Question selection stays blocked until those records exist again.`}
        />
      ) : null}
      {exam.isDraft ? (
        <ExamNotice
          tone="info"
          title="Draft exam"
          description="This paper is saved as a draft and its status is Initiated. Continue by adding questions or finish the details."
        />
      ) : null}
      {exam.status === 'Approved' ? (
        <ExamNotice
          tone="info"
          title="Approved and locked"
          description="The paper and its question list cannot be edited. An administrator can start a controlled revision. Deleting an approved exam needs explicit authorization, and question-bank records are kept."
        />
      ) : null}
      {exam.revisionOpen ? (
        <ExamNotice
          tone="warning"
          title="Revision in progress"
          description="The previous approval remains in the history. Update the paper, then forward it for approval again."
        />
      ) : null}
      {exam.status === 'Rejected' ? (
        <ExamNotice
          tone="error"
          title="Rejected"
          description={latestRemark(exam, 'Rejected') || 'The approval authority rejected this paper.'}
        />
      ) : null}
      {exam.status === 'Returned' ? (
        <ExamNotice
          tone="warning"
          title="Returned for revision"
          description={latestRemark(exam, 'Returned for Revision') || 'The approval authority sent this paper back.'}
        />
      ) : null}

      <ExamWorkflowStepper exam={exam}>
        {canEditExamQuestions(exam, role) ? (
          <Button onClick={() => navigate(`/exams/${exam.id}/questions`)}>{questionLabel}</Button>
        ) : null}
        {canForwardExam(exam, role) ? (
          <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}/forward`)}>
            Forward to Approval
          </Button>
        ) : null}
        {canDecideExam(exam, role) ? (
          <Button onClick={() => navigate(`/exams/${exam.id}/approval`)}>Review and Decide</Button>
        ) : null}
        {exam.status === 'Forwarded to Approval' && !canDecideExam(exam, role) ? (
          <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}/approval`)}>
            View Submission
          </Button>
        ) : null}
        {canReviseExam(exam, role) ? (
          <Button variant="secondary" onClick={() => setRevisionOpen(true)}>
            Start Revision
          </Button>
        ) : null}
      </ExamWorkflowStepper>

      <ExamInformationPanel exam={exam} />
      <ExamEnrolledStudents exam={exam} />
      <ExamConfigurationPanel exam={exam} />
      <ExamQuestionSection exam={exam} />
      <ExamApprovalPanel exam={exam} />
      <ExamWorkflowTimeline exam={exam} />

      <ExamDeleteDialog
        exam={exam}
        open={deleteOpen}
        needsAuthorization={access === 'authorized'}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <ExamRemarksDialog
        open={revisionOpen}
        title="Start revision"
        message="The approved paper will return to Forwarded so questions and exam details can be changed. It must be approved again."
        confirmLabel="Start Revision"
        remarksLabel="Reason for revision"
        onCancel={() => setRevisionOpen(false)}
        onConfirm={handleRevision}
      />
    </div>
  )
}

export function ExamViewPage() {
  const { id = '' } = useParams()
  const { getById } = useExams()
  const exam = getById(id)

  if (!exam) {
    return <ExamNotFound />
  }

  return <ExamViewContent exam={exam} />
}
