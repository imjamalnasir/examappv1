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
    toast.success(`Department "${created.name}" created successfully.`)
    navigate(`/departments/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Department"
        description="Create a new academic department."
        breadcrumbs={[
          { label: 'Departments', path: '/departments' },
          { label: 'Add' },
        ]}
      />
      <DepartmentForm
        initialValues={emptyValues}
        departments={departments}
        submitLabel="Create Department"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/departments')}
      />
    </div>
  )
}
