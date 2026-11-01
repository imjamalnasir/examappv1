import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'

export function StudentNotFound() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Student Not Found"
        breadcrumbs={[
          { label: 'Students', path: '/students' },
          { label: 'Not Found' },
        ]}
      />
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p>The requested student does not exist or was deleted.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
      </div>
    </div>
  )
}
