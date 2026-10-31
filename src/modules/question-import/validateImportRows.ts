import type { Course } from '@/types/course'
import type { Question } from '@/types/question'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'
import type {
  ImportField,
  ImportIssue,
  ImportRowDraft,
  ValidatedImportRow,
} from '@/types/questionImport'
import { plainTextFromHtml } from '@/utils/richText'
import { getTopicsByCourse } from '@/utils/relationships'

export interface ImportValidationContext {
  courses: Course[]
  subjects: Subject[]
  topics: Topic[]
  questions: Question[]
}

export interface McqAnswerParse {
  unique: string[]
  duplicates: string[]
  invalid: string[]
}

const TYPE_ALIASES: Record<string, ValidatedImportRow['normalizedType']> = {
  't/f': 'true-false',
  tf: 'true-false',
  'true/false': 'true-false',
  'true / false': 'true-false',
  'true-false': 'true-false',
  'true false': 'true-false',
  mcq: 'mcq',
  mcqs: 'mcq',
  'multiple choice': 'mcq',
  'multiple-choice': 'mcq',
  'multiple choice questions': 'mcq',
  subjective: 'subjective',
}

const DIFFICULTY_ALIASES: Record<string, ValidatedImportRow['normalizedDifficulty']> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const OPTION_FIELDS: { label: string; field: ImportField }[] = [
  { label: 'A', field: 'optionA' },
  { label: 'B', field: 'optionB' },
  { label: 'C', field: 'optionC' },
  { label: 'D', field: 'optionD' },
]

export function normalizeLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u2032`]/g, "'")
    .replace(/\s+/g, ' ')
}

export function matchCourse(courses: Course[], value: string): Course | undefined {
  const key = normalizeLookup(value)
  if (!key) {
    return undefined
  }

  return (
    courses.find((course) => normalizeLookup(course.code) === key) ??
    courses.find((course) => normalizeLookup(course.id) === key) ??
    courses.find((course) => normalizeLookup(course.name) === key)
  )
}

export function matchTopic(topics: Topic[], value: string): Topic | undefined {
  const key = normalizeLookup(value)
  if (!key) {
    return undefined
  }

  return (
    topics.find((topic) => normalizeLookup(topic.id) === key) ??
    topics.find((topic) => normalizeLookup(topic.name) === key)
  )
}

export function normalizeQuestionType(value: string): ValidatedImportRow['normalizedType'] {
  return TYPE_ALIASES[normalizeLookup(value).replace(/\./g, '')]
}

export function normalizeDifficulty(value: string): ValidatedImportRow['normalizedDifficulty'] {
  return DIFFICULTY_ALIASES[normalizeLookup(value)]
}

export function questionTypeImportLabel(type: NonNullable<ValidatedImportRow['normalizedType']>): string {
  if (type === 'true-false') {
    return 'T/F'
  }
  if (type === 'mcq') {
    return 'MCQs'
  }
  return 'Subjective'
}

export function parseMcqAnswerLabels(value: string): McqAnswerParse {
  const parts = value
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
  const unique: string[] = []
  const duplicates: string[] = []
  const invalid: string[] = []
  const seen = new Set<string>()

  parts.forEach((part) => {
    const label = part.toUpperCase()
    if (!OPTION_FIELDS.some((option) => option.label === label)) {
      invalid.push(part)
      return
    }
    if (seen.has(label)) {
      if (!duplicates.includes(label)) {
        duplicates.push(label)
      }
      return
    }
    seen.add(label)
    unique.push(label)
  })

  return { unique, duplicates, invalid }
}

function optionText(row: ImportRowDraft, field: ImportField): string {
  return row[field].trim()
}

function pushIssue(list: ImportIssue[], field: ImportField | undefined, message: string) {
  if (list.some((issue) => issue.message === message)) {
    return
  }
  list.push(field ? { field, message } : { message })
}

export function validateImportRows(
  rows: ImportRowDraft[],
  context: ImportValidationContext,
): ValidatedImportRow[] {
  const existingIds = new Set(context.questions.map((question) => question.id.toUpperCase()))
  const idCounts = new Map<string, number>()

  rows.forEach((row) => {
    const id = row.questionId.trim().toUpperCase()
    if (!id) {
      return
    }
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1)
  })

  const existingTextKeys = new Map<string, string[]>()
  context.questions.forEach((question) => {
    const key = `${question.courseId}|${normalizeLookup(plainTextFromHtml(question.content.questionText))}`
    const ids = existingTextKeys.get(key) ?? []
    ids.push(question.id)
    existingTextKeys.set(key, ids)
  })

  const resolved = rows.map((row) => {
    const course = matchCourse(context.courses, row.course)
    const courseTopics = course
      ? getTopicsByCourse(context.topics, context.subjects, course.id)
      : []
    const topicInCourse = matchTopic(courseTopics, row.topic)
    const topicAnywhere = matchTopic(context.topics, row.topic)
    return { row, course, topicInCourse, topicAnywhere }
  })

  const fileTextRows = new Map<string, number[]>()
  resolved.forEach(({ row, course }) => {
    if (!course || !row.questionText.trim()) {
      return
    }
    const key = `${course.id}|${normalizeLookup(row.questionText)}`
    const excelRows = fileTextRows.get(key) ?? []
    excelRows.push(row.excelRow)
    fileTextRows.set(key, excelRows)
  })

  return resolved.map(({ row, course, topicInCourse, topicAnywhere }) => {
    const errors: ImportIssue[] = []
    const warnings: ImportIssue[] = []
    const normalizedType = normalizeQuestionType(row.questionType)
    const normalizedDifficulty = normalizeDifficulty(row.difficulty)
    const questionId = row.questionId.trim().toUpperCase()

    if (!row.questionText.trim()) {
      pushIssue(errors, 'questionText', 'Question text is required.')
    }

    if (!row.course.trim()) {
      pushIssue(errors, 'course', 'Course is required.')
    } else if (!course) {
      pushIssue(errors, 'course', 'Course not found.')
    } else if (course.status === 'Inactive') {
      pushIssue(warnings, 'course', 'Course is inactive.')
    }

    if (!row.topic.trim()) {
      pushIssue(errors, 'topic', 'Topic is required.')
    } else if (!topicAnywhere) {
      pushIssue(errors, 'topic', 'Topic not found.')
    } else if (course && !topicInCourse) {
      pushIssue(errors, 'topic', 'Topic does not belong to selected course.')
    } else if (topicInCourse?.status === 'Inactive') {
      pushIssue(warnings, 'topic', 'Topic is inactive.')
    }

    if (!row.questionType.trim()) {
      pushIssue(errors, 'questionType', 'Question type is required.')
    } else if (!normalizedType) {
      pushIssue(errors, 'questionType', 'Invalid question type. Use T/F, MCQs, or Subjective.')
    }

    if (!row.difficulty.trim()) {
      pushIssue(errors, 'difficulty', 'Difficulty level is required.')
    } else if (!normalizedDifficulty) {
      pushIssue(errors, 'difficulty', 'Invalid difficulty level.')
    }

    if (questionId) {
      if ((idCounts.get(questionId) ?? 0) > 1) {
        pushIssue(errors, 'questionId', 'Duplicate Question ID.')
      }
      if (existingIds.has(questionId)) {
        pushIssue(errors, 'questionId', 'Question ID already exists in the Question Bank.')
      }
    }

    if (course && row.questionText.trim()) {
      const key = `${course.id}|${normalizeLookup(row.questionText)}`
      const excelRows = fileTextRows.get(key) ?? []
      if (excelRows.length > 1) {
        const others = excelRows.filter((excelRow) => excelRow !== row.excelRow)
        pushIssue(
          warnings,
          'questionText',
          `Possible duplicate question in this file (rows ${others.join(', ')}).`,
        )
      }
      const existing = existingTextKeys.get(key) ?? []
      if (existing.length > 0) {
        pushIssue(
          warnings,
          'questionText',
          `Possible duplicate of existing question ${existing.join(', ')}.`,
        )
      }
    }

    if (normalizedType === 'true-false') {
      validateTrueFalse(row, errors, warnings)
    } else if (normalizedType === 'mcq') {
      validateMcq(row, errors, warnings)
    } else if (normalizedType === 'subjective') {
      validateSubjective(row, errors, warnings)
    }

    const status = errors.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'valid'

    return {
      ...row,
      status,
      errors,
      warnings,
      courseId: course?.id,
      topicId: topicInCourse?.id,
      resolvedCourseLabel: course ? `${course.code} — ${course.name}` : undefined,
      resolvedTopicLabel: topicInCourse ? `${topicInCourse.id} — ${topicInCourse.name}` : undefined,
      normalizedType,
      normalizedDifficulty,
    }
  })
}

function validateTrueFalse(row: ImportRowDraft, errors: ImportIssue[], warnings: ImportIssue[]) {
  const answer = row.correctAnswer.trim().toLowerCase()
  if (!answer) {
    pushIssue(errors, 'correctAnswer', 'Correct answer is missing.')
  } else if (answer !== 'true' && answer !== 'false') {
    pushIssue(errors, 'correctAnswer', 'Correct answer must be True or False.')
  }

  const ignored: string[] = []
  if (OPTION_FIELDS.some((option) => optionText(row, option.field))) {
    ignored.push('option columns')
  }
  if (row.modelAnswer.trim() || row.answerGuidelines.trim() || row.marks.trim()) {
    ignored.push('model answer, guidelines, and marks')
  }
  if (ignored.length > 0) {
    const field = OPTION_FIELDS.some((option) => optionText(row, option.field))
      ? 'optionA'
      : 'modelAnswer'
    pushIssue(warnings, field, `${sentence(ignored)} are ignored for True / False questions.`)
  }
}

function validateMcq(row: ImportRowDraft, errors: ImportIssue[], warnings: ImportIssue[]) {
  const filled = OPTION_FIELDS.filter((option) => optionText(row, option.field))
  if (filled.length < 2) {
    pushIssue(errors, 'optionA', 'MCQ has fewer than two options.')
  }

  const texts = filled.map((option) => optionText(row, option.field).toLowerCase())
  if (new Set(texts).size !== texts.length) {
    pushIssue(warnings, 'optionA', 'Options contain duplicate text.')
  }

  if (!row.correctAnswer.trim()) {
    pushIssue(errors, 'correctAnswer', 'Correct answer is missing.')
  } else {
    const parsed = parseMcqAnswerLabels(row.correctAnswer)
    if (parsed.invalid.length > 0) {
      pushIssue(
        errors,
        'correctAnswer',
        'Correct answer must reference option labels such as A, B, C, or D.',
      )
    }
    if (parsed.duplicates.length > 0) {
      const label = parsed.duplicates.length === 1 ? parsed.duplicates[0] : parsed.duplicates.join(', ')
      pushIssue(errors, 'correctAnswer', `Duplicate option label ${label}.`)
    }

    const emptyLabels = parsed.unique.filter((label) => {
      const option = OPTION_FIELDS.find((item) => item.label === label)
      return option ? optionText(row, option.field) === '' : false
    })
    if (emptyLabels.length > 0) {
      const option = OPTION_FIELDS.find((item) => item.label === emptyLabels[0])
      pushIssue(errors, option?.field ?? 'correctAnswer', 'Correct answer references an empty option.')
    }
  }

  if (row.modelAnswer.trim() || row.answerGuidelines.trim() || row.marks.trim()) {
    pushIssue(warnings, 'modelAnswer', 'Model answer, guidelines, and marks are ignored for MCQs.')
  }
}

function validateSubjective(row: ImportRowDraft, errors: ImportIssue[], warnings: ImportIssue[]) {
  const marks = row.marks.trim()
  if (marks) {
    const numeric = Number(marks)
    if (!/^\d+(\.\d+)?$/.test(marks) || !Number.isFinite(numeric) || numeric <= 0) {
      pushIssue(errors, 'marks', 'Marks must be a valid positive number.')
    }
  }

  const hasOptions = OPTION_FIELDS.some((option) => optionText(row, option.field))
  const hasAnswer = row.correctAnswer.trim().length > 0
  if (hasOptions || hasAnswer) {
    pushIssue(
      warnings,
      hasAnswer ? 'correctAnswer' : 'optionA',
      'Option columns and correct answer are ignored for subjective questions.',
    )
  }
}

function sentence(parts: string[]): string {
  if (parts.length === 1) {
    return capitalize(parts[0])
  }
  return capitalize(parts.join(' and '))
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function countImportStatuses(rows: ValidatedImportRow[]) {
  return rows.reduce(
    (counts, row) => {
      counts.total += 1
      counts[row.status] += 1
      return counts
    },
    { total: 0, valid: 0, invalid: 0, warning: 0 },
  )
}

export function issuesForField(issues: ImportIssue[], field: ImportField): string | undefined {
  const messages = issues.filter((issue) => issue.field === field).map((issue) => issue.message)
  return messages.length > 0 ? messages.join(' ') : undefined
}
