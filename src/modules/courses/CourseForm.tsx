import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { validateCourseForm } from '@/modules/courses/courseValidation'
import type { Course, CourseFormErrors, CourseFormValues } from '@/types/course'
import type { Department } from '@/types/department'

interface CourseFormProps {
  initialValues: CourseFormValues
  courses: Course[]
  departments: Department[]
  excludeId?: string
  submitLabel: string
  onSubmit: (values: CourseFormValues) => void
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

export function CourseForm({
  initialValues,
  courses,
  departments,
  excludeId,
  submitLabel,
  onSubmit,
  onCancel,
}: CourseFormProps) {
  const [values, setValues] = useState<CourseFormValues>(initialValues)
  const [errors, setErrors] = useState<CourseFormErrors>({})

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        label: `${department.name} (${department.code})`,
        value: department.id,
      })),
    [departments],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateCourseForm(values, courses, excludeId)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit(values)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Course Name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          placeholder="e.g. Bachelor of Science in Computer Science"
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }))
            setErrors((current) => ({ ...current, name: undefined }))
          }}
        />
        <Input
          label="Course Code"
          name="code"
          required
          value={values.code}
          error={errors.code}
          placeholder="e.g. BSCS"
          hint="Must be unique across courses."
          onChange={(event) => {
            setValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))
            setErrors((current) => ({ ...current, code: undefined }))
          }}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Department"
          name="departmentId"
          required
          options={departmentOptions}
          value={values.departmentId}
          error={errors.departmentId}
          placeholder="Select a department"
          onChange={(event) => {
            setValues((current) => ({ ...current, departmentId: event.target.value }))
            setErrors((current) => ({ ...current, departmentId: undefined }))
          }}
        />
        <Input
          label="Duration"
          name="duration"
          value={values.duration}
          error={errors.duration}
          placeholder="e.g. 4 Years"
          onChange={(event) => {
            setValues((current) => ({ ...current, duration: event.target.value }))
            setErrors((current) => ({ ...current, duration: undefined }))
          }}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={values.description}
        error={errors.description}
        placeholder="Brief overview of the course"
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
              status: event.target.value as CourseFormValues['status'],
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
