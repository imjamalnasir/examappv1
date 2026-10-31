import type { Question } from '@/types/question'
import type { ImportReportRow, ValidatedImportRow } from '@/types/questionImport'
import { parseMcqAnswerLabels } from '@/modules/question-import/validateImportRows'
import { createSequentialId } from '@/utils/id'
import { cleanQuestionHtml } from '@/utils/richText'

function plainTextToQuestionHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const html = escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
  return cleanQuestionHtml(html)
}

export function assignQuestionIds(rows: ValidatedImportRow[], existingIds: string[]): Map<string, string> {
  const used = existingIds.map((id) => id.toUpperCase())
  const assigned = new Map<string, string>()

  rows.forEach((row) => {
    const explicit = row.questionId.trim().toUpperCase()
    if (!explicit) {
      return
    }
    assigned.set(row.rowKey, explicit)
    if (!used.some((id) => id.toUpperCase() === explicit)) {
      used.push(explicit)
    }
  })

  rows.forEach((row) => {
    if (assigned.has(row.rowKey)) {
      return
    }
    const nextId = createSequentialId('QB', used)
    used.push(nextId)
    assigned.set(row.rowKey, nextId)
  })

  return assigned
}

export function buildQuestionFromRow(
  row: ValidatedImportRow,
  questionId: string,
  createdDate: string,
): Question {
  if (!row.courseId || !row.topicId || !row.normalizedType || !row.normalizedDifficulty) {
    throw new Error('Row is missing a course, topic, or question details.')
  }

  const base = {
    id: questionId,
    courseId: row.courseId,
    topicId: row.topicId,
    difficulty: row.normalizedDifficulty,
    status: 'Published' as const,
    createdDate,
    updatedDate: createdDate,
  }
  const questionText = plainTextToQuestionHtml(row.questionText)
  if (!questionText) {
    throw new Error('Question text is required.')
  }

  if (row.normalizedType === 'true-false') {
    const answer = row.correctAnswer.trim().toLowerCase()
    if (answer !== 'true' && answer !== 'false') {
      throw new Error('Correct answer must be True or False.')
    }
    return {
      ...base,
      type: 'true-false',
      content: {
        questionText,
        correctAnswer: answer,
        explanation: row.explanation.trim(),
      },
    }
  }

  if (row.normalizedType === 'mcq') {
    const parsed = parseMcqAnswerLabels(row.correctAnswer)
    const options = [
      { label: 'A', text: row.optionA.trim() },
      { label: 'B', text: row.optionB.trim() },
      { label: 'C', text: row.optionC.trim() },
      { label: 'D', text: row.optionD.trim() },
    ]
      .filter((option) => option.text)
      .map((option) => ({
        id: `OPT-${questionId}-${option.label}`,
        label: option.label,
        text: option.text,
        isCorrect: parsed.unique.includes(option.label),
      }))
    const correctCount = options.filter((option) => option.isCorrect).length
    if (options.length < 2 || correctCount < 1) {
      throw new Error('MCQ options are incomplete.')
    }

    return {
      ...base,
      type: 'mcq',
      content: {
        questionText,
        answerMode: correctCount > 1 ? 'multiple' : 'single',
        explanation: row.explanation.trim(),
        options,
      },
    }
  }

  const marksText = row.marks.trim()
  const marks = marksText === '' ? null : Number(marksText)
  if (marksText && (!Number.isFinite(marks) || marks === null || marks <= 0)) {
    throw new Error('Marks must be a valid positive number.')
  }

  return {
    ...base,
    type: 'subjective',
    content: {
      questionText,
      modelAnswer: row.modelAnswer.trim(),
      guidelines: row.answerGuidelines.trim(),
      marks,
    },
  }
}

export function toReportRow(
  row: ValidatedImportRow,
  outcome: ImportReportRow['outcome'],
  questionId: string,
  message: string,
): ImportReportRow {
  return {
    excelRow: row.excelRow,
    questionId,
    course: row.course,
    topic: row.topic,
    questionType: row.questionType,
    questionText: row.questionText,
    outcome,
    message,
  }
}
