import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { AcademicStatusBadge, DraftBadge } from '@/components/ui/AcademicStatusBadge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useToast } from '@/context/ToastContext'
import { usePagination } from '@/hooks/usePagination'
import { includesDate, overlapsYear } from '@/modules/academics/academicDates'
import { countAllocatedSubjects } from '@/modules/academics/academicLookups'
import { getAcademicStatus } from '@/services/academicService'
import type { AcademicSession, AcademicStatus } from '@/types/academic'
import { formatDate } from '@/utils/format'

type SortKey =
  | 'id'
  | 'name'
  | 'course'
  | 'startDate'
  | 'endDate'
  | 'semesters'
  | 'subjects'
  | 'status'
type SortDirection = 'asc' | 'desc'

const statusOrder: Record<AcademicStatus, number> = {
  Completed: 0,
  Active: 1,
  Upcoming: 2,
}

function compareAcademics(
  left: AcademicSession,
  right: AcademicSession,
  key: SortKey,
  direction: SortDirection,
  courseLabel: (academic: AcademicSession) => string,
): number {
  const factor = direction === 'asc' ? 1 : -1
  let result = 0

  switch (key) {
    case 'id':
      result = left.id.localeCompare(right.id)
      break
    case 'name':
      result = left.name.localeCompare(right.name)
      break
    case 'course':
      result = courseLabel(left).localeCompare(courseLabel(right))
      break
    case 'startDate':
      result = left.startDate.localeCompare(right.startDate)
      break
    case 'endDate':
      result = left.endDate.localeCompare(right.endDate)
      break
    case 'semesters':
      result = left.semesters.length - right.semesters.length
      break
    case 'subjects':
      result = countAllocatedSubjects(left) - countAllocatedSubjects(right)
      break
    case 'status':
      result =
        statusOrder[getAcademicStatus(left.startDate, left.endDate)] -
        statusOrder[getAcademicStatus(right.startDate, right.endDate)]
      break
    default:
      result = 0
  }

  return result * factor
}

function SortableHeader({
  label,
  column,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string
  column: SortKey
  sortKey: SortKey
  sortDirection: SortDirection
  onSort: (column: SortKey) => void
}) {
  const active = sortKey === column
  const Icon = !active ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown

  return (
    <th
      className="whitespace-nowrap px-4 py-3"
      aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 uppercase tracking-wide"
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-sky-700' : 'text-slate-400'}`} />
      </button>
    </th>
  )
}

export function AcademicsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { academics, removeAcademic } = useAcademics()
  const { courses } = useCourses()
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | AcademicStatus>('All')
  const [courseFilter, setCourseFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('startDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [academicToDelete, setAcademicToDelete] = useState<AcademicSession | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timeout)
  }, [])

  const courseOptions = useMemo(
    () => courses.slice().sort((left, right) => left.name.localeCompare(right.name)),
    [courses],
  )

  const courseNameById = useMemo(() => {
    const names = new Map<string, string>()
    courses.forEach((course) => names.set(course.id, course.name))
    return names
  }, [courses])

  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    academics.forEach((academic) => {
      const startYear = Number(academic.startDate.slice(0, 4))
      const endYear = Number(academic.endDate.slice(0, 4))
      for (let year = startYear; year <= endYear; year += 1) {
        years.add(year)
      }
    })
    return Array.from(years).sort((left, right) => right - left)
  }, [academics])

  const filteredAcademics = useMemo(() => {
    const query = search.trim().toLowerCase()

    return academics
      .filter((academic) => {
        const status = getAcademicStatus(academic.startDate, academic.endDate)
        const matchesStatus = statusFilter === 'All' || status === statusFilter
        const matchesCourse = courseFilter === 'All' || academic.courseId === courseFilter
        const matchesYear =
          yearFilter === 'All' || overlapsYear(academic.startDate, academic.endDate, Number(yearFilter))
        const matchesDate =
          !dateFilter || includesDate(academic.startDate, academic.endDate, dateFilter)
        const matchesSearch =
          query.length === 0 ||
          academic.name.toLowerCase().includes(query) ||
          academic.id.toLowerCase().includes(query)

        return matchesStatus && matchesCourse && matchesYear && matchesDate && matchesSearch
      })
      .sort((left, right) =>
        compareAcademics(
          left,
          right,
          sortKey,
          sortDirection,
          (academic) => courseNameById.get(academic.courseId) ?? '',
        ),
      )
  }, [
    academics,
    search,
    statusFilter,
    courseFilter,
    yearFilter,
    dateFilter,
    sortKey,
    sortDirection,
    courseNameById,
  ])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(filteredAcademics, 5)

  const toggleSort = (column: SortKey) => {
    setPage(1)
    if (sortKey === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(column)
    setSortDirection('asc')
  }

  const handleDelete = () => {
    if (!academicToDelete) {
      return
    }
    const removed = removeAcademic(academicToDelete.id)
    if (removed) {
      toast.success(`Academic session "${academicToDelete.name}" deleted.`)
    } else {
      toast.error('Unable to delete academic session.')
    }
    setAcademicToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Academics"
        description="Manage academic sessions, semesters, and subject allocations."
        breadcrumbs={[{ label: 'Academics' }]}
        actions={
          <Button onClick={() => navigate('/academics/new')}>
            <Plus className="h-4 w-4" />
            Add Academic
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
            placeholder="Search by academic name or ID"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'All' | AcademicStatus)
              setPage(1)
            }}
            aria-label="Filter by academic status"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-44"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={courseFilter}
            onChange={(event) => {
              setCourseFilter(event.target.value)
              setPage(1)
            }}
            aria-label="Filter by course"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-64"
          >
            <option value="All">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(event) => {
              setYearFilter(event.target.value)
              setPage(1)
            }}
            aria-label="Filter by year"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-36"
          >
            <option value="All">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value)
              setPage(1)
            }}
            aria-label="Filter by a date within the session"
            title="Show sessions that include this date"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-44"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4" aria-live="polite" aria-busy="true">
            <p className="text-sm text-slate-500">Loading academic sessions...</p>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            title="No academic sessions found"
            description={
              academics.length === 0
                ? 'Get started by adding your first academic session.'
                : 'Try adjusting your search or filters.'
            }
            action={
              academics.length === 0 ? (
                <Button onClick={() => navigate('/academics/new')}>
                  <Plus className="h-4 w-4" />
                  Add Academic
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <SortableHeader
                      label="Academic ID"
                      column="id"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Academic Name"
                      column="name"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Course"
                      column="course"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Start Date"
                      column="startDate"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="End Date"
                      column="endDate"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Total Semesters"
                      column="semesters"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Total Subjects"
                      column="subjects"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Status"
                      column="status"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <th className="whitespace-nowrap px-4 py-3 text-right uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((academic) => {
                    const status = getAcademicStatus(academic.startDate, academic.endDate)
                    const courseName = courseNameById.get(academic.courseId)
                    return (
                      <tr key={academic.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {academic.id}
                        </td>
                        <td className="min-w-52 px-4 py-3 text-slate-800">{academic.name}</td>
                        <td className="min-w-56 max-w-xs px-4 py-3 text-slate-600">
                          {courseName ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDate(academic.startDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDate(academic.endDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {academic.semesters.length}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {countAllocatedSubjects(academic)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <AcademicStatusBadge status={status} />
                            {academic.isDraft ? <DraftBadge /> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/academics/${academic.id}`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`View ${academic.name}`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/academics/${academic.id}/edit`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`Edit ${academic.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setAcademicToDelete(academic)}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${academic.name}`}
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
        open={Boolean(academicToDelete)}
        title="Delete Academic Session"
        message={`Are you sure you want to delete "${academicToDelete?.name}"? Semesters and subject allocations in this session will be removed. This action cannot be undone.`}
        onCancel={() => setAcademicToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
