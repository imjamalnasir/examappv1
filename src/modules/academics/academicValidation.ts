import { isAfterDate, isIsoDate, isWithinInclusiveRange } from '@/modules/academics/academicDates'
import { isAcademicIdUnique } from '@/services/academicService'
import type {
  AcademicFormErrors,
  AcademicFormValues,
  AcademicSession,
  SemesterFormErrors,
} from '@/types/academic'
import type { Course } from '@/types/course'
import type { Subject } from '@/types/subject'

function setSemesterError(
  map: Record<string, SemesterFormErrors>,
  clientId: string,
  key: keyof SemesterFormErrors,
  message: string,
) {
  map[clientId] = { ...map[clientId], [key]: message }
}

export function semesterHasErrors(errors?: SemesterFormErrors): boolean {
  if (!errors) {
    return false
  }
  return Object.values(errors).some(Boolean)
}

export function hasAcademicFormErrors(errors: AcademicFormErrors): boolean {
  if (errors.name || errors.academicId || errors.courseId || errors.startDate || errors.endDate) {
    return true
  }
  if (!errors.semesters) {
    return false
  }
  return Object.values(errors.semesters).some((semesterErrors) => semesterHasErrors(semesterErrors))
}

export function validateAcademicForm(
  values: AcademicFormValues,
  academics: AcademicSession[],
  subjects: Subject[],
  courses: Course[],
  excludeId?: string,
): AcademicFormErrors {
  const errors: AcademicFormErrors = {}
  const semesterErrors: Record<string, SemesterFormErrors> = {}

  if (!values.name.trim()) {
    errors.name = 'Academic name is required.'
  }

  if (!values.academicId.trim()) {
    errors.academicId = 'Academic ID is required.'
  } else if (!/^[A-Za-z0-9-]{2,20}$/.test(values.academicId.trim())) {
    errors.academicId = 'Use 2–20 letters, numbers, or hyphens.'
  } else if (!isAcademicIdUnique(academics, values.academicId, excludeId)) {
    errors.academicId = 'Academic ID must be unique.'
  }

  if (!values.courseId) {
    errors.courseId = 'Course is required.'
  } else if (!courses.some((course) => course.id === values.courseId)) {
    errors.courseId = 'Selected course is invalid.'
  }

  const startValid = isIsoDate(values.startDate)
  const endValid = isIsoDate(values.endDate)

  if (!values.startDate) {
    errors.startDate = 'Start date is required.'
  } else if (!startValid) {
    errors.startDate = 'Enter a valid start date.'
  }

  if (!values.endDate) {
    errors.endDate = 'End date is required.'
  } else if (!endValid) {
    errors.endDate = 'Enter a valid end date.'
  } else if (startValid && !isAfterDate(values.endDate, values.startDate)) {
    errors.endDate = 'Academic end date must be after the start date.'
  }

  const academicRangeReady = startValid && endValid && isAfterDate(values.endDate, values.startDate)
  const normalizedNumbers = new Map<string, string[]>()

  values.semesters.forEach((semester) => {
    if (!semester.name.trim()) {
      setSemesterError(semesterErrors, semester.clientId, 'name', 'Semester name is required.')
    }

    const parsedNumber = Number(semester.number)
    if (!semester.number.trim()) {
      setSemesterError(semesterErrors, semester.clientId, 'number', 'Semester number is required.')
    } else if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      setSemesterError(
        semesterErrors,
        semester.clientId,
        'number',
        'Enter a whole semester number of 1 or greater.',
      )
    } else {
      const key = String(parsedNumber)
      const matches = normalizedNumbers.get(key) ?? []
      matches.push(semester.clientId)
      normalizedNumbers.set(key, matches)
    }

    const semesterStartValid = isIsoDate(semester.startDate)
    const semesterEndValid = isIsoDate(semester.endDate)

    if (!semester.startDate) {
      setSemesterError(semesterErrors, semester.clientId, 'startDate', 'Start date is required.')
    } else if (!semesterStartValid) {
      setSemesterError(semesterErrors, semester.clientId, 'startDate', 'Enter a valid start date.')
    } else if (
      academicRangeReady &&
      !isWithinInclusiveRange(semester.startDate, values.startDate, values.endDate)
    ) {
      setSemesterError(
        semesterErrors,
        semester.clientId,
        'startDate',
        'Semester dates must fall within the academic session.',
      )
    }

    if (!semester.endDate) {
      setSemesterError(semesterErrors, semester.clientId, 'endDate', 'End date is required.')
    } else if (!semesterEndValid) {
      setSemesterError(semesterErrors, semester.clientId, 'endDate', 'Enter a valid end date.')
    } else if (semesterStartValid && !isAfterDate(semester.endDate, semester.startDate)) {
      setSemesterError(
        semesterErrors,
        semester.clientId,
        'endDate',
        'Semester end date must be after the start date.',
      )
    } else if (
      academicRangeReady &&
      semesterStartValid &&
      !isWithinInclusiveRange(semester.endDate, values.startDate, values.endDate)
    ) {
      setSemesterError(
        semesterErrors,
        semester.clientId,
        'endDate',
        'Semester dates must fall within the academic session.',
      )
    }

    const seenSubjects = new Set<string>()
    for (const subjectId of semester.subjectIds) {
      if (seenSubjects.has(subjectId)) {
        setSemesterError(
          semesterErrors,
          semester.clientId,
          'subjects',
          'Duplicate subjects are not allowed in the same semester.',
        )
        break
      }
      seenSubjects.add(subjectId)
      const subject = subjects.find((item) => item.id === subjectId)
      if (!subject) {
        setSemesterError(
          semesterErrors,
          semester.clientId,
          'subjects',
          'One or more selected subjects are no longer available.',
        )
        break
      }
      if (values.courseId && subject.courseId !== values.courseId) {
        setSemesterError(
          semesterErrors,
          semester.clientId,
          'subjects',
          'Subjects must belong to the selected course.',
        )
        break
      }
    }
  })

  normalizedNumbers.forEach((clientIds) => {
    if (clientIds.length < 2) {
      return
    }
    clientIds.forEach((clientId) => {
      setSemesterError(
        semesterErrors,
        clientId,
        'number',
        'Semester number must be unique within this academic session.',
      )
    })
  })

  if (Object.keys(semesterErrors).length > 0) {
    errors.semesters = semesterErrors
  }

  return errors
}
