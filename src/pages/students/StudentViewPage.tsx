import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useExams } from '@/context/ExamContext'
import { useStudents } from '@/context/StudentContext'
import { useToast } from '@/context/ToastContext'
import { StudentDeleteDialog } from '@/modules/students/StudentDeleteDialog'
import { StudentRecordSections } from '@/modules/students/StudentRecordSections'
import { examsForStudent, studentDeletion } from '@/modules/students/studentRules'
import { StudentNotFound } from '@/pages/students/StudentNotFound'

export function StudentViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, withdrawStudent, removeStudent } = useStudents()
  const { exams } = useExams()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const student = getById(id)

  const linkedExams = useMemo(
    () => (student ? examsForStudent(student, exams) : []),
    [student, exams],
  )

  if (!student) {
    return <StudentNotFound />
  }

  const deletion = studentDeletion(student, exams)

  const handleDelete = () => {
    if (deletion === 'withdraw') {
      const updated = withdrawStudent(student.id)
      setConfirmOpen(false)
      if (updated) {
        toast.success(`${updated.name} was withdrawn. Examination records were kept.`)
      } else {
        toast.error('Unable to withdraw this student.')
      }
      return
    }
    if (deletion === 'delete') {
      removeStudent(student.id)
      toast.success(`${student.name} (${student.rollNumber}) deleted.`)
      navigate('/students')
    }
  }

  return (
    <div>
      <PageHeader
        title={student.name}
        description={`${student.rollNumber} · ${student.rank} · ${student.unit}`}
        breadcrumbs={[
          { label: 'Students', path: '/students' },
          { label: student.name },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/students')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Student List
            </Button>
            <Button onClick={() => navigate(`/students/${student.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit Student
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Student
            </Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Badge status={student.status} />
        <span className="text-sm text-slate-500">{student.id}</span>
      </div>

      <StudentRecordSections student={student} exams={linkedExams} />

      <StudentDeleteDialog
        student={student}
        exams={exams}
        mode={deletion}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
