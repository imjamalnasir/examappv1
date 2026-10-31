import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialQuestionImports } from '@/mock-data/questionImports'
import type { NewQuestionImportRecord, QuestionImportRecord } from '@/types/questionImport'
import { createSequentialId } from '@/utils/id'

interface QuestionImportContextValue {
  history: QuestionImportRecord[]
  getImport: (id: string) => QuestionImportRecord | undefined
  recordImport: (record: NewQuestionImportRecord) => QuestionImportRecord
}

const QuestionImportContext = createContext<QuestionImportContextValue | null>(null)

export function QuestionImportProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<QuestionImportRecord[]>(initialQuestionImports)

  const getImport = useCallback(
    (id: string) => history.find((record) => record.id.toUpperCase() === id.toUpperCase()),
    [history],
  )

  const recordImport = useCallback((record: NewQuestionImportRecord) => {
    let created!: QuestionImportRecord
    setHistory((current) => {
      created = {
        ...record,
        id: createSequentialId(
          'IMP',
          current.map((item) => item.id),
        ),
      }
      return [created, ...current]
    })
    return created
  }, [])

  const value = useMemo(
    () => ({
      history,
      getImport,
      recordImport,
    }),
    [history, getImport, recordImport],
  )

  return <QuestionImportContext.Provider value={value}>{children}</QuestionImportContext.Provider>
}

export function useQuestionImports() {
  const context = useContext(QuestionImportContext)
  if (!context) {
    throw new Error('useQuestionImports must be used within QuestionImportProvider')
  }
  return context
}
