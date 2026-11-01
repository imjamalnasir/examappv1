import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useExams } from '@/context/ExamContext'
import { useToast } from '@/context/ToastContext'
import { initialTeachers } from '@/mock-data/teachers'
import { ExamForm } from '@/modules/exams/ExamForm'
import { ExamNotice } from '@/modules/exams/ExamNotice'
import { ExamRoleBar } from '@/modules/exams/ExamRoleBar'
import { emptyExamForm } from '@/modules/exams/examFormState'
import { canCreateExam } from '@/modules/exams/examRules'
import type { ExamFormValues } from '@/types/exam'

export function ExamCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { role, addExam } = useExams()
  const { academics } = useAcademics()
  const { courses } = useCourses()
  const { departments } = useDepartments()
  const [initialValues] = useState<ExamFormValues>(emptyExamForm)

  const handleSubmit = (values: ExamFormValues, asDraft: boolean) => {
    const created = addExam(values, asDraft)
    if (!created) {
      toast.error('Unable to create the exam. Check the form and your role.')
      return
    }
    toast.success(
      asDraft ? `Exam "${created.name}" saved as draft.` : `Exam "${created.name}" created.`,
    )
    navigate(asDraft ? `/exams/${created.id}` : `/exams/${created.id}/questions`)
  }

  return (
    <div>
      <PageHeader
        title="Add Exam"
        description="Create an examination, set its question blueprint, and continue into question selection."
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: 'Add' },
        ]}
      />
      <ExamRoleBar />
      {canCreateExam(role) ? (
        <ExamForm
          initialValues={initialValues}
          academics={academics}
          courses={courses}
          teachers={initialTeachers}
          departments={departments}
          submitLabel="Save & Continue"
          allowDraft
          onSubmit={handleSubmit}
          onCancel={() => navigate('/exams')}
        />
      ) : (
        <ExamNotice
          tone="warning"
          title="Only an administrator can create an exam"
          description="Switch the role to Administrator to add a paper. Teachers select questions, and the approval authority reviews submissions."
        />
      )}
    </div>
  )
}
