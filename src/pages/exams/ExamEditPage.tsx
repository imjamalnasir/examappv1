import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useExams } from '@/context/ExamContext'
import { useToast } from '@/context/ToastContext'
import { initialTeachers } from '@/mock-data/teachers'
import { ExamForm } from '@/modules/exams/ExamForm'
import { ExamNotice } from '@/modules/exams/ExamNotice'
import { ExamRoleBar } from '@/modules/exams/ExamRoleBar'
import { examToFormValues } from '@/modules/exams/examFormState'
import { canEditExamInfo } from '@/modules/exams/examRules'
import { ExamNotFound } from '@/pages/exams/ExamNotFound'
import type { ExamFormValues } from '@/types/exam'

export function ExamEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { role, getById, updateExam } = useExams()
  const { academics } = useAcademics()
  const { courses } = useCourses()
  const { departments } = useDepartments()
  const exam = getById(id)
  const [initialValues] = useState<ExamFormValues | null>(() => (exam ? examToFormValues(exam) : null))

  if (!exam || !initialValues) {
    return <ExamNotFound />
  }

  const editable = canEditExamInfo(exam, role)

  const handleSubmit = (values: ExamFormValues, asDraft: boolean) => {
    const updated = updateExam(exam.id, values, asDraft)
    if (!updated) {
      toast.error('This exam cannot be edited in its current status.')
      return
    }
    toast.success(asDraft ? `Exam "${updated.name}" saved as draft.` : `Exam "${updated.name}" updated.`)
    navigate(!asDraft && exam.isDraft ? `/exams/${updated.id}/questions` : `/exams/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Edit Exam"
        description="Update examination details while the paper is still open for changes."
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: exam.name, path: `/exams/${exam.id}` },
          { label: 'Edit' },
        ]}
      />
      <ExamRoleBar />
      {editable ? (
        <ExamForm
          initialValues={initialValues}
          academics={academics}
          courses={courses}
          teachers={initialTeachers}
          departments={departments}
          submitLabel={exam.isDraft ? 'Save & Continue' : 'Save Changes'}
          allowDraft={exam.isDraft}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/exams/${exam.id}`)}
        />
      ) : (
        <ExamNotice
          tone="warning"
          title="This exam is locked for editing"
          description={
            exam.status === 'Approved'
              ? 'Approved papers stay locked until an administrator starts a revision.'
              : exam.status === 'Forwarded to Approval'
                ? 'Editing is paused while the paper is with the approval authority.'
                : 'Exam details can be edited while the status is Initiated, Rejected, or Returned. Question changes belong to the question step.'
          }
          action={
            <Button variant="secondary" onClick={() => navigate(`/exams/${exam.id}`)}>
              Back to exam
            </Button>
          }
        />
      )}
    </div>
  )
}
