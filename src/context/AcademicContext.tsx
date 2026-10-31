import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialAcademics } from '@/mock-data/academics'
import { getAcademicById, toAcademicSession } from '@/services/academicService'
import type { AcademicFormValues, AcademicSession } from '@/types/academic'
import { todayDateString } from '@/utils/format'

interface AcademicContextValue {
  academics: AcademicSession[]
  getById: (id: string) => AcademicSession | undefined
  addAcademic: (values: AcademicFormValues, isDraft: boolean) => AcademicSession
  editAcademic: (id: string, values: AcademicFormValues, isDraft: boolean) => AcademicSession | null
  removeAcademic: (id: string) => boolean
}

const AcademicContext = createContext<AcademicContextValue | null>(null)

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [academics, setAcademics] = useState<AcademicSession[]>(initialAcademics)

  const getById = useCallback((id: string) => getAcademicById(academics, id), [academics])

  const addAcademic = useCallback((values: AcademicFormValues, isDraft: boolean) => {
    let created!: AcademicSession
    setAcademics((current) => {
      created = toAcademicSession(values, { isDraft, createdDate: todayDateString() })
      return [created, ...current]
    })
    return created
  }, [])

  const editAcademic = useCallback((id: string, values: AcademicFormValues, isDraft: boolean) => {
    let updated: AcademicSession | null = null
    setAcademics((current) =>
      current.map((academic) => {
        if (academic.id !== id) {
          return academic
        }
        updated = toAcademicSession(values, { isDraft, createdDate: academic.createdDate })
        return updated
      }),
    )
    return updated
  }, [])

  const removeAcademic = useCallback((id: string) => {
    let removed = false
    setAcademics((current) => {
      const next = current.filter((academic) => academic.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      academics,
      getById,
      addAcademic,
      editAcademic,
      removeAcademic,
    }),
    [academics, getById, addAcademic, editAcademic, removeAcademic],
  )

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>
}

export function useAcademics() {
  const context = useContext(AcademicContext)
  if (!context) {
    throw new Error('useAcademics must be used within AcademicProvider')
  }
  return context
}
