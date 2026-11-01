export const EXAM_TYPES = [
  'Midterm',
  'Final Term',
  'Quiz',
  'Assignment',
  'Practical',
  'Viva',
] as const

export type ExamType = (typeof EXAM_TYPES)[number]

export const EXAM_STATUSES = [
  'Initiated',
  'Forwarded',
  'Forwarded to Approval',
  'Approved',
  'Rejected',
  'Returned',
] as const

export type ExamStatus = (typeof EXAM_STATUSES)[number]

export const EXAM_WORKFLOW_STAGES = [
  'Initiated',
  'Forwarded',
  'Forwarded to Approval',
  'Approved',
] as const

export type ExamWorkflowStage = (typeof EXAM_WORKFLOW_STAGES)[number]

export const EXAM_ROLES = ['Administrator', 'Teacher', 'Approver'] as const

export type ExamRole = (typeof EXAM_ROLES)[number]

export type QuestionClassification = 'Final' | 'Draft'

export type ExamWorkflowAction =
  | 'Created'
  | 'Updated'
  | 'Questions Added'
  | 'Questions Updated'
  | 'Forwarded to Approval'
  | 'Approved'
  | 'Rejected'
  | 'Returned for Revision'
  | 'Revision Started'

export interface QuestionConfiguration {
  finalTotal: number
  draftTotal: number
  finalSubjective: number
  draftSubjective: number
  finalObjective: number
  draftObjective: number
}

export interface ExamQuestionSelection {
  questionId: string
  classification: QuestionClassification
  marks: number
}

export interface ExamWorkflowEvent {
  id: string
  action: ExamWorkflowAction
  actorName: string
  actorRole: ExamRole
  occurredAt: string
  remarks: string
}

export interface ExamApproval {
  approvedBy: string
  approvalDate: string
  remarks: string
}

export interface Exam {
  id: string
  name: string
  academicId: string
  courseId: string
  semesterId: string
  examType: ExamType
  examDate: string
  teacherId: string
  totalMarks: number
  remarks: string
  isDraft: boolean
  status: ExamStatus
  questionConfig: QuestionConfiguration
  selectedQuestions: ExamQuestionSelection[]
  workflow: ExamWorkflowEvent[]
  approval?: ExamApproval
  revisionOpen: boolean
  createdDate: string
  updatedDate: string
}

export interface ExamFormValues {
  name: string
  academicId: string
  courseId: string
  semesterId: string
  examType: ExamType | ''
  examDate: string
  teacherId: string
  totalMarks: string
  remarks: string
  finalTotal: string
  draftTotal: string
  finalSubjective: string
  draftSubjective: string
  finalObjective: string
  draftObjective: string
}

export interface ExamFormErrors {
  name?: string
  academicId?: string
  courseId?: string
  semesterId?: string
  examType?: string
  examDate?: string
  teacherId?: string
  totalMarks?: string
  remarks?: string
  finalTotal?: string
  draftTotal?: string
  finalSubjective?: string
  draftSubjective?: string
  finalObjective?: string
  draftObjective?: string
  questionConfig?: string
}

export interface ExamActor {
  name: string
  role: ExamRole
  title: string
}
