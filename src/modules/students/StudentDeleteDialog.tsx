import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { examsForStudent, type StudentDeletion } from '@/modules/students/studentRules'
import type { Exam } from '@/types/exam'
import type { Student } from '@/types/student'

export function StudentDeleteDialog({
  student,
  exams,
  mode,
  open,
  onCancel,
  onConfirm,
}: {
  student: Student | null
  exams: Exam[]
  mode: StudentDeletion
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open || !student) {
    return null
  }

  const linked = examsForStudent(student, exams)
  const blocked = mode === 'blocked'

  return (
    <Modal
      open
      wide
      title={blocked ? 'Deletion restricted' : mode === 'withdraw' ? 'Withdraw student' : 'Delete student'}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {blocked ? 'Close' : 'Cancel'}
          </Button>
          {blocked ? null : (
            <Button variant="danger" onClick={onConfirm}>
              {mode === 'withdraw' ? 'Withdraw Student' : 'Delete Student'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-3">
        <p>
          <span className="font-medium text-slate-900">{student.name}</span>
          <span className="text-slate-500"> · Army Number {student.rollNumber}</span>
        </p>
        {mode === 'delete' ? (
          <p>
            This permanently removes the student from the register. Academic sessions, courses, and examinations are
            not deleted.
          </p>
        ) : null}
        {mode === 'withdraw' ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
            <p>
              {student.name} is enrolled against {linked.length}{' '}
              {linked.length === 1 ? 'examination' : 'examinations'}. The record will be withdrawn
              instead of deleted, so those examination and academic records stay intact.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {linked.map((exam) => (
                <li key={exam.id}>
                  <Link to={`/exams/${exam.id}`} className="text-sky-800 hover:underline" onClick={onCancel}>
                    {exam.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {blocked ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
            <p>
              {student.name} is already inactive and still linked to {linked.length}{' '}
              {linked.length === 1 ? 'examination' : 'examinations'}. Permanent deletion is blocked so
              the examination history remains available.
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
