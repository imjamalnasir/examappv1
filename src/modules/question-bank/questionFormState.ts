import { questionTypeLabel } from '@/modules/question-bank/questionLabels'
import type {
  McqOptionFormValue,
  Question,
  QuestionFormValues,
  QuestionType,
} from '@/types/question'
import { isRichTextEmpty } from '@/utils/richText'

export const MIN_MCQ_OPTIONS = 2
export const MAX_MCQ_OPTIONS = 8

let optionSequence = 0

export function createOptionClientId(): string {
  optionSequence += 1
  return `opt-${optionSequence}-${Math.random().toString(36).slice(2, 8)}`
}

export function optionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

export function createDefaultOptions(): McqOptionFormValue[] {
  return Array.from({ length: 4 }, () => ({
    clientId: createOptionClientId(),
    text: '',
    isCorrect: false,
  }))
}

export function emptyQuestionFormValues(questionId = ''): QuestionFormValues {
  return {
    questionId,
    courseId: '',
    topicId: '',
    type: '',
    difficulty: '',
    trueFalse: {
      questionText: '',
      correctAnswer: '',
      explanation: '',
    },
    mcq: {
      questionText: '',
      answerMode: 'single',
      options: createDefaultOptions(),
      explanation: '',
    },
    subjective: {
      questionText: '',
      modelAnswer: '',
      guidelines: '',
      marks: '',
    },
  }
}

export function questionToFormValues(question: Question): QuestionFormValues {
  const values = emptyQuestionFormValues(question.id)
  values.courseId = question.courseId
  values.topicId = question.topicId
  values.type = question.type
  values.difficulty = question.difficulty

  if (question.type === 'true-false') {
    values.trueFalse = {
      questionText: question.content.questionText,
      correctAnswer: question.content.correctAnswer,
      explanation: question.content.explanation,
    }
  } else if (question.type === 'mcq') {
    values.mcq = {
      questionText: question.content.questionText,
      answerMode: question.content.answerMode,
      explanation: question.content.explanation,
      options: question.content.options.map((option) => ({
        clientId: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    }
  } else {
    values.subjective = {
      questionText: question.content.questionText,
      modelAnswer: question.content.modelAnswer,
      guidelines: question.content.guidelines,
      marks: question.content.marks === null ? '' : String(question.content.marks),
    }
  }

  return values
}

function textOf(values: QuestionFormValues, type: QuestionType): string {
  if (type === 'true-false') {
    return values.trueFalse.questionText
  }
  if (type === 'mcq') {
    return values.mcq.questionText
  }
  return values.subjective.questionText
}

function withText(
  values: QuestionFormValues,
  type: QuestionType,
  questionText: string,
): QuestionFormValues {
  if (type === 'true-false') {
    return { ...values, trueFalse: { ...values.trueFalse, questionText } }
  }
  if (type === 'mcq') {
    return { ...values, mcq: { ...values.mcq, questionText } }
  }
  return { ...values, subjective: { ...values.subjective, questionText } }
}

function clearAnswers(values: QuestionFormValues, type: QuestionType): QuestionFormValues {
  if (type === 'true-false') {
    return {
      ...values,
      trueFalse: {
        ...values.trueFalse,
        correctAnswer: '',
        explanation: '',
      },
    }
  }

  if (type === 'mcq') {
    return {
      ...values,
      mcq: {
        ...values.mcq,
        answerMode: 'single',
        explanation: '',
        options: createDefaultOptions(),
      },
    }
  }

  return {
    ...values,
    subjective: {
      ...values.subjective,
      modelAnswer: '',
      guidelines: '',
      marks: '',
    },
  }
}

export function hasDiscardableContent(values: QuestionFormValues, type: QuestionType): boolean {
  if (type === 'true-false') {
    return values.trueFalse.correctAnswer !== '' || values.trueFalse.explanation.trim() !== ''
  }

  if (type === 'mcq') {
    return (
      values.mcq.explanation.trim() !== '' ||
      values.mcq.options.some((option) => option.text.trim() !== '' || option.isCorrect)
    )
  }

  return (
    values.subjective.modelAnswer.trim() !== '' ||
    values.subjective.guidelines.trim() !== '' ||
    values.subjective.marks.trim() !== ''
  )
}

export function discardMessage(from: QuestionType, to: QuestionType): string {
  const lost =
    from === 'true-false'
      ? 'the selected correct answer and explanation'
      : from === 'mcq'
        ? 'the answer options and explanation'
        : 'the model answer, guidelines, and marks'

  return `Changing this question from ${questionTypeLabel(from)} to ${questionTypeLabel(to)} will discard ${lost}. The question text is kept, and it is copied to the new type when that type does not already have question text.`
}

export function changeQuestionType(
  values: QuestionFormValues,
  nextType: QuestionType,
): QuestionFormValues {
  if (values.type === '' || values.type === nextType) {
    return { ...values, type: nextType }
  }

  const sourceText = textOf(values, values.type)
  const withNextType = { ...values, type: nextType }
  const copied =
    isRichTextEmpty(textOf(withNextType, nextType)) && !isRichTextEmpty(sourceText)
      ? withText(withNextType, nextType, sourceText)
      : withNextType

  return clearAnswers(copied, values.type)
}
