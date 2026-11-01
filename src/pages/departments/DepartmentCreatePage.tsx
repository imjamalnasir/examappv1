import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useDepartments } from '@/context/DepartmentContext'
import { useToast } from '@/context/ToastContext'
import { DepartmentForm } from '@/modules/departments/DepartmentForm'
import type { DepartmentFormValues } from '@/types/department'

const emptyValues: DepartmentFormValues = {
  name: '',
  code: '',
  description: '',
  status: 'Active',
}

export function DepartmentCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { departments, addDepartment } = useDepartments()

  const handleSubmit = (values: DepartmentFormValues) => {
    const created = addDepartment(values)
    toast.success(`Wing "${created.name}" created successfully.`)
    navigate(`/wings/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Wing"
        description="Create a new academic wing."
        breadcrumbs={[
          { label: 'Wings', path: '/wings' },
          { label: 'Add' },
        ]}
      />
      <DepartmentForm
        initialValues={emptyValues}
        departments={departments}
        submitLabel="Create Wing"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/wings')}
      />
    </div>
  )
}
