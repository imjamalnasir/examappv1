import type { DifficultyLevel, QuestionType } from '@/types/question'

export const IMPORT_FIELDS = [
  'questionId',
  'course',
  'topic',
  'questionType',
  'difficulty',
  'questionText',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'explanation',
  'modelAnswer',
  'answerGuidelines',
  'marks',
] as const

export type ImportField = (typeof IMPORT_FIELDS)[number]

export type ImportRowStatus = 'valid' | 'invalid' | 'warning'
export type ImportOutcome = 'imported' | 'failed' | 'skipped'
export type ImportRecordStatus = 'Completed' | 'Partial' | 'Failed'
export type ImportWizardStep = 1 | 2 | 3 | 4 | 5

export interface ImportIssue {
  field?: ImportField
  message: string
}

export interface ImportRowDraft {
  rowKey: string
  excelRow: number
  questionId: string
  course: string
  topic: string
  questionType: string
  difficulty: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  modelAnswer: string
  answerGuidelines: string
  marks: string
}

export interface ValidatedImportRow extends ImportRowDraft {
  status: ImportRowStatus
  errors: ImportIssue[]
  warnings: ImportIssue[]
  courseId?: string
  topicId?: string
  resolvedCourseLabel?: string
  resolvedTopicLabel?: string
  normalizedType?: QuestionType
  normalizedDifficulty?: DifficultyLevel
}

export interface ImportReportRow {
  excelRow: number
  questionId: string
  course: string
  topic: string
  questionType: string
  questionText: string
  outcome: ImportOutcome
  message: string
}

export interface QuestionImportRecord {
  id: string
  fileName: string
  importDate: string
  totalQuestions: number
  successfullyImported: number
  failed: number
  skipped: number
  importedBy: string
  status: ImportRecordStatus
  reportRows: ImportReportRow[]
}

export type NewQuestionImportRecord = Omit<QuestionImportRecord, 'id'>

export interface QuestionImportSeed {
  guide: string
  questionId: string
  course: string
  topic: string
  questionType: string
  difficulty: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  modelAnswer: string
  answerGuidelines: string
  marks: string
}
