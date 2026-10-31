import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'

export function AcademicNotFound() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Academic Not Found"
        breadcrumbs={[
          { label: 'Academics', path: '/academics' },
          { label: 'Not Found' },
        ]}
      />
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p>The requested academic session does not exist or was deleted.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/academics')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Academics
        </Button>
      </div>
    </div>
  )
}
