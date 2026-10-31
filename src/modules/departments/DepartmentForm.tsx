import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { validateDepartmentForm } from '@/modules/departments/departmentValidation'
import type { Department, DepartmentFormErrors, DepartmentFormValues } from '@/types/department'

interface DepartmentFormProps {
  initialValues: DepartmentFormValues
  departments: Department[]
  excludeId?: string
  submitLabel: string
  onSubmit: (values: DepartmentFormValues) => void
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

export function DepartmentForm({
  initialValues,
  departments,
  excludeId,
  submitLabel,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const [values, setValues] = useState<DepartmentFormValues>(initialValues)
  const [errors, setErrors] = useState<DepartmentFormErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateDepartmentForm(values, departments, excludeId)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Department Name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          placeholder="e.g. Computer Science"
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }))
            setErrors((current) => ({ ...current, name: undefined }))
          }}
        />
        <Input
          label="Department Code"
          name="code"
          required
          value={values.code}
          error={errors.code}
          placeholder="e.g. CS"
          hint="Must be unique across departments."
          onChange={(event) => {
            setValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))
            setErrors((current) => ({ ...current, code: undefined }))
          }}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={values.description}
        error={errors.description}
        placeholder="Brief overview of the department"
        onChange={(event) => {
          setValues((current) => ({ ...current, description: event.target.value }))
          setErrors((current) => ({ ...current, description: undefined }))
        }}
      />

      <div className="max-w-xs">
        <Select
          label="Status"
          name="status"
          required
          options={statusOptions}
          value={values.status}
          error={errors.status}
          onChange={(event) => {
            setValues((current) => ({
              ...current,
              status: event.target.value as DepartmentFormValues['status'],
            }))
            setErrors((current) => ({ ...current, status: undefined }))
          }}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
