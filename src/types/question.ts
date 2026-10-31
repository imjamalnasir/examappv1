export type QuestionType = 'true-false' | 'mcq' | 'subjective'
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard'
export type QuestionStatus = 'Draft' | 'Published'
export type McqAnswerMode = 'single' | 'multiple'

export interface McqOption {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

interface QuestionBase {
  id: string
  courseId: string
  topicId: string
  difficulty: DifficultyLevel
  status: QuestionStatus
  createdDate: string
  updatedDate: string
}

export interface TrueFalseContent {
  questionText: string
  correctAnswer: 'true' | 'false'
  explanation: string
}

export interface McqContent {
  questionText: string
  answerMode: McqAnswerMode
  options: McqOption[]
  explanation: string
}

export interface SubjectiveContent {
  questionText: string
  modelAnswer: string
  guidelines: string
  marks: number | null
}

export type Question =
  | (QuestionBase & { type: 'true-false'; content: TrueFalseContent })
  | (QuestionBase & { type: 'mcq'; content: McqContent })
  | (QuestionBase & { type: 'subjective'; content: SubjectiveContent })

export interface McqOptionFormValue {
  clientId: string
  text: string
  isCorrect: boolean
}

export interface TrueFalseFormContent {
  questionText: string
  correctAnswer: '' | 'true' | 'false'
  explanation: string
}

export interface McqFormContent {
  questionText: string
  answerMode: McqAnswerMode
  options: McqOptionFormValue[]
  explanation: string
}

export interface SubjectiveFormContent {
  questionText: string
  modelAnswer: string
  guidelines: string
  marks: string
}

export interface QuestionFormValues {
  questionId: string
  courseId: string
  topicId: string
  type: QuestionType | ''
  difficulty: DifficultyLevel | ''
  trueFalse: TrueFalseFormContent
  mcq: McqFormContent
  subjective: SubjectiveFormContent
}

export interface QuestionFormErrors {
  questionId?: string
  courseId?: string
  topicId?: string
  type?: string
  difficulty?: string
  questionText?: string
  correctAnswer?: string
  options?: string
  optionTexts?: Record<string, string>
  marks?: string
}
