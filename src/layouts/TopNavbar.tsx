import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { APP_NAME, getPageTitle } from '@/utils/navigation'

interface TopNavbarProps {
  onMenuClick: () => void
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { pathname } = useLocation()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{pageTitle}</p>
        <p className="hidden truncate text-xs text-slate-500 sm:block">{APP_NAME}</p>
      </div>
    </header>
  )
}
