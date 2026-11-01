import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  STUDENT_RANK_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  STUDENT_UNIT_OPTIONS,
} from '@/modules/students/studentLabels'
import { hasStudentFormErrors, validateStudentForm } from '@/modules/students/studentValidation'
import type { AcademicSession } from '@/types/academic'
import type { Course } from '@/types/course'
import type { Department } from '@/types/department'
import type { EntityStatus } from '@/types/common'
import type { Student, StudentFormErrors, StudentFormValues } from '@/types/student'

interface StudentFormProps {
  initialValues: StudentFormValues
  students: Student[]
  academics: AcademicSession[]
  departments: Department[]
  courses: Course[]
  excludeId?: string
  mode: 'create' | 'edit'
  enrollmentLocked: boolean
  onSubmit: (values: StudentFormValues) => void
  onSaveAnother?: (values: StudentFormValues) => void
  onCancel: () => void
}

export function StudentForm({
  initialValues,
  students,
  academics,
  departments,
  courses,
  excludeId,
  mode,
  enrollmentLocked,
  onSubmit,
  onSaveAnother,
  onCancel,
}: StudentFormProps) {
  const [values, setValues] = useState<StudentFormValues>(initialValues)
  const [errors, setErrors] = useState<StudentFormErrors>({})
  const [formError, setFormError] = useState('')

  const academicOptions = useMemo(() => {
    return academics
      .filter((academic) => {
        if (academic.isDraft && academic.id !== values.academicId) {
          return false
        }
        if (!values.departmentId) {
          return true
        }
        const course = courses.find((item) => item.id === academic.courseId)
        return course?.departmentId === values.departmentId
      })
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((academic) => ({
        label: academic.isDraft ? `${academic.name} (Draft)` : academic.name,
        value: academic.id,
      }))
  }, [academics, courses, values.academicId, values.departmentId])

  const departmentOptions = useMemo(
    () =>
      departments
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((department) => ({
          label: `${department.name} (${department.code})`,
          value: department.id,
        })),
    [departments],
  )

  const courseOptions = useMemo(() => {
    return courses
      .filter((course) => {
        if (values.departmentId && course.departmentId !== values.departmentId) {
          return false
        }
        if (values.academicId) {
          const academic = academics.find((item) => item.id === values.academicId)
          if (academic && academic.courseId !== course.id) {
            return false
          }
        }
        return Boolean(values.departmentId || values.academicId)
      })
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((course) => ({
        label: `${course.name} (${course.code})`,
        value: course.id,
      }))
  }, [academics, courses, values.academicId, values.departmentId])

  const semesterOptions = useMemo(() => {
    const academic = academics.find((item) => item.id === values.academicId)
    return (academic?.semesters ?? [])
      .slice()
      .sort((left, right) => left.number - right.number)
      .map((semester) => ({ label: semester.name, value: semester.id }))
  }, [academics, values.academicId])

  const clearError = (field: keyof StudentFormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const selectAcademic = (academicId: string) => {
    const academic = academics.find((item) => item.id === academicId)
    const course = courses.find((item) => item.id === academic?.courseId)
    setValues((current) => ({
      ...current,
      academicId,
      courseId: academic?.courseId ?? '',
      departmentId: course?.departmentId ?? current.departmentId,
      semesterId: academic?.semesters.some((semester) => semester.id === current.semesterId)
        ? current.semesterId
        : '',
    }))
    setErrors((current) => ({
      ...current,
      academicId: undefined,
      courseId: undefined,
      departmentId: undefined,
      semesterId: undefined,
    }))
    setFormError('')
  }

  const selectDepartment = (departmentId: string) => {
    setValues((current) => {
      const course = courses.find((item) => item.id === current.courseId)
      const academic = academics.find((item) => item.id === current.academicId)
      const academicCourse = courses.find((item) => item.id === academic?.courseId)
      const courseMatches = !course || course.departmentId === departmentId
      const academicMatches = !academicCourse || academicCourse.departmentId === departmentId
      return {
        ...current,
        departmentId,
        courseId: courseMatches ? current.courseId : '',
        academicId: academicMatches ? current.academicId : '',
        semesterId: academicMatches ? current.semesterId : '',
      }
    })
    setErrors((current) => ({
      ...current,
      departmentId: undefined,
      courseId: undefined,
      academicId: undefined,
      semesterId: undefined,
    }))
    setFormError('')
  }

  const selectCourse = (courseId: string) => {
    const course = courses.find((item) => item.id === courseId)
    setValues((current) => {
      const academic = academics.find((item) => item.id === current.academicId)
      const academicMatches = Boolean(academic && academic.courseId === courseId)
      return {
        ...current,
        courseId,
        departmentId: course?.departmentId ?? current.departmentId,
        academicId: academicMatches ? current.academicId : '',
        semesterId: academicMatches ? current.semesterId : '',
      }
    })
    setErrors((current) => ({
      ...current,
      courseId: undefined,
      departmentId: undefined,
      academicId: undefined,
      semesterId: undefined,
    }))
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateStudentForm(
      values,
      students,
      academics,
      departments,
      courses,
      excludeId,
    )
    if (hasStudentFormErrors(nextErrors)) {
      setErrors(nextErrors)
      setFormError('Complete the highlighted fields before saving.')
      return
    }
    setFormError('')
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : 'save'
    if (intent === 'another' && onSaveAnother) {
      onSaveAnother(values)
      return
    }
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {formError}
        </p>
      ) : null}
      {enrollmentLocked ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          This student is already tied to examinations in the current semester. Academic, wing, course, and
          semester stay fixed so those records remain valid. Contact details, rank, and unit can still be updated.
        </div>
      ) : null}

      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Student Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Rank and unit place the student in the college register. Army numbers must stay unique.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Student Name"
            name="name"
            required
            value={values.name}
            error={errors.name}
            placeholder="e.g. Amina Karim"
            onChange={(event) => {
              setValues((current) => ({ ...current, name: event.target.value }))
              clearError('name')
            }}
          />
          <Input
            label="Army Number"
            name="rollNumber"
            required
            value={values.rollNumber}
            error={errors.rollNumber}
            placeholder="e.g. CS-26014"
            hint="Must be unique. Letters, numbers, and dashes."
            onChange={(event) => {
              setValues((current) => ({ ...current, rollNumber: event.target.value.toUpperCase() }))
              clearError('rollNumber')
            }}
          />
          <Select
            label="Rank"
            name="rank"
            required
            options={STUDENT_RANK_OPTIONS}
            value={values.rank}
            error={errors.rank}
            placeholder="Select a rank"
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                rank: event.target.value as StudentFormValues['rank'],
              }))
              clearError('rank')
            }}
          />
          <Select
            label="Unit"
            name="unit"
            required
            options={STUDENT_UNIT_OPTIONS}
            value={values.unit}
            error={errors.unit}
            placeholder="Select a unit"
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                unit: event.target.value as StudentFormValues['unit'],
              }))
              clearError('unit')
            }}
          />
          <Select
            label="Status"
            name="status"
            required
            options={STUDENT_STATUS_OPTIONS}
            value={values.status}
            error={errors.status}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                status: event.target.value as EntityStatus,
              }))
              clearError('status')
            }}
          />
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Academic Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            The course follows the academic session and the wing that offers it. Semesters come from that
            session.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SearchableSelect
            label="Academic"
            name="academicId"
            required
            options={academicOptions}
            value={values.academicId}
            error={errors.academicId}
            placeholder="Select an academic session"
            disabled={enrollmentLocked}
            onChange={selectAcademic}
          />
          <SearchableSelect
            label="Wing"
            name="departmentId"
            required
            options={departmentOptions}
            value={values.departmentId}
            error={errors.departmentId}
            placeholder="Select a wing"
            disabled={enrollmentLocked}
            onChange={selectDepartment}
          />
          <SearchableSelect
            label="Course"
            name="courseId"
            required
            options={courseOptions}
            value={values.courseId}
            error={errors.courseId}
            placeholder={
              values.departmentId || values.academicId
                ? 'Select a course'
                : 'Select an academic session or wing first'
            }
            disabled={enrollmentLocked || (!values.departmentId && !values.academicId)}
            emptyMessage="No courses match this academic session and wing."
            onChange={selectCourse}
          />
          <Select
            label="Semester"
            name="semesterId"
            required
            options={semesterOptions}
            value={values.semesterId}
            error={errors.semesterId}
            placeholder={values.academicId ? 'Select a semester' : 'Select an academic session first'}
            disabled={enrollmentLocked || !values.academicId}
            onChange={(event) => {
              setValues((current) => ({ ...current, semesterId: event.target.value }))
              clearError('semesterId')
            }}
          />
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Contact Information</h2>
          <p className="mt-1 text-sm text-slate-500">Used for examination notices and student records.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Contact Number"
            name="phone"
            type="tel"
            required
            value={values.phone}
            error={errors.phone}
            placeholder="e.g. +1 415 555 0142"
            onChange={(event) => {
              setValues((current) => ({ ...current, phone: event.target.value }))
              clearError('phone')
            }}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={values.email}
            error={errors.email}
            placeholder="name@university.edu"
            onChange={(event) => {
              setValues((current) => ({ ...current, email: event.target.value }))
              clearError('email')
            }}
          />
        </div>
        <Textarea
          label="Address"
          name="address"
          value={values.address}
          error={errors.address}
          placeholder="Street, city, and region"
          onChange={(event) => {
            setValues((current) => ({ ...current, address: event.target.value }))
            clearError('address')
          }}
        />
        <Textarea
          label="Remarks"
          name="remarks"
          value={values.remarks}
          error={errors.remarks}
          placeholder="Optional notes about enrollment or examination arrangements"
          onChange={(event) => {
            setValues((current) => ({ ...current, remarks: event.target.value }))
            clearError('remarks')
          }}
        />
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {mode === 'create' && onSaveAnother ? (
          <Button type="submit" name="intent" value="another" variant="secondary">
            Save & Add Another
          </Button>
        ) : null}
        <Button type="submit" name="intent" value="save">
          {mode === 'create' ? 'Save Student' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
