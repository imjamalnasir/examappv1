import { configurationFromValues } from '@/modules/exams/examValidation'
import { isConfigurationBalanced } from '@/modules/exams/examRules'
import type {
  Exam,
  ExamActor,
  ExamFormValues,
  ExamQuestionSelection,
  ExamWorkflowAction,
  ExamWorkflowEvent,
} from '@/types/exam'
import { createSequentialId } from '@/utils/id'

export function getExamById(exams: Exam[], id: string): Exam | undefined {
  return exams.find((exam) => exam.id === id)
}

export function suggestExamId(exams: Exam[]): string {
  return createSequentialId(
    'EXM',
    exams.map((exam) => exam.id),
  )
}

export function createWorkflowEvent(
  action: ExamWorkflowAction,
  actor: ExamActor,
  occurredAt: string,
  remarks: string,
): ExamWorkflowEvent {
  return {
    id: `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),
    action,
    actorName: actor.name,
    actorRole: actor.role,
    occurredAt,
    remarks,
  }
}

export function createExamRecord(
  values: ExamFormValues,
  id: string,
  asDraft: boolean,
  actor: ExamActor,
  occurredAt: string,
): Exam {
  return {
    id,
    name: values.name.trim(),
    academicId: values.academicId,
    courseId: values.courseId,
    semesterId: values.semesterId,
    examType: values.examType || 'Quiz',
    examDate: values.examDate,
    teacherId: values.teacherId,
    totalMarks: Number(values.totalMarks),
    remarks: values.remarks.trim(),
    isDraft: asDraft,
    status: 'Initiated',
    questionConfig: configurationFromValues(values),
    selectedQuestions: [],
    workflow: [
      createWorkflowEvent(
        'Created',
        actor,
        occurredAt,
        asDraft ? 'Saved as draft.' : 'Examination created.',
      ),
    ],
    revisionOpen: false,
    createdDate: occurredAt.slice(0, 10),
    updatedDate: occurredAt.slice(0, 10),
  }
}

export function applyExamUpdate(
  exam: Exam,
  values: ExamFormValues,
  asDraft: boolean,
  actor: ExamActor,
  occurredAt: string,
): Exam {
  const questionConfig = configurationFromValues(values)
  const workflow = [
    ...exam.workflow,
    createWorkflowEvent(
      'Updated',
      actor,
      occurredAt,
      asDraft ? 'Exam details saved as draft.' : 'Exam details updated.',
    ),
  ]
  let status = exam.status
  const canPromote =
    status === 'Initiated' &&
    !asDraft &&
    exam.selectedQuestions.length > 0 &&
    isConfigurationBalanced(questionConfig)

  if (canPromote) {
    status = 'Forwarded'
    if (!exam.workflow.some((event) => event.action === 'Questions Added')) {
      workflow.push(
        createWorkflowEvent(
          'Questions Added',
          actor,
          occurredAt,
          'Question configuration is complete and questions are already selected.',
        ),
      )
    }
  }

  return {
    ...exam,
    name: values.name.trim(),
    academicId: values.academicId,
    courseId: values.courseId,
    semesterId: values.semesterId,
    examType: values.examType || exam.examType,
    examDate: values.examDate,
    teacherId: values.teacherId,
    totalMarks: Number(values.totalMarks),
    remarks: values.remarks.trim(),
    isDraft: asDraft,
    status,
    questionConfig,
    workflow,
    updatedDate: occurredAt.slice(0, 10),
  }
}

export function applyQuestionSave(
  exam: Exam,
  selected: ExamQuestionSelection[],
  actor: ExamActor,
  occurredAt: string,
): Exam {
  const alreadyAdded = exam.workflow.some((event) => event.action === 'Questions Added')
  const promote =
    exam.status === 'Initiated' && selected.length > 0 && isConfigurationBalanced(exam.questionConfig)
  const action = !alreadyAdded && selected.length > 0 ? 'Questions Added' : 'Questions Updated'

  return {
    ...exam,
    status: promote ? 'Forwarded' : exam.status,
    isDraft: promote ? false : exam.isDraft,
    selectedQuestions: selected,
    updatedDate: occurredAt.slice(0, 10),
    workflow: [
      ...exam.workflow,
      createWorkflowEvent(
        action,
        actor,
        occurredAt,
        selected.length === 0
          ? 'All questions were removed from the paper.'
          : `${selected.length} question${selected.length === 1 ? '' : 's'} saved on the paper.`,
      ),
    ],
  }
}

export function applyForward(exam: Exam, remarks: string, actor: ExamActor, occurredAt: string): Exam {
  return {
    ...exam,
    status: 'Forwarded to Approval',
    isDraft: false,
    updatedDate: occurredAt.slice(0, 10),
    workflow: [
      ...exam.workflow,
      createWorkflowEvent(
        'Forwarded to Approval',
        actor,
        occurredAt,
        remarks.trim() || 'Submitted for approval.',
      ),
    ],
  }
}

export function applyApproval(exam: Exam, remarks: string, actor: ExamActor, occurredAt: string): Exam {
  const approvalDate = occurredAt.slice(0, 10)
  return {
    ...exam,
    status: 'Approved',
    revisionOpen: false,
    isDraft: false,
    approval: {
      approvedBy: actor.name,
      approvalDate,
      remarks: remarks.trim(),
    },
    updatedDate: approvalDate,
    workflow: [
      ...exam.workflow,
      createWorkflowEvent('Approved', actor, occurredAt, remarks.trim()),
    ],
  }
}

export function applyRejection(exam: Exam, reason: string, actor: ExamActor, occurredAt: string): Exam {
  return {
    ...exam,
    status: 'Rejected',
    revisionOpen: false,
    approval: undefined,
    updatedDate: occurredAt.slice(0, 10),
    workflow: [...exam.workflow, createWorkflowEvent('Rejected', actor, occurredAt, reason.trim())],
  }
}

export function applyReturn(exam: Exam, remarks: string, actor: ExamActor, occurredAt: string): Exam {
  return {
    ...exam,
    status: 'Returned',
    revisionOpen: false,
    approval: undefined,
    updatedDate: occurredAt.slice(0, 10),
    workflow: [
      ...exam.workflow,
      createWorkflowEvent('Returned for Revision', actor, occurredAt, remarks.trim()),
    ],
  }
}

export function applyRevision(exam: Exam, remarks: string, actor: ExamActor, occurredAt: string): Exam {
  return {
    ...exam,
    status: 'Forwarded',
    revisionOpen: true,
    approval: undefined,
    updatedDate: occurredAt.slice(0, 10),
    workflow: [
      ...exam.workflow,
      createWorkflowEvent('Revision Started', actor, occurredAt, remarks.trim()),
    ],
  }
}
