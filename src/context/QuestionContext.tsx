import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialQuestions } from '@/mock-data/questions'
import { getQuestionById, toQuestion } from '@/services/questionService'
import type { Question, QuestionFormValues } from '@/types/question'
import { todayDateString } from '@/utils/format'

interface QuestionContextValue {
  questions: Question[]
  getById: (id: string) => Question | undefined
  addQuestion: (values: QuestionFormValues, asDraft: boolean) => Question
  addQuestions: (items: Question[]) => void
  editQuestion: (id: string, values: QuestionFormValues, asDraft: boolean) => Question | null
  removeQuestion: (id: string) => boolean
}

const QuestionContext = createContext<QuestionContextValue | null>(null)

export function QuestionProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

  const getById = useCallback((id: string) => getQuestionById(questions, id), [questions])

  const addQuestion = useCallback((values: QuestionFormValues, asDraft: boolean) => {
    let created!: Question
    setQuestions((current) => {
      created = toQuestion(values, {
        status: asDraft ? 'Draft' : 'Published',
        createdDate: todayDateString(),
      })
      return [created, ...current]
    })
    return created
  }, [])

  const addQuestions = useCallback((items: Question[]) => {
    if (items.length === 0) {
      return
    }
    setQuestions((current) => [...items, ...current])
  }, [])

  const editQuestion = useCallback((id: string, values: QuestionFormValues, asDraft: boolean) => {
    let updated: Question | null = null
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== id) {
          return question
        }
        updated = toQuestion(values, {
          status: asDraft ? 'Draft' : 'Published',
          createdDate: question.createdDate,
        })
        return updated
      }),
    )
    return updated
  }, [])

  const removeQuestion = useCallback((id: string) => {
    let removed = false
    setQuestions((current) => {
      const next = current.filter((question) => question.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      questions,
      getById,
      addQuestion,
      addQuestions,
      editQuestion,
      removeQuestion,
    }),
    [questions, getById, addQuestion, addQuestions, editQuestion, removeQuestion],
  )

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>
}

export function useQuestions() {
  const context = useContext(QuestionContext)
  if (!context) {
    throw new Error('useQuestions must be used within QuestionProvider')
  }
  return context
}
