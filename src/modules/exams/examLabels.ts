import type { ExamActor, ExamRole, ExamStatus, ExamType, ExamWorkflowAction } from '@/types/exam'

export const EXAM_TYPE_OPTIONS: { label: string; value: ExamType }[] = [
  { label: 'Midterm', value: 'Midterm' },
  { label: 'Final Term', value: 'Final Term' },
  { label: 'Quiz', value: 'Quiz' },
  { label: 'Assignment', value: 'Assignment' },
  { label: 'Practical', value: 'Practical' },
  { label: 'Viva', value: 'Viva' },
]

export const EXAM_STATUS_OPTIONS: { label: string; value: ExamStatus }[] = [
  { label: 'Initiated', value: 'Initiated' },
  { label: 'Forwarded', value: 'Forwarded' },
  { label: 'Forwarded to Approval', value: 'Forwarded to Approval' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Returned', value: 'Returned' },
]

export const EXAM_STATUS_DESCRIPTIONS: Record<ExamStatus, string> = {
  Initiated: 'Examination created. Questions have not been added yet.',
  Forwarded: 'Questions are on the paper and can still be changed.',
  'Forwarded to Approval': 'Submitted to the approval authority.',
  Approved: 'Reviewed and locked.',
  Rejected: 'The approval authority rejected the paper.',
  Returned: 'Sent back for revision.',
}

export const EXAM_WORKFLOW_LABELS: Record<ExamWorkflowAction, string> = {
  Created: 'Exam Created',
  Updated: 'Exam Updated',
  'Questions Added': 'Questions Added',
  'Questions Updated': 'Questions Updated',
  'Forwarded to Approval': 'Forwarded to Approval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  'Returned for Revision': 'Returned for Revision',
  'Revision Started': 'Revision Started',
}

export const EXAM_ACTORS: Record<ExamRole, Pick<ExamActor, 'name' | 'title'>> = {
  Administrator: { name: 'Aisha Rahman', title: 'Examination Administrator' },
  Teacher: { name: 'Dr. Amelia Chen', title: 'Course Teacher' },
  Approver: { name: 'Dr. Helen Brooks', title: 'Approval Authority' },
}

export const ROLE_SUMMARIES: Record<ExamRole, string> = {
  Administrator: 'Create exams, edit open papers, delete records, and start revisions.',
  Teacher: 'Select questions from the question bank and forward a paper for approval.',
  Approver: 'Review a submitted paper, then approve it, reject it, or send it back.',
}

export const STATUS_SORT_ORDER: Record<ExamStatus, number> = {
  Initiated: 0,
  Forwarded: 1,
  'Forwarded to Approval': 2,
  Returned: 3,
  Rejected: 4,
  Approved: 5,
}
