import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAcademics } from '@/context/AcademicContext'
import { useQuestions } from '@/context/QuestionContext'
import { useTopics } from '@/context/TopicContext'
import { initialExams } from '@/mock-data/exams'
import { initialTeachers } from '@/mock-data/teachers'
import { EXAM_ACTORS } from '@/modules/exams/examLabels'
import {
  canDecideExam,
  canEditExamInfo,
  canEditExamQuestions,
  canForwardExam,
  canReviseExam,
  checkSelection,
  deleteAccess,
} from '@/modules/exams/examRules'
import { hasExamFormErrors, validateExamForm } from '@/modules/exams/examValidation'
import {
  applyApproval,
  applyExamUpdate,
  applyForward,
  applyQuestionSave,
  applyRejection,
  applyReturn,
  applyRevision,
  createExamRecord,
  getExamById,
  suggestExamId,
} from '@/services/examService'
import type { Exam, ExamFormValues, ExamQuestionSelection, ExamRole } from '@/types/exam'
import { useCourses } from '@/context/CourseContext'
import { nowDateTimeString } from '@/utils/format'

interface ExamMutationResult {
  exam: Exam | null
  messages: string[]
}

interface ExamDeleteResult {
  ok: boolean
  message: string
}

interface ExamContextValue {
  exams: Exam[]
  role: ExamRole
  setRole: (role: ExamRole) => void
  actorName: string
  actorTitle: string
  getById: (id: string) => Exam | undefined
  addExam: (values: ExamFormValues, asDraft: boolean) => Exam | null
  updateExam: (id: string, values: ExamFormValues, asDraft: boolean) => Exam | null
  saveQuestions: (id: string, selected: ExamQuestionSelection[]) => ExamMutationResult
  forwardExam: (id: string, remarks: string) => ExamMutationResult
  approveExam: (id: string, remarks: string) => ExamMutationResult
  rejectExam: (id: string, reason: string) => ExamMutationResult
  returnExam: (id: string, remarks: string) => ExamMutationResult
  startRevision: (id: string, remarks: string) => ExamMutationResult
  removeExam: (id: string, authorized: boolean) => ExamDeleteResult
}

const ExamContext = createContext<ExamContextValue | null>(null)

export function ExamProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [role, setRole] = useState<ExamRole>('Administrator')
  const { academics } = useAcademics()
  const { courses } = useCourses()
  const { questions } = useQuestions()
  const { topics } = useTopics()

  const actor = useMemo(
    () => ({ name: EXAM_ACTORS[role].name, title: EXAM_ACTORS[role].title, role }),
    [role],
  )

  const getById = useCallback((id: string) => getExamById(exams, id), [exams])

  const addExam = useCallback(
    (values: ExamFormValues, asDraft: boolean) => {
      if (role !== 'Administrator') {
        return null
      }
      const errors = validateExamForm(values, academics, courses, initialTeachers)
      if (hasExamFormErrors(errors)) {
        return null
      }
      let created!: Exam
      const occurredAt = nowDateTimeString()
      setExams((current) => {
        created = createExamRecord(values, suggestExamId(current), asDraft, actor, occurredAt)
        return [created, ...current]
      })
      return created
    },
    [academics, actor, courses, role],
  )

  const updateExam = useCallback(
    (id: string, values: ExamFormValues, asDraft: boolean) => {
      const errors = validateExamForm(values, academics, courses, initialTeachers)
      if (hasExamFormErrors(errors)) {
        return null
      }
      let updated: Exam | null = null
      const occurredAt = nowDateTimeString()
      setExams((current) =>
        current.map((exam) => {
          if (exam.id !== id || !canEditExamInfo(exam, role)) {
            return exam
          }
          updated = applyExamUpdate(exam, values, asDraft, actor, occurredAt)
          return updated
        }),
      )
      return updated
    },
    [academics, actor, courses, role],
  )

  const saveQuestions = useCallback(
    (id: string, selected: ExamQuestionSelection[]) => {
      const exam = getExamById(exams, id)
      if (!exam) {
        return { exam: null, messages: ['This exam no longer exists.'] }
      }
      if (!canEditExamQuestions(exam, role)) {
        return { exam: null, messages: ['Questions cannot be changed in the current status for this role.'] }
      }
      const academic = academics.find((item) => item.id === exam.academicId)
      const check = checkSelection(exam, selected, academic, questions, topics)
      if (check.blockers.length > 0) {
        return { exam: null, messages: check.blockers }
      }
      let updated: Exam | null = null
      const occurredAt = nowDateTimeString()
      setExams((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item
          }
          updated = applyQuestionSave(item, selected, actor, occurredAt)
          return updated
        }),
      )
      return { exam: updated, messages: [] }
    },
    [academics, actor, exams, questions, role, topics],
  )

  const forwardExam = useCallback(
    (id: string, remarks: string) => {
      const exam = getExamById(exams, id)
      if (!exam) {
        return { exam: null, messages: ['This exam no longer exists.'] }
      }
      if (!canForwardExam(exam, role)) {
        return { exam: null, messages: ['This exam cannot be forwarded for your role or its current status.'] }
      }
      const academic = academics.find((item) => item.id === exam.academicId)
      const check = checkSelection(exam, exam.selectedQuestions, academic, questions, topics)
      const messages = [...check.blockers, ...check.gaps]
      if (messages.length > 0) {
        return { exam: null, messages }
      }
      let updated: Exam | null = null
      const occurredAt = nowDateTimeString()
      setExams((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item
          }
          updated = applyForward(item, remarks, actor, occurredAt)
          return updated
        }),
      )
      return { exam: updated, messages: [] }
    },
    [academics, actor, exams, questions, role, topics],
  )

  const decide = useCallback(
    (
      id: string,
      remarks: string,
      apply: (exam: Exam, remarks: string, occurredAt: string) => Exam,
      options: { requireRemarks: boolean; requireValidPaper: boolean },
    ): ExamMutationResult => {
      const exam = getExamById(exams, id)
      if (!exam) {
        return { exam: null, messages: ['This exam no longer exists.'] }
      }
      if (!canDecideExam(exam, role)) {
        return { exam: null, messages: ['Only the approval authority can decide a paper that is waiting for approval.'] }
      }
      if (options.requireRemarks && remarks.trim().length === 0) {
        return { exam: null, messages: ['Enter a reason before continuing.'] }
      }
      if (options.requireValidPaper) {
        const academic = academics.find((item) => item.id === exam.academicId)
        const check = checkSelection(exam, exam.selectedQuestions, academic, questions, topics)
        const messages = [...check.blockers, ...check.gaps]
        if (messages.length > 0) {
          return { exam: null, messages }
        }
      }
      let updated: Exam | null = null
      const occurredAt = nowDateTimeString()
      setExams((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item
          }
          updated = apply(item, remarks, occurredAt)
          return updated
        }),
      )
      return { exam: updated, messages: [] }
    },
    [academics, exams, questions, role, topics],
  )

  const approveExam = useCallback(
    (id: string, remarks: string) =>
      decide(id, remarks, (exam, note, occurredAt) => applyApproval(exam, note, actor, occurredAt), {
        requireRemarks: false,
        requireValidPaper: true,
      }),
    [actor, decide],
  )

  const rejectExam = useCallback(
    (id: string, reason: string) =>
      decide(id, reason, (exam, note, occurredAt) => applyRejection(exam, note, actor, occurredAt), {
        requireRemarks: true,
        requireValidPaper: false,
      }),
    [actor, decide],
  )

  const returnExam = useCallback(
    (id: string, remarks: string) =>
      decide(id, remarks, (exam, note, occurredAt) => applyReturn(exam, note, actor, occurredAt), {
        requireRemarks: true,
        requireValidPaper: false,
      }),
    [actor, decide],
  )

  const startRevision = useCallback(
    (id: string, remarks: string) => {
      const exam = getExamById(exams, id)
      if (!exam) {
        return { exam: null, messages: ['This exam no longer exists.'] }
      }
      if (!canReviseExam(exam, role)) {
        return { exam: null, messages: ['Only an administrator can revise an approved exam.'] }
      }
      if (remarks.trim().length === 0) {
        return { exam: null, messages: ['Enter a reason for opening the revision.'] }
      }
      let updated: Exam | null = null
      const occurredAt = nowDateTimeString()
      setExams((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item
          }
          updated = applyRevision(item, remarks, actor, occurredAt)
          return updated
        }),
      )
      return { exam: updated, messages: [] }
    },
    [actor, exams, role],
  )

  const removeExam = useCallback(
    (id: string, authorized: boolean) => {
      const exam = getExamById(exams, id)
      if (!exam) {
        return { ok: false, message: 'This exam no longer exists.' }
      }
      const access = deleteAccess(exam, role)
      if (access === 'no') {
        return { ok: false, message: 'Only an administrator can delete an exam.' }
      }
      if (access === 'authorized' && !authorized) {
        return {
          ok: false,
          message: 'Approved exams stay locked unless an administrator confirms authorization.',
        }
      }
      setExams((current) => current.filter((item) => item.id !== id))
      return { ok: true, message: 'Exam deleted. Question bank records were kept.' }
    },
    [exams, role],
  )

  const value = useMemo(
    () => ({
      exams,
      role,
      setRole,
      actorName: actor.name,
      actorTitle: actor.title,
      getById,
      addExam,
      updateExam,
      saveQuestions,
      forwardExam,
      approveExam,
      rejectExam,
      returnExam,
      startRevision,
      removeExam,
    }),
    [
      exams,
      role,
      actor.name,
      actor.title,
      getById,
      addExam,
      updateExam,
      saveQuestions,
      forwardExam,
      approveExam,
      rejectExam,
      returnExam,
      startRevision,
      removeExam,
    ],
  )

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>
}

export function useExams() {
  const context = useContext(ExamContext)
  if (!context) {
    throw new Error('useExams must be used within ExamProvider')
  }
  return context
}
