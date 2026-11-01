import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialStudents } from '@/mock-data/students'
import {
  createStudent,
  getStudentById,
  updateStudent,
  withdrawStudent as withdrawStudentRecord,
} from '@/services/studentService'
import type { Student, StudentFormValues } from '@/types/student'

interface StudentContextValue {
  students: Student[]
  getById: (id: string) => Student | undefined
  addStudent: (values: StudentFormValues) => Student
  editStudent: (id: string, values: StudentFormValues) => Student | null
  withdrawStudent: (id: string) => Student | null
  removeStudent: (id: string) => boolean
}

const StudentContext = createContext<StudentContextValue | null>(null)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents)

  const getById = useCallback((id: string) => getStudentById(students, id), [students])

  const addStudent = useCallback((values: StudentFormValues) => {
    let created!: Student
    setStudents((current) => {
      created = createStudent(current, values)
      return [created, ...current]
    })
    return created
  }, [])

  const editStudent = useCallback((id: string, values: StudentFormValues) => {
    let updated: Student | null = null
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== id) {
          return student
        }
        updated = updateStudent(student, values)
        return updated
      }),
    )
    return updated
  }, [])

  const withdrawStudent = useCallback((id: string) => {
    let updated: Student | null = null
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== id) {
          return student
        }
        updated = withdrawStudentRecord(student)
        return updated
      }),
    )
    return updated
  }, [])

  const removeStudent = useCallback((id: string) => {
    let removed = false
    setStudents((current) => {
      const next = current.filter((student) => student.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      students,
      getById,
      addStudent,
      editStudent,
      withdrawStudent,
      removeStudent,
    }),
    [students, getById, addStudent, editStudent, withdrawStudent, removeStudent],
  )

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}

export function useStudents() {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error('useStudents must be used within StudentProvider')
  }
  return context
}
