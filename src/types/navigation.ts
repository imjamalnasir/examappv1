import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface BreadcrumbItem {
  label: string
  path?: string
}
