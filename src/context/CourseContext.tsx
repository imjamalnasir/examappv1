import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialCourses } from '@/mock-data/courses'
import { createCourse, getCourseById, updateCourse } from '@/services/courseService'
import type { Course, CourseFormValues } from '@/types/course'

interface CourseContextValue {
  courses: Course[]
  getById: (id: string) => Course | undefined
  addCourse: (values: CourseFormValues) => Course
  editCourse: (id: string, values: CourseFormValues) => Course | null
  removeCourse: (id: string) => boolean
}

const CourseContext = createContext<CourseContextValue | null>(null)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)

  const getById = useCallback((id: string) => getCourseById(courses, id), [courses])

  const addCourse = useCallback((values: CourseFormValues) => {
    let created!: Course
    setCourses((current) => {
      created = createCourse(current, values)
      return [created, ...current]
    })
    return created
  }, [])

  const editCourse = useCallback((id: string, values: CourseFormValues) => {
    let updated: Course | null = null
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== id) {
          return course
        }
        updated = updateCourse(course, values)
        return updated
      }),
    )
    return updated
  }, [])

  const removeCourse = useCallback((id: string) => {
    let removed = false
    setCourses((current) => {
      const next = current.filter((course) => course.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      courses,
      getById,
      addCourse,
      editCourse,
      removeCourse,
    }),
    [courses, getById, addCourse, editCourse, removeCourse],
  )

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
}

export function useCourses() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourses must be used within CourseProvider')
  }
  return context
}
