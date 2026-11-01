import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useDepartments } from '@/context/DepartmentContext'
import { useToast } from '@/context/ToastContext'
import { DepartmentForm } from '@/modules/departments/DepartmentForm'
import type { DepartmentFormValues } from '@/types/department'

export function DepartmentEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { departments, getById, editDepartment } = useDepartments()
  const department = getById(id)

  if (!department) {
    return (
      <div>
        <PageHeader
          title="Wing Not Found"
          breadcrumbs={[
            { label: 'Wings', path: '/wings' },
            { label: 'Edit' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p>The requested wing does not exist or was deleted.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/wings')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Wings
          </Button>
        </div>
      </div>
    )
  }

  const initialValues: DepartmentFormValues = {
    name: department.name,
    code: department.code,
    description: department.description,
    status: department.status,
  }

  const handleSubmit = (values: DepartmentFormValues) => {
    const updated = editDepartment(department.id, values)
    if (!updated) {
      toast.error('Unable to update wing.')
      return
    }
    toast.success(`Wing "${updated.name}" updated successfully.`)
    navigate(`/wings/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${department.name}`}
        description="Update wing information."
        breadcrumbs={[
          { label: 'Wings', path: '/wings' },
          { label: department.name, path: `/wings/${department.id}` },
          { label: 'Edit' },
        ]}
      />
      <DepartmentForm
        initialValues={initialValues}
        departments={departments}
        excludeId={department.id}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/wings/${department.id}`)}
      />
    </div>
  )
}
