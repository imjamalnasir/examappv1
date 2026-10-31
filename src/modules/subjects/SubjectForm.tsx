import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { validateSubjectForm } from '@/modules/subjects/subjectValidation'
import type { Course } from '@/types/course'
import type { Department } from '@/types/department'
import type { Subject, SubjectFormErrors, SubjectFormValues } from '@/types/subject'
import { getCoursesByDepartment } from '@/utils/relationships'

interface SubjectFormProps {
  initialValues: SubjectFormValues
  subjects: Subject[]
  departments: Department[]
  courses: Course[]
  excludeId?: string
  submitLabel: string
  onSubmit: (values: SubjectFormValues) => void
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

export function SubjectForm({
  initialValues,
  subjects,
  departments,
  courses,
  excludeId,
  submitLabel,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  const [values, setValues] = useState<SubjectFormValues>(initialValues)
  const [errors, setErrors] = useState<SubjectFormErrors>({})

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        label: `${department.name} (${department.code})`,
        value: department.id,
      })),
    [departments],
  )

  const courseOptions = useMemo(
    () =>
      (values.departmentId
        ? getCoursesByDepartment(courses, values.departmentId)
        : []
      ).map((course) => ({
        label: `${course.name} (${course.code})`,
        value: course.id,
      })),
    [courses, values.departmentId],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateSubjectForm(values, subjects, courses, excludeId)

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
          label="Subject Name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          placeholder="e.g. Introduction to Programming"
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }))
            setErrors((current) => ({ ...current, name: undefined }))
          }}
        />
        <Input
          label="Subject Code"
          name="code"
          required
          value={values.code}
          error={errors.code}
          placeholder="e.g. CS101"
          hint="Must be unique across subjects."
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
            const departmentId = event.target.value
            setValues((current) => {
              const selectedCourse = courses.find((course) => course.id === current.courseId)
              const courseStillValid = selectedCourse?.departmentId === departmentId
              return {
                ...current,
                departmentId,
                courseId: courseStillValid ? current.courseId : '',
              }
            })
            setErrors((current) => ({
              ...current,
              departmentId: undefined,
              courseId: undefined,
            }))
          }}
        />
        <Select
          label="Course"
          name="courseId"
          required
          options={courseOptions}
          value={values.courseId}
          error={errors.courseId}
          placeholder={
            values.departmentId ? 'Select a course' : 'Select a department first'
          }
          disabled={!values.departmentId}
          onChange={(event) => {
            setValues((current) => ({ ...current, courseId: event.target.value }))
            setErrors((current) => ({ ...current, courseId: undefined }))
          }}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={values.description}
        error={errors.description}
        placeholder="Brief overview of the subject"
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
              status: event.target.value as SubjectFormValues['status'],
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
