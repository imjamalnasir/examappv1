import { Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { getBreadcrumbs } from '@/utils/navigation'

interface ModulePlaceholderProps {
  title: string
  description: string
  nextStep: string
}

export function ModulePlaceholder({ title, description, nextStep }: ModulePlaceholderProps) {
  const { pathname } = useLocation()

  return (
    <div>
      <PageHeader title={title} description={description} breadcrumbs={getBreadcrumbs(pathname)} />

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Construction className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-medium text-slate-900">{title} module</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          List, view, add, edit, and delete screens will be implemented in {nextStep}. Navigation and
          layout are ready.
        </p>
      </div>
    </div>
  )
}
