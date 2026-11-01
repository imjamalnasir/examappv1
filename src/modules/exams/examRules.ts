import type { AcademicSession } from '@/types/academic'
import type {
  Exam,
  ExamQuestionSelection,
  ExamRole,
  ExamStatus,
  ExamWorkflowStage,
  QuestionClassification,
  QuestionConfiguration,
} from '@/types/exam'
import type { Question } from '@/types/question'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'

export type ExamQuestionCategory = 'Subjective' | 'Objective'
export type StageIndicator = 'complete' | 'active' | 'pending' | 'rejected' | 'returned'

export interface SelectionSummary {
  finalTotal: number
  draftTotal: number
  finalSubjective: number
  draftSubjective: number
  finalObjective: number
  draftObjective: number
  totalMarks: number
}

export interface SelectionCheck {
  blockers: string[]
  gaps: string[]
}

export interface ExamQuestionMeta {
  question?: Question
  subjectName: string
  topicName: string
  category: ExamQuestionCategory | null
}

const WORKFLOW_STAGE_INDEX: Record<ExamWorkflowStage, number> = {
  Initiated: 0,
  Forwarded: 1,
  'Forwarded to Approval': 2,
  Approved: 3,
}

export function questionCategory(question: Question): ExamQuestionCategory {
  return question.type === 'subjective' ? 'Subjective' : 'Objective'
}

export function bankMarks(question: Question): number {
  if (question.type === 'subjective') {
    return question.content.marks && question.content.marks > 0 ? question.content.marks : 5
  }
  return question.type === 'mcq' ? 2 : 1
}

export function isConfigurationBalanced(config: QuestionConfiguration): boolean {
  return (
    config.finalSubjective + config.finalObjective === config.finalTotal &&
    config.draftSubjective + config.draftObjective === config.draftTotal
  )
}

export function emptySummary(): SelectionSummary {
  return {
    finalTotal: 0,
    draftTotal: 0,
    finalSubjective: 0,
    draftSubjective: 0,
    finalObjective: 0,
    draftObjective: 0,
    totalMarks: 0,
  }
}

export function summarizeSelection(
  selected: ExamQuestionSelection[],
  questions: Question[],
): SelectionSummary {
  const summary = emptySummary()

  selected.forEach((item) => {
    const question = questions.find((entry) => entry.id === item.questionId)
    if (!question) {
      return
    }
    const category = questionCategory(question)
    if (item.classification === 'Final') {
      summary.finalTotal += 1
      if (category === 'Subjective') {
        summary.finalSubjective += 1
      } else {
        summary.finalObjective += 1
      }
    } else {
      summary.draftTotal += 1
      if (category === 'Subjective') {
        summary.draftSubjective += 1
      } else {
        summary.draftObjective += 1
      }
    }
    summary.totalMarks += item.marks
  })

  return summary
}

export function selectionsEqual(
  left: ExamQuestionSelection[],
  right: ExamQuestionSelection[],
): boolean {
  if (left.length !== right.length) {
    return false
  }
  return left.every((item, index) => {
    const other = right[index]
    return (
      item.questionId === other.questionId &&
      item.classification === other.classification &&
      item.marks === other.marks
    )
  })
}

export function eligibleQuestions(
  exam: Pick<Exam, 'courseId' | 'semesterId'>,
  academic: AcademicSession | undefined,
  questions: Question[],
  topics: Topic[],
): Question[] {
  if (!academic || academic.courseId !== exam.courseId) {
    return []
  }
  const semester = academic.semesters.find((item) => item.id === exam.semesterId)
  if (!semester) {
    return []
  }
  const allocated = new Set(semester.subjects.map((item) => item.subjectId))
  const topicIds = new Set(
    topics.filter((topic) => allocated.has(topic.subjectId)).map((topic) => topic.id),
  )
  return questions.filter(
    (question) => question.courseId === exam.courseId && topicIds.has(question.topicId),
  )
}

function countGap(label: string, actual: number, required: number, gaps: string[]) {
  if (actual === required) {
    return
  }
  const difference =
    actual < required ? `${required - actual} more needed` : `${actual - required} too many`
  gaps.push(`${label}: ${actual} of ${required} (${difference}).`)
}

export function checkSelection(
  exam: Exam,
  selected: ExamQuestionSelection[],
  academic: AcademicSession | undefined,
  questions: Question[],
  topics: Topic[],
): SelectionCheck {
  const blockers: string[] = []
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  selected.forEach((item) => {
    if (seen.has(item.questionId)) {
      duplicates.add(item.questionId)
    }
    seen.add(item.questionId)
  })

  if (duplicates.size > 0) {
    blockers.push(`Duplicate questions: ${Array.from(duplicates).join(', ')}.`)
  }

  if (selected.some((item) => !Number.isInteger(item.marks) || item.marks < 1 || item.marks > 100)) {
    blockers.push('Each question needs a whole mark from 1 to 100.')
  }

  const missing = selected.filter((item) => !questions.some((question) => question.id === item.questionId))
  if (missing.length > 0) {
    blockers.push(
      `Remove questions that are no longer in the question bank: ${missing.map((item) => item.questionId).join(', ')}.`,
    )
  }

  const semester = academic?.semesters.find((item) => item.id === exam.semesterId)
  if (!academic) {
    blockers.push('The academic session linked to this exam no longer exists.')
  } else if (academic.courseId !== exam.courseId) {
    blockers.push('The exam course does not match its academic session.')
  } else if (!semester) {
    blockers.push('The semester linked to this exam no longer exists.')
  } else {
    const allowed = new Set(eligibleQuestions(exam, academic, questions, topics).map((question) => question.id))
    const outside = selected.filter(
      (item) => questions.some((question) => question.id === item.questionId) && !allowed.has(item.questionId),
    )
    if (outside.length > 0) {
      blockers.push(
        `These questions are not on a subject allocated to this semester: ${outside.map((item) => item.questionId).join(', ')}.`,
      )
    }
  }

  const summary = summarizeSelection(selected, questions)
  const gaps: string[] = []
  if (!isConfigurationBalanced(exam.questionConfig)) {
    gaps.push(
      'Question configuration is incomplete. Subjective and objective counts must add up to each total.',
    )
  }
  countGap('Final questions', summary.finalTotal, exam.questionConfig.finalTotal, gaps)
  countGap('Draft questions', summary.draftTotal, exam.questionConfig.draftTotal, gaps)
  countGap('Final subjective questions', summary.finalSubjective, exam.questionConfig.finalSubjective, gaps)
  countGap('Draft subjective questions', summary.draftSubjective, exam.questionConfig.draftSubjective, gaps)
  countGap('Final objective questions', summary.finalObjective, exam.questionConfig.finalObjective, gaps)
  countGap('Draft objective questions', summary.draftObjective, exam.questionConfig.draftObjective, gaps)
  if (summary.totalMarks !== exam.totalMarks) {
    gaps.push(`Marks: ${summary.totalMarks} selected, ${exam.totalMarks} required.`)
  }

  return { blockers, gaps }
}

export function canCreateExam(role: ExamRole): boolean {
  return role === 'Administrator'
}

export function canEditExamInfo(exam: Exam, role: ExamRole): boolean {
  if (role !== 'Administrator') {
    return false
  }
  if (exam.status === 'Forwarded to Approval' || exam.status === 'Approved') {
    return false
  }
  if (exam.status === 'Forwarded' && !exam.revisionOpen) {
    return false
  }
  return (
    exam.status === 'Initiated' ||
    exam.status === 'Rejected' ||
    exam.status === 'Returned' ||
    exam.revisionOpen
  )
}

export function canEditExamQuestions(exam: Exam, role: ExamRole): boolean {
  if (role !== 'Administrator' && role !== 'Teacher') {
    return false
  }
  return exam.status !== 'Forwarded to Approval' && exam.status !== 'Approved'
}

export function canForwardExam(exam: Exam, role: ExamRole): boolean {
  if (role !== 'Administrator' && role !== 'Teacher') {
    return false
  }
  return exam.status === 'Forwarded' || exam.status === 'Rejected' || exam.status === 'Returned'
}

export function canDecideExam(exam: Exam, role: ExamRole): boolean {
  return role === 'Approver' && exam.status === 'Forwarded to Approval'
}

export function canReviseExam(exam: Exam, role: ExamRole): boolean {
  return role === 'Administrator' && exam.status === 'Approved'
}

export function deleteAccess(exam: Exam, role: ExamRole): 'no' | 'yes' | 'authorized' {
  if (role !== 'Administrator') {
    return 'no'
  }
  return exam.status === 'Approved' ? 'authorized' : 'yes'
}

export function stageIndicator(status: ExamStatus, stage: ExamWorkflowStage): StageIndicator {
  const stageIndex = WORKFLOW_STAGE_INDEX[stage]

  if (status === 'Rejected') {
    if (stageIndex < 2) {
      return 'complete'
    }
    return stageIndex === 2 ? 'rejected' : 'pending'
  }

  if (status === 'Returned') {
    if (stageIndex < 2) {
      return 'complete'
    }
    return stageIndex === 2 ? 'returned' : 'pending'
  }

  if (status === 'Approved') {
    return stageIndex < 3 ? 'complete' : 'active'
  }

  const currentIndex = WORKFLOW_STAGE_INDEX[status]
  if (stageIndex < currentIndex) {
    return 'complete'
  }
  return stageIndex === currentIndex ? 'active' : 'pending'
}

export function examActionHint(exam: Exam, role: ExamRole): string {
  if (exam.revisionOpen && exam.status === 'Forwarded') {
    return 'A revision is open. Update the paper, then forward it for approval again.'
  }

  switch (exam.status) {
    case 'Initiated':
      return role === 'Approver'
        ? 'An administrator or teacher still needs to add questions.'
        : 'Add questions from the question bank. Saving a question list moves the exam to Forwarded.'
    case 'Forwarded':
      return 'Match the configured question counts and total marks, then forward the exam for approval.'
    case 'Forwarded to Approval':
      return role === 'Approver'
        ? 'Review the paper, then approve it, reject it, or send it back for revision.'
        : 'The approval authority is reviewing this paper. Editing is paused.'
    case 'Approved':
      return 'This paper is locked. An administrator can start a revision if it must change.'
    case 'Rejected':
      return 'The paper was rejected. Revise it, then forward it for approval again.'
    case 'Returned':
      return 'The paper was sent back. Revise it, then forward it for approval again.'
    default:
      return ''
  }
}

export function resolveExamQuestionMeta(
  questionId: string,
  questions: Question[],
  topics: Topic[],
  subjects: Subject[],
): ExamQuestionMeta {
  const question = questions.find((item) => item.id === questionId)
  if (!question) {
    return { subjectName: 'Unknown', topicName: 'Unknown', category: null }
  }
  const topic = topics.find((item) => item.id === question.topicId)
  const subject = subjects.find((item) => item.id === topic?.subjectId)
  return {
    question,
    subjectName: subject?.name ?? 'Unknown subject',
    topicName: topic?.name ?? 'Unknown topic',
    category: questionCategory(question),
  }
}

export function classificationLabel(classification: QuestionClassification): string {
  return classification === 'Final' ? 'Final' : 'Draft'
}
