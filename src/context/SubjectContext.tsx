import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialSubjects } from '@/mock-data/subjects'
import { createSubject, getSubjectById, updateSubject } from '@/services/subjectService'
import type { Subject, SubjectFormValues } from '@/types/subject'

interface SubjectContextValue {
  subjects: Subject[]
  getById: (id: string) => Subject | undefined
  addSubject: (values: SubjectFormValues) => Subject
  editSubject: (id: string, values: SubjectFormValues) => Subject | null
  removeSubject: (id: string) => boolean
}

const SubjectContext = createContext<SubjectContextValue | null>(null)

export function SubjectProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)

  const getById = useCallback((id: string) => getSubjectById(subjects, id), [subjects])

  const addSubject = useCallback((values: SubjectFormValues) => {
    let created!: Subject
    setSubjects((current) => {
      created = createSubject(current, values)
      return [created, ...current]
    })
    return created
  }, [])

  const editSubject = useCallback((id: string, values: SubjectFormValues) => {
    let updated: Subject | null = null
    setSubjects((current) =>
      current.map((subject) => {
        if (subject.id !== id) {
          return subject
        }
        updated = updateSubject(subject, values)
        return updated
      }),
    )
    return updated
  }, [])

  const removeSubject = useCallback((id: string) => {
    let removed = false
    setSubjects((current) => {
      const next = current.filter((subject) => subject.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      subjects,
      getById,
      addSubject,
      editSubject,
      removeSubject,
    }),
    [subjects, getById, addSubject, editSubject, removeSubject],
  )

  return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>
}

export function useSubjects() {
  const context = useContext(SubjectContext)
  if (!context) {
    throw new Error('useSubjects must be used within SubjectProvider')
  }
  return context
}
