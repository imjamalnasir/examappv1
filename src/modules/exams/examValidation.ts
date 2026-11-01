import type { AcademicSession } from '@/types/academic'
import { EXAM_TYPES, type ExamFormErrors, type ExamFormValues, type QuestionConfiguration } from '@/types/exam'
import type { Course } from '@/types/course'
import type { Teacher } from '@/types/teacher'

function parseCount(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) {
    return null
  }
  return Number(trimmed)
}

function validateCount(value: string, label: string): string | undefined {
  const parsed = parseCount(value)
  if (parsed === null) {
    return `Enter a whole number for ${label}.`
  }
  if (parsed > 200) {
    return `${label} must be 200 or fewer.`
  }
  return undefined
}

export function configurationFromValues(values: ExamFormValues): QuestionConfiguration {
  return {
    finalTotal: Number(values.finalTotal),
    draftTotal: Number(values.draftTotal),
    finalSubjective: Number(values.finalSubjective),
    draftSubjective: Number(values.draftSubjective),
    finalObjective: Number(values.finalObjective),
    draftObjective: Number(values.draftObjective),
  }
}

export function hasExamFormErrors(errors: ExamFormErrors): boolean {
  return Object.values(errors).some((value) => Boolean(value))
}

export function validateExamForm(
  values: ExamFormValues,
  academics: AcademicSession[],
  courses: Course[],
  teachers: Teacher[],
): ExamFormErrors {
  const errors: ExamFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Enter an exam name.'
  } else if (name.length > 140) {
    errors.name = 'Exam name must be 140 characters or fewer.'
  }

  const academic = academics.find((item) => item.id === values.academicId)
  if (!values.academicId) {
    errors.academicId = 'Select an academic session.'
  } else if (!academic) {
    errors.academicId = 'Select a valid academic session.'
  }

  if (!values.courseId) {
    errors.courseId = 'Select a course.'
  } else if (!courses.some((course) => course.id === values.courseId)) {
    errors.courseId = 'Select a valid course.'
  } else if (academic && values.courseId !== academic.courseId) {
    errors.courseId = 'Select the course linked to this academic session.'
  }

  if (!values.semesterId) {
    errors.semesterId = 'Select a semester.'
  } else if (academic && !academic.semesters.some((semester) => semester.id === values.semesterId)) {
    errors.semesterId = 'Select a semester from this academic session.'
  }

  if (!values.examType) {
    errors.examType = 'Select an exam type.'
  } else if (!EXAM_TYPES.some((type) => type === values.examType)) {
    errors.examType = 'Select a valid exam type.'
  }

  if (!values.examDate) {
    errors.examDate = 'Select an exam date.'
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.examDate) || Number.isNaN(new Date(`${values.examDate}T00:00:00`).getTime())) {
    errors.examDate = 'Enter a valid exam date.'
  }

  if (!values.teacherId) {
    errors.teacherId = 'Select a teacher.'
  } else if (!teachers.some((teacher) => teacher.id === values.teacherId)) {
    errors.teacherId = 'Select a valid teacher.'
  }

  const marks = values.totalMarks.trim()
  if (!/^\d+$/.test(marks) || Number(marks) < 1) {
    errors.totalMarks = 'Enter total marks as a whole number greater than zero.'
  } else if (Number(marks) > 500) {
    errors.totalMarks = 'Total marks must be 500 or fewer.'
  }

  if (values.remarks.trim().length > 1000) {
    errors.remarks = 'Remarks must be 1000 characters or fewer.'
  }

  errors.finalTotal = validateCount(values.finalTotal, 'final questions')
  errors.draftTotal = validateCount(values.draftTotal, 'draft questions')
  errors.finalSubjective = validateCount(values.finalSubjective, 'final subjective questions')
  errors.draftSubjective = validateCount(values.draftSubjective, 'draft subjective questions')
  errors.finalObjective = validateCount(values.finalObjective, 'final objective questions')
  errors.draftObjective = validateCount(values.draftObjective, 'draft objective questions')

  const finalTotal = parseCount(values.finalTotal)
  const finalSubjective = parseCount(values.finalSubjective)
  const finalObjective = parseCount(values.finalObjective)
  const draftTotal = parseCount(values.draftTotal)
  const draftSubjective = parseCount(values.draftSubjective)
  const draftObjective = parseCount(values.draftObjective)

  if (finalTotal !== null && finalSubjective !== null && finalObjective !== null) {
    const sum = finalSubjective + finalObjective
    if (sum > finalTotal) {
      errors.finalSubjective = 'Subjective and objective counts cannot exceed the final total.'
      errors.finalObjective = 'Subjective and objective counts cannot exceed the final total.'
      errors.questionConfig = 'Final subjective and objective questions exceed the final total.'
    } else if (sum !== finalTotal) {
      errors.finalSubjective = 'Subjective and objective counts must add up to the final total.'
      errors.finalObjective = 'Subjective and objective counts must add up to the final total.'
      errors.questionConfig = 'Final subjective and objective questions must add up to the final total.'
    }
  }

  if (draftTotal !== null && draftSubjective !== null && draftObjective !== null) {
    const sum = draftSubjective + draftObjective
    if (sum > draftTotal) {
      errors.draftSubjective = 'Subjective and objective counts cannot exceed the draft total.'
      errors.draftObjective = 'Subjective and objective counts cannot exceed the draft total.'
      errors.questionConfig = errors.questionConfig
        ? `${errors.questionConfig} Draft subjective and objective questions exceed the draft total.`
        : 'Draft subjective and objective questions exceed the draft total.'
    } else if (sum !== draftTotal) {
      errors.draftSubjective = 'Subjective and objective counts must add up to the draft total.'
      errors.draftObjective = 'Subjective and objective counts must add up to the draft total.'
      errors.questionConfig = errors.questionConfig
        ? `${errors.questionConfig} Draft subjective and objective questions must add up to the draft total.`
        : 'Draft subjective and objective questions must add up to the draft total.'
    }
  }

  return errors
}
