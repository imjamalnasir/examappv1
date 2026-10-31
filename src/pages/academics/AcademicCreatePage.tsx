import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { AcademicForm } from '@/modules/academics/AcademicForm'
import { emptyAcademicForm } from '@/modules/academics/academicFormState'
import { suggestAcademicId } from '@/services/academicService'
import type { AcademicFormValues } from '@/types/academic'

export function AcademicCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { academics, addAcademic } = useAcademics()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const [initialValues] = useState<AcademicFormValues>(() => ({
    ...emptyAcademicForm,
    academicId: suggestAcademicId(academics),
  }))

  const handleSubmit = (values: AcademicFormValues, asDraft: boolean) => {
    const created = addAcademic(values, asDraft)
    toast.success(
      asDraft
        ? `Academic session "${created.name}" saved as draft.`
        : `Academic session "${created.name}" created successfully.`,
    )
    navigate(`/academics/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Academic"
        description="Create an academic session, then add its semesters and subject allocations."
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: 'Add' },
        ]}
      />
      <AcademicForm
        initialValues={initialValues}
        academics={academics}
        courses={courses}
        subjects={subjects}
        submitLabel="Create Academic"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/academics')}
      />
    </div>
  )
}
