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
import type { Course } from '@/types/course'
import type { EntityStatus } from '@/types/common'
import {
  formatDependencyBlockMessage,
  getCourseDependencyCounts,
  hasDependencies,
} from '@/utils/relationships'

export function CoursesListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { courses, removeCourse } = useCourses()
  const { departments, getById: getDepartmentById } = useDepartments()
  const { subjects } = useSubjects()
  const { topics } = useTopics()

  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | EntityStatus>('All')
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const requestDelete = (course: Course) => {
    const counts = getCourseDependencyCounts(course.id, subjects, topics)
    if (hasDependencies(counts)) {
      toast.error(formatDependencyBlockMessage('course', course.name, counts))
      return
    }
    setCourseToDelete(course)
  }

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()

    return courses.filter((course) => {
      const department = getDepartmentById(course.departmentId)
      const matchesDepartment =
        departmentFilter === 'All' || course.departmentId === departmentFilter
      const matchesStatus = statusFilter === 'All' || course.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.id.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        (department?.name.toLowerCase().includes(query) ?? false)

      return matchesDepartment && matchesStatus && matchesSearch
    })
  }, [courses, search, departmentFilter, statusFilter, getDepartmentById])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(
    filteredCourses,
    5,
  )

  const handleDelete = () => {
    if (!courseToDelete) {
      return
    }

    const removed = removeCourse(courseToDelete.id)
    if (removed) {
      toast.success(`Course "${courseToDelete.name}" deleted.`)
    } else {
      toast.error('Unable to delete course.')
    }
    setCourseToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage courses linked to academic wings."
        breadcrumbs={[{ label: 'Courses' }]}
        actions={
          <Button onClick={() => navigate('/courses/new')}>
            <Plus className="h-4 w-4" />
            Add New Course
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by name, code, ID, or wing..."
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 lg:max-w-sm"
          />
          <select
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value)
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 lg:w-56"
          >
            <option value="All">All Wings</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'All' | EntityStatus)
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 lg:w-44"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {paginatedItems.length === 0 ? (
          <EmptyState
            title="No courses found"
            description={
              courses.length === 0
                ? 'Get started by adding your first course.'
                : 'Try adjusting your search or filters.'
            }
            action={
              courses.length === 0 ? (
                <Button onClick={() => navigate('/courses/new')}>
                  <Plus className="h-4 w-4" />
                  Add New Course
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
                    <th className="px-4 py-3">Course ID</th>
                    <th className="px-4 py-3">Course Name</th>
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Wing</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((course) => {
                    const department = getDepartmentById(course.departmentId)
                    return (
                      <tr key={course.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {course.id}
                        </td>
                        <td className="min-w-48 px-4 py-3 text-slate-800">{course.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {course.code}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {department?.name ?? 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {course.duration || '—'}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                          {course.description || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge status={course.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/courses/${course.id}`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`View ${course.name}`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/courses/${course.id}/edit`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`Edit ${course.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => requestDelete(course)}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${course.name}`}
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
        open={Boolean(courseToDelete)}
        title="Delete Course"
        message={`Are you sure you want to delete "${courseToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
