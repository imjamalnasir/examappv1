import * as XLSX from 'xlsx'
import {
  IMPORT_COLUMN_HEADERS,
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ROWS,
  TEMPLATE_FILE_NAME,
  emptyImportDraft,
  fieldForHeader,
  importRowCells,
  isImportDraftBlank,
} from '@/modules/question-import/importFields'
import { QUESTION_IMPORT_SEEDS } from '@/modules/question-import/sampleRows'
import type {
  ImportField,
  ImportReportRow,
  ImportRowDraft,
  QuestionImportRecord,
  ValidatedImportRow,
} from '@/types/questionImport'

const TEMPLATE_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export interface ParsedQuestionWorkbook {
  rows: ImportRowDraft[]
  ignoredColumns: string[]
  sheetName: string
}

function cellText(value: unknown): string {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : String(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False'
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
  }
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text.trim()
  }
  return String(value).trim()
}

function buildTemplateWorkbook(): XLSX.WorkBook {
  const instructionRows: string[][] = [
    ['Question Bank Import Template'],
    [''],
    ['Fill in the Questions sheet. Keep the header row and do not insert rows above it.'],
    ['Course must match an existing course name, code, or ID. Topic must match an existing topic name or ID.'],
    ['The topic must belong to the selected course. This file does not create courses or topics.'],
    ['Question ID is optional. Leave it blank and the import will generate one.'],
    ['Question Type must be T/F, MCQs, or Subjective. Difficulty Level must be Easy, Medium, or Hard.'],
    [''],
    ['True / False: Question Text is required. Correct Answer must be True or False. Leave the option columns empty.'],
    ['MCQs: Question Text is required. Enter at least two options. Correct Answer uses A, B, C, or D. Separate multiple answers with commas, such as A,C.'],
    ['Subjective: Question Text is required. Model Answer, Answer Guidelines, and Marks are optional. Marks must be a positive number when provided.'],
    [''],
    ['The Questions sheet includes valid examples and rows that demonstrate validation messages. Remove the sample rows before a real import.'],
    [''],
    ['Excel Row', 'What the sample row demonstrates'],
    ...QUESTION_IMPORT_SEEDS.map((item, index) => [String(index + 2), item.guide]),
  ]

  const questionRows = [
    IMPORT_COLUMN_HEADERS.map((column) => column.header),
    ...QUESTION_IMPORT_SEEDS.map((item) => {
      const draft = emptyImportDraft(0, 'template')
      return importRowCells({ ...draft, ...item, excelRow: 0, rowKey: 'template' })
    }),
  ]

  const instructions = XLSX.utils.aoa_to_sheet(instructionRows)
  instructions['!cols'] = [{ wch: 18 }, { wch: 110 }]
  const questions = XLSX.utils.aoa_to_sheet(questionRows)
  questions['!cols'] = [
    { wch: 14 },
    { wch: 52 },
    { wch: 42 },
    { wch: 16 },
    { wch: 18 },
    { wch: 78 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 56 },
    { wch: 56 },
    { wch: 56 },
    { wch: 10 },
  ]
  const lastRow = questionRows.length - 1
  questions['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: lastRow, c: IMPORT_COLUMN_HEADERS.length - 1 },
    }),
  }

  const workbook = XLSX.utils.book_new()
  workbook.Props = {
    Title: 'Question Bank Import Template',
    Subject: 'Question import template',
  }
  XLSX.utils.book_append_sheet(workbook, questions, 'Questions')
  XLSX.utils.book_append_sheet(workbook, instructions, 'Instructions')
  return workbook
}

export function downloadQuestionTemplate(): void {
  XLSX.writeFile(buildTemplateWorkbook(), TEMPLATE_FILE_NAME)
}

export function excelFileError(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension !== 'xlsx' && extension !== 'xls') {
    return 'Upload an Excel file ending in .xlsx or .xls.'
  }
  if (file.size === 0) {
    return 'The selected file is empty.'
  }
  if (file.size > MAX_IMPORT_BYTES) {
    return 'The file is larger than 5 MB. Split it into smaller workbooks.'
  }
  return null
}

export function createTemplateFile(): File {
  const buffer = XLSX.write(buildTemplateWorkbook(), { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  return new File([buffer], TEMPLATE_FILE_NAME, { type: TEMPLATE_MIME })
}

/**
 * Client-side workbook parser. A future import API can return the same row shape.
 */
export function parseQuestionWorkbook(data: ArrayBuffer): ParsedQuestionWorkbook {
  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(data, { type: 'array', cellDates: true })
  } catch {
    throw new Error('The file could not be read. Upload a valid .xlsx or .xls workbook.')
  }

  if (workbook.SheetNames.length === 0) {
    throw new Error('The workbook does not contain any sheets.')
  }

  const namedSheet = workbook.SheetNames.find((name) => name.trim().toLowerCase() === 'questions')
  const sheetName = namedSheet ?? workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error('The Questions sheet could not be read.')
  }

  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: true,
  })

  if (matrix.length === 0) {
    throw new Error('The Questions sheet is empty.')
  }

  const headerRow = matrix[0] ?? []
  const columnIndex = new Map<ImportField, number>()
  const ignoredColumns: string[] = []
  const seen = new Set<ImportField>()

  headerRow.forEach((cell, index) => {
    const header = cellText(cell)
    if (!header) {
      return
    }
    const field = fieldForHeader(header)
    if (!field) {
      ignoredColumns.push(header)
      return
    }
    if (seen.has(field)) {
      throw new Error(`The Questions sheet has a duplicate column: ${header}.`)
    }
    seen.add(field)
    columnIndex.set(field, index)
  })

  const missing = IMPORT_COLUMN_HEADERS.filter((column) => !columnIndex.has(column.field)).map(
    (column) => column.header,
  )
  if (missing.length > 0) {
    throw new Error(
      namedSheet
        ? `The Questions sheet is missing required columns: ${missing.join(', ')}.`
        : 'The workbook is missing a Questions sheet with the required column headers.',
    )
  }

  const rows: ImportRowDraft[] = []
  matrix.slice(1).forEach((cells, index) => {
    const draft = emptyImportDraft(index + 2)
    IMPORT_COLUMN_HEADERS.forEach((column) => {
      const cellIndex = columnIndex.get(column.field)
      draft[column.field] = cellIndex === undefined ? '' : cellText(cells?.[cellIndex])
    })
    if (!isImportDraftBlank(draft)) {
      rows.push(draft)
    }
  })

  if (rows.length === 0) {
    throw new Error('The Questions sheet has no question rows.')
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new Error(`This file has ${rows.length} questions. Import files are limited to ${MAX_IMPORT_ROWS} rows.`)
  }

  return { rows, ignoredColumns, sheetName }
}

export function downloadErrorReport(rows: ValidatedImportRow[]): void {
  const invalidRows = rows.filter((row) => row.status === 'invalid')
  const header = ['Excel Row', ...IMPORT_COLUMN_HEADERS.map((column) => column.header), 'Errors', 'Warnings']
  const body = invalidRows.map((row) => [
    row.excelRow,
    ...importRowCells(row),
    row.errors.map((issue) => issue.message).join('; '),
    row.warnings.map((issue) => issue.message).join('; '),
  ])
  writeSheet('question-import-errors.xlsx', 'Invalid Rows', [header, ...body])
}

export function downloadImportReport(record: QuestionImportRecord): void {
  const header = [
    'Excel Row',
    'Question ID',
    'Course',
    'Topic',
    'Question Type',
    'Question Text',
    'Result',
    'Message',
  ]
  const body = record.reportRows.map((row) => [
    row.excelRow,
    row.questionId,
    row.course,
    row.topic,
    row.questionType,
    row.questionText,
    outcomeLabel(row.outcome),
    row.message,
  ])
  writeSheet(`question-import-report-${record.id}.xlsx`, 'Import Report', [header, ...body])
}

function outcomeLabel(outcome: ImportReportRow['outcome']): string {
  if (outcome === 'imported') {
    return 'Imported'
  }
  if (outcome === 'failed') {
    return 'Failed'
  }
  return 'Skipped'
}

function writeSheet(fileName: string, sheetName: string, rows: (string | number)[][]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}
