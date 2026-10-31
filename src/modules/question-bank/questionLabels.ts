import type { DifficultyLevel, QuestionType } from '@/types/question'

export const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
  { label: 'True / False', value: 'true-false' },
  { label: 'MCQs', value: 'mcq' },
  { label: 'Subjective', value: 'subjective' },
]

export const DIFFICULTY_OPTIONS: { label: string; value: DifficultyLevel }[] = [
  { label: 'Easy', value: 'Easy' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Hard', value: 'Hard' },
]

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  'true-false': 'Questions with True or False as answers',
  mcq: 'Questions with multiple selectable options',
  subjective: 'Descriptive questions requiring written answers',
}

export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  Easy: 'Basic knowledge and understanding',
  Medium: 'Moderate understanding and application',
  Hard: 'Advanced knowledge, analysis, and problem-solving',
}

export function questionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

export function isQuestionType(value: string): value is QuestionType {
  return QUESTION_TYPE_OPTIONS.some((option) => option.value === value)
}

export function isDifficultyLevel(value: string): value is DifficultyLevel {
  return DIFFICULTY_OPTIONS.some((option) => option.value === value)
}
