import { MAX_MCQ_OPTIONS, MIN_MCQ_OPTIONS } from '@/modules/question-bank/questionFormState'
import { isQuestionIdUnique } from '@/services/questionService'
import type { Course } from '@/types/course'
import type { Question, QuestionFormErrors, QuestionFormValues } from '@/types/question'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'
import { isRichTextEmpty } from '@/utils/richText'
import { getTopicsByCourse } from '@/utils/relationships'

export function hasQuestionFormErrors(errors: QuestionFormErrors): boolean {
  if (
    errors.questionId ||
    errors.courseId ||
    errors.topicId ||
    errors.type ||
    errors.difficulty ||
    errors.questionText ||
    errors.correctAnswer ||
    errors.options ||
    errors.marks
  ) {
    return true
  }

  return Boolean(errors.optionTexts && Object.values(errors.optionTexts).some(Boolean))
}

function activeQuestionText(values: QuestionFormValues): string {
  if (values.type === 'true-false') {
    return values.trueFalse.questionText
  }
  if (values.type === 'mcq') {
    return values.mcq.questionText
  }
  if (values.type === 'subjective') {
    return values.subjective.questionText
  }
  return ''
}

export function validateQuestionForm(
  values: QuestionFormValues,
  questions: Question[],
  courses: Course[],
  subjects: Subject[],
  topics: Topic[],
  excludeId?: string,
): QuestionFormErrors {
  const errors: QuestionFormErrors = {}
  const questionId = values.questionId.trim()

  if (!questionId) {
    errors.questionId = 'Question ID is required.'
  } else if (!/^[A-Za-z0-9-]{2,20}$/.test(questionId)) {
    errors.questionId = 'Use 2–20 letters, numbers, or hyphens.'
  } else if (!isQuestionIdUnique(questions, questionId, excludeId)) {
    errors.questionId = 'Question ID already exists.'
  }

  if (!values.courseId) {
    errors.courseId = 'Course is required.'
  } else if (!courses.some((course) => course.id === values.courseId)) {
    errors.courseId = 'Selected course is invalid.'
  }

  if (!values.topicId) {
    errors.topicId = 'Topic is required.'
  } else if (!topics.some((topic) => topic.id === values.topicId)) {
    errors.topicId = 'Selected topic is invalid.'
  } else if (
    values.courseId &&
    !getTopicsByCourse(topics, subjects, values.courseId).some((topic) => topic.id === values.topicId)
  ) {
    errors.topicId = 'Selected topic must belong to the chosen course.'
  }

  if (!values.type) {
    errors.type = 'Question type is required.'
  }

  if (!values.difficulty) {
    errors.difficulty = 'Difficulty level is required.'
  }

  if (values.type && isRichTextEmpty(activeQuestionText(values))) {
    errors.questionText = 'Question text is required.'
  }

  if (values.type === 'true-false' && !values.trueFalse.correctAnswer) {
    errors.correctAnswer = 'Select True or False as the correct answer.'
  }

  if (values.type === 'mcq') {
    const optionTexts: Record<string, string> = {}
    values.mcq.options.forEach((option) => {
      if (!option.text.trim()) {
        optionTexts[option.clientId] = 'Option text is required.'
      }
    })
    if (Object.keys(optionTexts).length > 0) {
      errors.optionTexts = optionTexts
    }

    const messages: string[] = []
    if (values.mcq.options.length < MIN_MCQ_OPTIONS) {
      messages.push('Add at least two options.')
    }
    if (values.mcq.options.length > MAX_MCQ_OPTIONS) {
      messages.push('You can add up to 8 options.')
    }

    const correctCount = values.mcq.options.filter((option) => option.isCorrect).length
    if (correctCount === 0) {
      messages.push('Mark at least one correct answer.')
    } else if (values.mcq.answerMode === 'single' && correctCount > 1) {
      messages.push('Single-answer MCQs can have only one correct option.')
    }

    if (messages.length > 0) {
      errors.options = messages.join(' ')
    }
  }

  if (values.type === 'subjective' && values.subjective.marks.trim()) {
    const marks = Number(values.subjective.marks)
    if (!Number.isFinite(marks) || marks <= 0) {
      errors.marks = 'Marks must be a number greater than 0.'
    } else if (marks > 100) {
      errors.marks = 'Marks cannot exceed 100.'
    }
  }

  return errors
}
