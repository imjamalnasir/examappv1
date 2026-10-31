import type { Question, QuestionFormValues, QuestionStatus } from '@/types/question'
import { createSequentialId } from '@/utils/id'
import { todayDateString } from '@/utils/format'
import { cleanQuestionHtml } from '@/utils/richText'

function optionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

export function getQuestionById(questions: Question[], id: string): Question | undefined {
  return questions.find((question) => question.id === id)
}

export function isQuestionIdUnique(
  questions: Question[],
  questionId: string,
  excludeId?: string,
): boolean {
  const normalized = questionId.trim().toUpperCase()
  return !questions.some(
    (question) => question.id.toUpperCase() === normalized && question.id !== excludeId,
  )
}

export function suggestQuestionId(questions: Question[]): string {
  return createSequentialId(
    'QB',
    questions.map((question) => question.id),
  )
}

export function toQuestion(
  values: QuestionFormValues,
  meta: { status: QuestionStatus; createdDate: string },
): Question {
  if (values.type === '' || values.difficulty === '') {
    throw new Error('Question form is incomplete.')
  }

  const base = {
    id: values.questionId.trim().toUpperCase(),
    courseId: values.courseId,
    topicId: values.topicId,
    difficulty: values.difficulty,
    status: meta.status,
    createdDate: meta.createdDate,
    updatedDate: todayDateString(),
  }

  if (values.type === 'true-false') {
    if (values.trueFalse.correctAnswer !== 'true' && values.trueFalse.correctAnswer !== 'false') {
      throw new Error('True / False answer is missing.')
    }

    return {
      ...base,
      type: 'true-false',
      content: {
        questionText: cleanQuestionHtml(values.trueFalse.questionText),
        correctAnswer: values.trueFalse.correctAnswer,
        explanation: values.trueFalse.explanation.trim(),
      },
    }
  }

  if (values.type === 'mcq') {
    return {
      ...base,
      type: 'mcq',
      content: {
        questionText: cleanQuestionHtml(values.mcq.questionText),
        answerMode: values.mcq.answerMode,
        explanation: values.mcq.explanation.trim(),
        options: values.mcq.options.map((option, index) => {
          const label = optionLabel(index)
          return {
            id: `OPT-${base.id}-${label}`,
            label,
            text: option.text.trim(),
            isCorrect: option.isCorrect,
          }
        }),
      },
    }
  }

  const marksText = values.subjective.marks.trim()

  return {
    ...base,
    type: 'subjective',
    content: {
      questionText: cleanQuestionHtml(values.subjective.questionText),
      modelAnswer: values.subjective.modelAnswer.trim(),
      guidelines: values.subjective.guidelines.trim(),
      marks: marksText === '' ? null : Number(marksText),
    },
  }
}
