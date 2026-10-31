import type { ImportField, ImportRowDraft } from '@/types/questionImport'

export const IMPORT_COLUMN_HEADERS: { field: ImportField; header: string }[] = [
  { field: 'questionId', header: 'Question ID' },
  { field: 'course', header: 'Course' },
  { field: 'topic', header: 'Topic' },
  { field: 'questionType', header: 'Question Type' },
  { field: 'difficulty', header: 'Difficulty Level' },
  { field: 'questionText', header: 'Question Text' },
  { field: 'optionA', header: 'Option A' },
  { field: 'optionB', header: 'Option B' },
  { field: 'optionC', header: 'Option C' },
  { field: 'optionD', header: 'Option D' },
  { field: 'correctAnswer', header: 'Correct Answer' },
  { field: 'explanation', header: 'Explanation' },
  { field: 'modelAnswer', header: 'Model Answer' },
  { field: 'answerGuidelines', header: 'Answer Guidelines' },
  { field: 'marks', header: 'Marks' },
]

export const TEMPLATE_FILE_NAME = 'question-bank-import-template.xlsx'
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024
export const MAX_IMPORT_ROWS = 2000
export const IMPORT_PAGE_SIZE = 8
export const IMPORTED_BY = 'Administrator'

const HEADER_ALIASES: Record<string, ImportField> = {
  'question id': 'questionId',
  course: 'course',
  topic: 'topic',
  'question type': 'questionType',
  'difficulty level': 'difficulty',
  'question text': 'questionText',
  'option a': 'optionA',
  'option b': 'optionB',
  'option c': 'optionC',
  'option d': 'optionD',
  'correct answer': 'correctAnswer',
  explanation: 'explanation',
  'model answer': 'modelAnswer',
  'answer guidelines': 'answerGuidelines',
  marks: 'marks',
}

export function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function fieldForHeader(header: string): ImportField | undefined {
  return HEADER_ALIASES[normalizeHeader(header)]
}

export function createImportRowKey(excelRow: number): string {
  return `row-${excelRow}-${Math.random().toString(36).slice(2, 8)}`
}

export function emptyImportDraft(excelRow: number, rowKey = createImportRowKey(excelRow)): ImportRowDraft {
  return {
    rowKey,
    excelRow,
    questionId: '',
    course: '',
    topic: '',
    questionType: '',
    difficulty: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: '',
    modelAnswer: '',
    answerGuidelines: '',
    marks: '',
  }
}

export function importRowCells(row: ImportRowDraft): string[] {
  return IMPORT_COLUMN_HEADERS.map((column) => row[column.field])
}

export function isImportDraftBlank(row: ImportRowDraft): boolean {
  return IMPORT_COLUMN_HEADERS.every((column) => row[column.field].trim() === '')
}
