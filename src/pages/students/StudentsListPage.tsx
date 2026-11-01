import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { useExams } from '@/context/ExamContext'
import { useStudents } from '@/context/StudentContext'
import { useToast } from '@/context/ToastContext'
import { usePagination } from '@/hooks/usePagination'
import { StudentRankBadge, StudentUnitBadge } from '@/modules/students/StudentBadges'
import { StudentDeleteDialog } from '@/modules/students/StudentDeleteDialog'
import { StudentSummaryCards, type StudentCardFilter } from '@/modules/students/StudentSummaryCards'
import { STUDENT_RANK_OPTIONS, STUDENT_UNIT_OPTIONS, compareStudentRanks } from '@/modules/students/studentLabels'
import { findRosterProblem, studentDeletion } from '@/modules/students/studentRules'
import type { Student, StudentRank, StudentUnit } from '@/types/student'

type SortKey = 'name' | 'rollNumber' | 'rank'
type SortDirection = 'asc' | 'desc'
type RankFilter = 'All' | StudentRank
type UnitFilter = 'All' | StudentUnit

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

export function StudentsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { students, withdrawStudent, removeStudent } = useStudents()
  const { exams } = useExams()
  const [isLoading, setIsLoading] = useState(true)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const [rankFilter, setRankFilter] = useState<RankFilter>('All')
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StudentCardFilter>('All')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [pageSize, setPageSize] = useState(5)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timeout)
  }, [loadAttempt])

  const rosterError = useMemo(() => findRosterProblem(students), [students])
  const filtersActive =
    search.trim().length > 0 || rankFilter !== 'All' || unitFilter !== 'All' || statusFilter !== 'All'

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const next = students.filter((student) => {
      const matchesQuery =
        query.length === 0 ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query)
      const matchesRank = rankFilter === 'All' || student.rank === rankFilter
      const matchesUnit = unitFilter === 'All' || student.unit === unitFilter
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter
      return matchesQuery && matchesRank && matchesUnit && matchesStatus
    })

    next.sort((left, right) => {
      const factor = sortDirection === 'asc' ? 1 : -1
      if (sortKey === 'name') {
        return left.name.localeCompare(right.name) * factor
      }
      if (sortKey === 'rollNumber') {
        return left.rollNumber.localeCompare(right.rollNumber) * factor
      }
      return compareStudentRanks(left.rank, right.rank) * factor
    })
    return next
  }, [students, search, rankFilter, unitFilter, statusFilter, sortKey, sortDirection])

  const { page, setPage, totalItems, paginatedItems } = usePagination(filteredStudents, pageSize)

  const resetFilters = () => {
    setSearch('')
    setRankFilter('All')
    setUnitFilter('All')
    setStatusFilter('All')
    setPage(1)
  }

  const handleSort = (column: SortKey) => {
    if (sortKey === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(column)
    setSortDirection('asc')
  }

  const handleCard = (filter: StudentCardFilter) => {
    setStatusFilter((current) => (filter !== 'All' && current === filter ? 'All' : filter))
    setPage(1)
  }

  const deletion = studentToDelete ? studentDeletion(studentToDelete, exams) : 'delete'

  const handleDelete = () => {
    if (!studentToDelete) {
      return
    }
    if (deletion === 'withdraw') {
      const updated = withdrawStudent(studentToDelete.id)
      if (updated) {
        toast.success(`${updated.name} was withdrawn. Examination records were kept.`)
      } else {
        toast.error('Unable to withdraw this student.')
      }
    } else if (deletion === 'delete') {
      const removed = removeStudent(studentToDelete.id)
      if (removed) {
        toast.success(`${studentToDelete.name} (${studentToDelete.rollNumber}) deleted.`)
      } else {
        toast.error('Unable to delete this student.')
      }
    }
    setStudentToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Register students against an academic session, course, and semester, then follow the examinations they sit."
        breadcrumbs={[{ label: 'Students' }]}
        actions={
          <Button onClick={() => navigate('/students/new')}>
            <Plus className="h-4 w-4" />
            Add New Student
          </Button>
        }
      />

      {isLoading ? (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      ) : (
        <StudentSummaryCards students={students} active={statusFilter} onSelect={handleCard} />
      )}

      <div className="relative z-20 mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="student-search" className="block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              id="student-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search by name or army number"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <Select
            label="Rank"
            name="rankFilter"
            options={[{ label: 'All ranks', value: 'All' }, ...STUDENT_RANK_OPTIONS]}
            value={rankFilter}
            onChange={(event) => {
              setRankFilter(event.target.value as RankFilter)
              setPage(1)
            }}
          />
          <Select
            label="Unit"
            name="unitFilter"
            options={[{ label: 'All units', value: 'All' }, ...STUDENT_UNIT_OPTIONS]}
            value={unitFilter}
            onChange={(event) => {
              setUnitFilter(event.target.value as UnitFilter)
              setPage(1)
            }}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600" aria-live="polite">
            <span className="font-semibold text-slate-900">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{students.length}</span> students
          </p>
          <Button variant="secondary" size="sm" onClick={resetFilters} disabled={!filtersActive}>
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-4" aria-live="polite" aria-busy="true">
            <p className="text-sm text-slate-500">Loading students...</p>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : rosterError ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-base font-medium text-slate-900">Unable to load students</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{rosterError}</p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => {
                setIsLoading(true)
                setLoadAttempt((current) => current + 1)
              }}
            >
              Try again
            </Button>
          </div>
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            title="No students found"
            description={
              students.length === 0
                ? 'Get started by registering the first student.'
                : 'No students match these filters.'
            }
            action={
              students.length === 0 ? (
                <Button onClick={() => navigate('/students/new')}>
                  <Plus className="h-4 w-4" />
                  Add New Student
                </Button>
              ) : (
                <Button variant="secondary" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4" />
                  Reset Filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">ID</th>
                    <SortableHeader
                      label="Name"
                      column="name"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Army Number"
                      column="rollNumber"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Rank"
                      column="rank"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <th className="whitespace-nowrap px-4 py-3">Unit</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{student.id}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">{student.name}</span>
                          {student.status === 'Inactive' ? <Badge status="Inactive" /> : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{student.rollNumber}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StudentRankBadge rank={student.rank} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StudentUnitBadge unit={student.unit} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/students/${student.id}`}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                            aria-label={`View ${student.name}`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/students/${student.id}/edit`}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                            aria-label={`Edit ${student.name}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${student.name}`}
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
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </>
        )}
      </div>

      <StudentDeleteDialog
        student={studentToDelete}
        exams={exams}
        mode={deletion}
        open={studentToDelete !== null}
        onCancel={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
