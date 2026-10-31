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
import type { Department } from '@/types/department'
import type { EntityStatus } from '@/types/common'
import { formatDate } from '@/utils/format'
import {
  formatDependencyBlockMessage,
  getDepartmentDependencyCounts,
  hasDependencies,
} from '@/utils/relationships'

export function DepartmentsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { departments, removeDepartment } = useDepartments()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const { topics } = useTopics()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | EntityStatus>('All')
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

  const requestDelete = (department: Department) => {
    const counts = getDepartmentDependencyCounts(department.id, courses, subjects, topics)
    if (hasDependencies(counts)) {
      toast.error(formatDependencyBlockMessage('department', department.name, counts))
      return
    }
    setDepartmentToDelete(department)
  }

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return departments.filter((department) => {
      const matchesStatus = statusFilter === 'All' || department.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        department.name.toLowerCase().includes(query) ||
        department.code.toLowerCase().includes(query) ||
        department.id.toLowerCase().includes(query) ||
        department.description.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [departments, search, statusFilter])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(
    filteredDepartments,
    5,
  )

  const handleDelete = () => {
    if (!departmentToDelete) {
      return
    }

    const removed = removeDepartment(departmentToDelete.id)
    if (removed) {
      toast.success(`Department "${departmentToDelete.name}" deleted.`)
    } else {
      toast.error('Unable to delete department.')
    }
    setDepartmentToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage university academic departments."
        breadcrumbs={[{ label: 'Departments' }]}
        actions={
          <Button onClick={() => navigate('/departments/new')}>
            <Plus className="h-4 w-4" />
            Add New Department
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by name, code, or ID..."
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 sm:max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'All' | EntityStatus)
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 sm:w-44"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {paginatedItems.length === 0 ? (
          <EmptyState
            title="No departments found"
            description={
              departments.length === 0
                ? 'Get started by adding your first academic department.'
                : 'Try adjusting your search or status filter.'
            }
            action={
              departments.length === 0 ? (
                <Button onClick={() => navigate('/departments/new')}>
                  <Plus className="h-4 w-4" />
                  Add New Department
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
                    <th className="px-4 py-3">Department ID</th>
                    <th className="px-4 py-3">Department Name</th>
                    <th className="px-4 py-3">Department Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((department) => (
                    <tr key={department.id} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {department.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {department.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {department.code}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                        {department.description || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge status={department.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDate(department.createdDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/departments/${department.id}`}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                            aria-label={`View ${department.name}`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/departments/${department.id}/edit`}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                            aria-label={`Edit ${department.name}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => requestDelete(department)}
                            className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${department.name}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        open={Boolean(departmentToDelete)}
        title="Delete Department"
        message={`Are you sure you want to delete "${departmentToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setDepartmentToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
