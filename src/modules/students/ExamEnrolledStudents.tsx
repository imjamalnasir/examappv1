import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { useStudents } from '@/context/StudentContext'
import { StudentRankBadge, StudentUnitBadge } from '@/modules/students/StudentBadges'
import { studentsForExam } from '@/modules/students/studentRules'
import type { Exam } from '@/types/exam'

export function ExamEnrolledStudents({ exam }: { exam: Exam }) {
  const { students } = useStudents()
  const enrolled = studentsForExam(students, exam).slice().sort((left, right) => left.name.localeCompare(right.name))
  const registerLink = `/students/new?academic=${exam.academicId}&semester=${exam.semesterId}`

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Enrolled Students</h2>
          <p className="mt-1 text-sm text-slate-500">
            Students registered on this academic session, course, and semester are candidates for the paper.
          </p>
        </div>
        <Link to={registerLink} className="text-sm font-medium text-sky-700 hover:underline">
          Register a student
        </Link>
      </div>
      {enrolled.length === 0 ? (
        <p className="p-5 text-sm text-slate-600">No students are enrolled in this semester yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Army Number</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolled.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{student.id}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link to={`/students/${student.id}`} className="font-medium text-sky-700 hover:underline">
                      {student.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{student.rollNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StudentRankBadge rank={student.rank} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StudentUnitBadge unit={student.unit} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge status={student.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
