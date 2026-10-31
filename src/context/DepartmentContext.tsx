import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialDepartments } from '@/mock-data/departments'
import {
  createDepartment,
  getDepartmentById,
  updateDepartment,
} from '@/services/departmentService'
import type { Department, DepartmentFormValues } from '@/types/department'

interface DepartmentContextValue {
  departments: Department[]
  getById: (id: string) => Department | undefined
  addDepartment: (values: DepartmentFormValues) => Department
  editDepartment: (id: string, values: DepartmentFormValues) => Department | null
  removeDepartment: (id: string) => boolean
}

const DepartmentContext = createContext<DepartmentContextValue | null>(null)

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)

  const getById = useCallback(
    (id: string) => getDepartmentById(departments, id),
    [departments],
  )

  const addDepartment = useCallback((values: DepartmentFormValues) => {
    let created!: Department
    setDepartments((current) => {
      created = createDepartment(current, values)
      return [created, ...current]
    })
    return created
  }, [])

  const editDepartment = useCallback((id: string, values: DepartmentFormValues) => {
    let updated: Department | null = null
    setDepartments((current) =>
      current.map((department) => {
        if (department.id !== id) {
          return department
        }
        updated = updateDepartment(department, values)
        return updated
      }),
    )
    return updated
  }, [])

  const removeDepartment = useCallback((id: string) => {
    let removed = false
    setDepartments((current) => {
      const next = current.filter((department) => department.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      departments,
      getById,
      addDepartment,
      editDepartment,
      removeDepartment,
    }),
    [departments, getById, addDepartment, editDepartment, removeDepartment],
  )

  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>
}

export function useDepartments() {
  const context = useContext(DepartmentContext)
  if (!context) {
    throw new Error('useDepartments must be used within DepartmentProvider')
  }
  return context
}
