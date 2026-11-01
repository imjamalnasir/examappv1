import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { ExamStatusBadge, ExamTypeBadge } from '@/modules/exams/ExamStatusBadge'
import type { Exam } from '@/types/exam'
import type { Student } from '@/types/student'
import { formatDate } from '@/utils/format'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children || '—'}</dd>
    </div>
  )
}

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

export function StudentRecordSections({ student, exams }: { student: Student; exams: Exam[] }) {
  const { getById: getAcademic } = useAcademics()
  const { getById: getDepartment } = useDepartments()
  const { getById: getCourse } = useCourses()
  const academic = getAcademic(student.academicId)
  const department = getDepartment(student.departmentId)
  const course = getCourse(student.courseId)
  const semester = academic?.semesters.find((item) => item.id === student.semesterId)

  return (
    <div className="space-y-4">
      <Panel title="Basic Information" description="Identity on the college register.">
        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <Field label="Student ID">{student.id}</Field>
          <Field label="Student Name">{student.name}</Field>
          <Field label="Army Number">{student.rollNumber}</Field>
          <Field label="Rank">{student.rank}</Field>
          <Field label="Unit">{student.unit}</Field>
          <Field label="Status">
            <Badge status={student.status} />
          </Field>
          <Field label="Registered">{formatDate(student.createdDate)}</Field>
        </dl>
      </Panel>

      <Panel title="Academic Information" description="Session, wing, course, and semester for this enrollment.">
        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <Field label="Academic">
            {academic ? (
              <Link to={`/academics/${academic.id}`} className="text-sky-700 hover:underline">
                {academic.name}
              </Link>
            ) : (
              'Unknown academic session'
            )}
          </Field>
          <Field label="Wing">
            {department ? (
              <Link to={`/wings/${department.id}`} className="text-sky-700 hover:underline">
                {department.name}
              </Link>
            ) : (
              'Unknown wing'
            )}
          </Field>
          <Field label="Course">
            {course ? (
              <Link to={`/courses/${course.id}`} className="text-sky-700 hover:underline">
                {course.name}
              </Link>
            ) : (
              'Unknown course'
            )}
          </Field>
          <Field label="Semester">
            {semester && academic ? (
              <Link to={`/academics/${academic.id}/semesters`} className="text-sky-700 hover:underline">
                {semester.name}
              </Link>
            ) : (
              'Unknown semester'
            )}
          </Field>
        </dl>
      </Panel>

      <Panel title="Contact Information" description="How the college reaches this student.">
        <dl className="grid gap-6 p-5 sm:grid-cols-2">
          <Field label="Phone Number">{student.phone}</Field>
          <Field label="Email">{student.email}</Field>
          <div className="sm:col-span-2">
            <Field label="Address">{student.address || '—'}</Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Remarks">{student.remarks || '—'}</Field>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Examinations"
        description="Papers scheduled for this academic session, course, and semester."
      >
        {exams.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">
            No examinations are scheduled for this enrollment. The student can be removed from the register.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link to={`/exams/${exam.id}`} className="font-medium text-sky-700 hover:underline">
                        {exam.name}
                      </Link>
                      <p className="text-xs text-slate-500">{exam.id}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ExamTypeBadge type={exam.examType} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(exam.examDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ExamStatusBadge status={exam.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
