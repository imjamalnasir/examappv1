import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useSubjects } from '@/context/SubjectContext'
import { useToast } from '@/context/ToastContext'
import { AcademicForm } from '@/modules/academics/AcademicForm'
import { academicToFormValues } from '@/modules/academics/academicFormState'
import type { AcademicFormValues } from '@/types/academic'
import { AcademicNotFound } from '@/pages/academics/AcademicNotFound'

export function AcademicEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { academics, getById, editAcademic } = useAcademics()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const academic = getById(id)

  if (!academic) {
    return <AcademicNotFound />
  }

  const handleSubmit = (values: AcademicFormValues, asDraft: boolean) => {
    const updated = editAcademic(academic.id, values, asDraft)
    if (!updated) {
      toast.error('Unable to update academic session.')
      return
    }
    toast.success(
      asDraft
        ? `Academic session "${updated.name}" saved as draft.`
        : `Academic session "${updated.name}" updated successfully.`,
    )
    navigate(`/academics/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${academic.name}`}
        description="Update the session, its semesters, and the subjects allocated to each semester."
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: academic.name, path: `/academics/${academic.id}` },
          { label: 'Edit' },
        ]}
      />
      <AcademicForm
        key={academic.id}
        initialValues={academicToFormValues(academic)}
        academics={academics}
        courses={courses}
        subjects={subjects}
        excludeId={academic.id}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/academics/${academic.id}`)}
      />
    </div>
  )
}
