import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useCourses } from '@/context/CourseContext'
import { useDepartments } from '@/context/DepartmentContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { usePagination } from '@/hooks/usePagination'
import type { EntityStatus } from '@/types/common'
import type { Subject } from '@/types/subject'
import {
  formatDependencyBlockMessage,
  getCoursesByDepartment,
  getSubjectDependencyCounts,
  hasDependencies,
} from '@/utils/relationships'

export function SubjectsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { subjects, removeSubject } = useSubjects()
  const { courses, getById: getCourseById } = useCourses()
  const { departments, getById: getDepartmentById } = useDepartments()
  const { topics } = useTopics()

  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | EntityStatus>('All')
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)

  const requestDelete = (subject: Subject) => {
    const counts = getSubjectDependencyCounts(subject.id, topics)
    if (hasDependencies(counts)) {
      toast.error(formatDependencyBlockMessage('subject', subject.name, counts))
      return
    }
    setSubjectToDelete(subject)
  }

  const courseFilterOptions = useMemo(() => {
    if (departmentFilter === 'All') {
      return courses
    }
    return getCoursesByDepartment(courses, departmentFilter)
  }, [courses, departmentFilter])

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    return subjects.filter((subject) => {
      const course = getCourseById(subject.courseId)
      const department = course ? getDepartmentById(course.departmentId) : undefined

      const matchesDepartment =
        departmentFilter === 'All' || course?.departmentId === departmentFilter
      const matchesCourse = courseFilter === 'All' || subject.courseId === courseFilter
      const matchesStatus = statusFilter === 'All' || subject.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.id.toLowerCase().includes(query) ||
        subject.description.toLowerCase().includes(query) ||
        (course?.name.toLowerCase().includes(query) ?? false) ||
        (department?.name.toLowerCase().includes(query) ?? false)

      return matchesDepartment && matchesCourse && matchesStatus && matchesSearch
    })
  }, [
    subjects,
    search,
    departmentFilter,
    courseFilter,
    statusFilter,
    getCourseById,
    getDepartmentById,
  ])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(
    filteredSubjects,
    5,
  )

  const handleDelete = () => {
    if (!subjectToDelete) {
      return
    }

    const removed = removeSubject(subjectToDelete.id)
    if (removed) {
      toast.success(`Subject "${subjectToDelete.name}" deleted.`)
    } else {
      toast.error('Unable to delete subject.')
    }
    setSubjectToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Manage subjects linked to courses and departments."
        breadcrumbs={[{ label: 'Subjects' }]}
        actions={
          <Button onClick={() => navigate('/subjects/new')}>
            <Plus className="h-4 w-4" />
            Add New Subject
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by name, code, course, or department..."
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:max-w-sm"
          />
          <select
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value)
              setCourseFilter('All')
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-52"
          >
            <option value="All">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <select
            value={courseFilter}
            onChange={(event) => {
              setCourseFilter(event.target.value)
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-64"
          >
            <option value="All">All Courses</option>
            {courseFilterOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'All' | EntityStatus)
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-40"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {paginatedItems.length === 0 ? (
          <EmptyState
            title="No subjects found"
            description={
              subjects.length === 0
                ? 'Get started by adding your first subject.'
                : 'Try adjusting your search or filters.'
            }
            action={
              subjects.length === 0 ? (
                <Button onClick={() => navigate('/subjects/new')}>
                  <Plus className="h-4 w-4" />
                  Add New Subject
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Subject ID</th>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Subject Code</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((subject) => {
                    const course = getCourseById(subject.courseId)
                    const department = course
                      ? getDepartmentById(course.departmentId)
                      : undefined

                    return (
                      <tr key={subject.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {subject.id}
                        </td>
                        <td className="min-w-44 px-4 py-3 text-slate-800">{subject.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {subject.code}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {department?.name ?? 'Unknown'}
                        </td>
                        <td className="min-w-44 px-4 py-3 text-slate-600">
                          {course?.name ?? 'Unknown'}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                          {subject.description || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge status={subject.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/subjects/${subject.id}`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`View ${subject.name}`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/subjects/${subject.id}/edit`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`Edit ${subject.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => requestDelete(subject)}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${subject.name}`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(subjectToDelete)}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subjectToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setSubjectToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
