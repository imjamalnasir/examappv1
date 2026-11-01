import {
  BookOpen,
  Building2,
  ClipboardCheck,
  FileQuestionMark,
  GraduationCap,
  Layers,
  Library,
  Users,
} from 'lucide-react'
import type { BreadcrumbItem, NavItem } from '@/types/navigation'

export const APP_NAME = 'Examination Management Software System'

export const navItems: NavItem[] = [
  { label: 'Academics', path: '/academics', icon: GraduationCap },
  { label: 'Wings', path: '/wings', icon: Building2 },
  { label: 'Courses', path: '/courses', icon: Library },
  { label: 'Subjects', path: '/subjects', icon: BookOpen },
  { label: 'Topics', path: '/topics', icon: Layers },
  { label: 'Question Bank', path: '/question-bank', icon: FileQuestionMark },
  { label: 'Exams', path: '/exams', icon: ClipboardCheck },
  { label: 'Students', path: '/students', icon: Users },
]

const routeLabels: Record<string, string> = {
  academics: 'Academics',
  wings: 'Wings',
  courses: 'Courses',
  subjects: 'Subjects',
  topics: 'Topics',
  'question-bank': 'Question Bank',
  exams: 'Exams',
  students: 'Students',
  questions: 'Questions',
  forward: 'Forward to Approval',
  approval: 'Approval',
  semesters: 'Semesters',
  new: 'Add',
  edit: 'Edit',
  view: 'View',
}

const singularLabels: Record<string, string> = {
  academics: 'Academic',
  wings: 'Wing',
  courses: 'Course',
  subjects: 'Subject',
  topics: 'Topic',
  'question-bank': 'Question',
  exams: 'Exam',
  students: 'Student',
}

const entityIdPattern = /^[A-Z]{2,5}-\d+$/i

function getSegmentLabel(segment: string): string {
  if (routeLabels[segment]) {
    return routeLabels[segment]
  }
  if (entityIdPattern.test(segment)) {
    return 'Details'
  }
  return segment
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return [{ label: 'Wings', path: '/wings' }]
  }

  const crumbs: BreadcrumbItem[] = []
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    crumbs.push({
      label: getSegmentLabel(segment),
      path: isLast ? undefined : currentPath,
    })
  })

  return crumbs
}

export function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Wings'
  }

  const moduleKey = segments[0]
  const moduleLabel = routeLabels[moduleKey] ?? moduleKey
  const singular = singularLabels[moduleKey] ?? moduleLabel
  const last = segments[segments.length - 1]

  if (moduleKey === 'question-bank' && segments[1] === 'import') {
    if (segments[2] === 'history') {
      return segments.length > 3 ? 'Import Details' : 'Import History'
    }
    return 'Import Questions'
  }

  if (moduleKey === 'students') {
    if (last === 'new') {
      return 'Add Student'
    }
    if (last === 'edit') {
      return 'Edit Student'
    }
    if (entityIdPattern.test(last)) {
      return 'Student Details'
    }
    return 'Students'
  }

  if (moduleKey === 'exams') {
    if (last === 'new') {
      return 'Add Exam'
    }
    if (last === 'edit') {
      return 'Edit Exam'
    }
    if (last === 'questions') {
      return 'Select Questions'
    }
    if (last === 'forward') {
      return 'Forward to Approval'
    }
    if (last === 'approval') {
      return 'Exam Approval'
    }
    if (entityIdPattern.test(last)) {
      return 'Exam Details'
    }
    return 'Exams'
  }

  if (moduleKey === 'academics' && segments.includes('semesters')) {
    if (last === 'semesters') {
      return 'Manage Semesters'
    }
    return 'Manage Subjects'
  }

  if (last === 'new') {
    return `Add ${singular}`
  }

  if (last === 'edit') {
    return `Edit ${singular}`
  }

  if (entityIdPattern.test(last)) {
    return moduleLabel
  }

  return routeLabels[last] ?? last
}
