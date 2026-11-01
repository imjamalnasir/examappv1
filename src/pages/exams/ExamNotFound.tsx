import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'

export function ExamNotFound() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Exam Not Found"
        breadcrumbs={[
          { label: 'Exams', path: '/exams' },
          { label: 'Not Found' },
        ]}
      />
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p>The requested exam does not exist or was deleted.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/exams')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Button>
      </div>
    </div>
  )
}
