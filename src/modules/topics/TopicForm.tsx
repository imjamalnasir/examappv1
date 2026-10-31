import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { validateTopicForm } from '@/modules/topics/topicValidation'
import type { Course } from '@/types/course'
import type { Department } from '@/types/department'
import type { Subject } from '@/types/subject'
import type { TopicFormErrors, TopicFormValues } from '@/types/topic'
import {
  getCoursesByDepartment,
  getSubjectsByCourse,
} from '@/utils/relationships'

interface TopicFormProps {
  initialValues: TopicFormValues
  departments: Department[]
  courses: Course[]
  subjects: Subject[]
  submitLabel: string
  onSubmit: (values: TopicFormValues) => void
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

export function TopicForm({
  initialValues,
  departments,
  courses,
  subjects,
  submitLabel,
  onSubmit,
  onCancel,
}: TopicFormProps) {
  const [values, setValues] = useState<TopicFormValues>(initialValues)
  const [errors, setErrors] = useState<TopicFormErrors>({})

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
      getCoursesByDepartment(courses, values.departmentId).map((course) => ({
        label: `${course.name} (${course.code})`,
        value: course.id,
      })),
    [courses, values.departmentId],
  )

  const subjectOptions = useMemo(
    () =>
      getSubjectsByCourse(subjects, values.courseId).map((subject) => ({
        label: `${subject.name} (${subject.code})`,
        value: subject.id,
      })),
    [subjects, values.courseId],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateTopicForm(values, subjects, courses)

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
      <div className="grid gap-5 sm:grid-cols-3">
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
            setValues((current) => ({
              ...current,
              departmentId,
              courseId: '',
              subjectId: '',
            }))
            setErrors((current) => ({
              ...current,
              departmentId: undefined,
              courseId: undefined,
              subjectId: undefined,
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
          placeholder={values.departmentId ? 'Select a course' : 'Select a department first'}
          disabled={!values.departmentId}
          onChange={(event) => {
            const courseId = event.target.value
            setValues((current) => ({
              ...current,
              courseId,
              subjectId: '',
            }))
            setErrors((current) => ({
              ...current,
              courseId: undefined,
              subjectId: undefined,
            }))
          }}
        />
        <Select
          label="Subject"
          name="subjectId"
          required
          options={subjectOptions}
          value={values.subjectId}
          error={errors.subjectId}
          placeholder={values.courseId ? 'Select a subject' : 'Select a course first'}
          disabled={!values.courseId}
          onChange={(event) => {
            setValues((current) => ({ ...current, subjectId: event.target.value }))
            setErrors((current) => ({ ...current, subjectId: undefined }))
          }}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Topic Name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          placeholder="e.g. Variables and Data Types"
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }))
            setErrors((current) => ({ ...current, name: undefined }))
          }}
        />
        <Input
          label="Display Order"
          name="displayOrder"
          required
          type="number"
          min={1}
          value={values.displayOrder}
          error={errors.displayOrder}
          hint="Lower numbers appear first within a subject."
          placeholder="e.g. 1"
          onChange={(event) => {
            setValues((current) => ({ ...current, displayOrder: event.target.value }))
            setErrors((current) => ({ ...current, displayOrder: undefined }))
          }}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={values.description}
        error={errors.description}
        placeholder="Brief overview of the topic"
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
              status: event.target.value as TopicFormValues['status'],
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
