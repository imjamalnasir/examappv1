import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '@/types/navigation'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500">
      <Link
        to="/wings"
        className="inline-flex items-center rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item) => (
        <span key={`${item.label}-${item.path ?? 'current'}`} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          {item.path ? (
            <Link
              to={item.path}
              className="rounded px-1.5 py-0.5 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {item.label}
            </Link>
          ) : (
            <span className="rounded px-1.5 py-0.5 font-medium text-slate-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
