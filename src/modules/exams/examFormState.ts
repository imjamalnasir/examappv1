import type { Exam, ExamFormValues } from '@/types/exam'

export const emptyExamForm: ExamFormValues = {
  name: '',
  academicId: '',
  courseId: '',
  semesterId: '',
  examType: '',
  examDate: '',
  teacherId: '',
  totalMarks: '',
  remarks: '',
  finalTotal: '',
  draftTotal: '',
  finalSubjective: '',
  draftSubjective: '',
  finalObjective: '',
  draftObjective: '',
}

export function examToFormValues(exam: Exam): ExamFormValues {
  return {
    name: exam.name,
    academicId: exam.academicId,
    courseId: exam.courseId,
    semesterId: exam.semesterId,
    examType: exam.examType,
    examDate: exam.examDate,
    teacherId: exam.teacherId,
    totalMarks: String(exam.totalMarks),
    remarks: exam.remarks,
    finalTotal: String(exam.questionConfig.finalTotal),
    draftTotal: String(exam.questionConfig.draftTotal),
    finalSubjective: String(exam.questionConfig.finalSubjective),
    draftSubjective: String(exam.questionConfig.draftSubjective),
    finalObjective: String(exam.questionConfig.finalObjective),
    draftObjective: String(exam.questionConfig.draftObjective),
  }
}
