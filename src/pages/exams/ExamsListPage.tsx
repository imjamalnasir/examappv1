import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, ListChecks, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DraftBadge } from '@/components/ui/AcademicStatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Select } from '@/components/ui/Select'
import { useAcademics } from '@/context/AcademicContext'
import { useCourses } from '@/context/CourseContext'
import { useExams } from '@/context/ExamContext'
import { useToast } from '@/context/ToastContext'
import { usePagination } from '@/hooks/usePagination'
import { ExamDeleteDialog } from '@/modules/exams/ExamDeleteDialog'
import { ExamRoleBar } from '@/modules/exams/ExamRoleBar'
import { ExamStatusBadge, ExamTypeBadge } from '@/modules/exams/ExamStatusBadge'
import { ExamSummaryCards, type ExamCardFilter } from '@/modules/exams/ExamSummaryCards'
import { EXAM_STATUS_OPTIONS, EXAM_TYPE_OPTIONS, STATUS_SORT_ORDER } from '@/modules/exams/examLabels'
import { canCreateExam, canEditExamInfo, deleteAccess } from '@/modules/exams/examRules'
import type { Exam, ExamType } from '@/types/exam'
import { formatDate } from '@/utils/format'

type SortKey = 'id' | 'name' | 'type' | 'semester' | 'date' | 'marks' | 'status'
type SortDirection = 'asc' | 'desc'
type StatusFilter = ExamCardFilter
type TypeFilter = 'All' | ExamType

function idNumber(id: string): number {
  const match = id.match(/(\d+)$/)
  return match ? Number(match[1]) : 0
}

function compareExams(
  left: Exam,
  right: Exam,
  key: SortKey,
  direction: SortDirection,
  semesterName: (exam: Exam) => string,
): number {
  const factor = direction === 'asc' ? 1 : -1
  let result = 0

  switch (key) {
    case 'id':
      result = idNumber(left.id) - idNumber(right.id)
      break
    case 'name':
      result = left.name.localeCompare(right.name)
      break
    case 'type':
      result = left.examType.localeCompare(right.examType)
      break
    case 'semester':
      result = semesterName(left).localeCompare(semesterName(right))
      break
    case 'date':
      result = left.examDate.localeCompare(right.examDate)
      break
    case 'marks':
      result = left.totalMarks - right.totalMarks
      break
    case 'status':
      result = STATUS_SORT_ORDER[left.status] - STATUS_SORT_ORDER[right.status]
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
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 uppercase tracking-wide">
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-sky-700' : 'text-slate-400'}`} />
      </button>
    </th>
  )
}

export function ExamsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { exams, role, removeExam } = useExams()
  const { academics } = useAcademics()
  const { courses } = useCourses()
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [academicFilter, setAcademicFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('All')
  const [semesterFilter, setSemesterFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [pageSize, setPageSize] = useState(5)
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timeout)
  }, [])

  const academicOptions = useMemo(
    () => [
      { label: 'All academics', value: 'All' },
      ...academics
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((academic) => ({ label: academic.name, value: academic.id })),
    ],
    [academics],
  )

  const courseOptions = useMemo(
    () => [
      { label: 'All courses', value: 'All' },
      ...courses
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((course) => ({ label: `${course.name} (${course.code})`, value: course.id })),
    ],
    [courses],
  )

  const semesterOptions = useMemo(() => {
    const source = academics.filter((academic) => {
      const matchesAcademic = academicFilter === 'All' || academic.id === academicFilter
      const matchesCourse = courseFilter === 'All' || academic.courseId === courseFilter
      return matchesAcademic && matchesCourse
    })
    const options = source.flatMap((academic) =>
      academic.semesters.map((semester) => ({
        label: `${semester.name} · ${academic.name}`,
        value: semester.id,
      })),
    )
    options.sort((left, right) => left.label.localeCompare(right.label))
    return [{ label: 'All semesters', value: 'All' }, ...options]
  }, [academicFilter, academics, courseFilter])

  const semesterName = (exam: Exam) => {
    const academic = academics.find((item) => item.id === exam.academicId)
    return academic?.semesters.find((semester) => semester.id === exam.semesterId)?.name ?? ''
  }

  const activeSemester =
    semesterFilter !== 'All' && semesterOptions.some((option) => option.value === semesterFilter)
      ? semesterFilter
      : 'All'

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase()
    const nameOf = (exam: Exam) => {
      const academic = academics.find((item) => item.id === exam.academicId)
      return academic?.semesters.find((semester) => semester.id === exam.semesterId)?.name ?? ''
    }
    return exams
      .filter((exam) => {
        const matchesSearch =
          query.length === 0 || exam.name.toLowerCase().includes(query) || exam.id.toLowerCase().includes(query)
        const matchesAcademic = academicFilter === 'All' || exam.academicId === academicFilter
        const matchesCourse = courseFilter === 'All' || exam.courseId === courseFilter
        const matchesSemester = activeSemester === 'All' || exam.semesterId === activeSemester
        const matchesType = typeFilter === 'All' || exam.examType === typeFilter
        const matchesDate = !dateFilter || exam.examDate === dateFilter
        const matchesStatus = statusFilter === 'All' || exam.status === statusFilter
        return matchesSearch && matchesAcademic && matchesCourse && matchesSemester && matchesType && matchesDate && matchesStatus
      })
      .sort((left, right) => compareExams(left, right, sortKey, sortDirection, nameOf))
  }, [
    academicFilter,
    academics,
    activeSemester,
    courseFilter,
    dateFilter,
    exams,
    search,
    sortDirection,
    sortKey,
    statusFilter,
    typeFilter,
  ])

  const { page, setPage, totalItems, paginatedItems } = usePagination(filteredExams, pageSize)
  const filtersActive =
    search.trim().length > 0 ||
    academicFilter !== 'All' ||
    courseFilter !== 'All' ||
    activeSemester !== 'All' ||
    typeFilter !== 'All' ||
    dateFilter !== '' ||
    statusFilter !== 'All'

  const toggleSort = (column: SortKey) => {
    setPage(1)
    if (sortKey === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(column)
    setSortDirection('asc')
  }

  const resetFilters = () => {
    setSearch('')
    setAcademicFilter('All')
    setCourseFilter('All')
    setSemesterFilter('All')
    setTypeFilter('All')
    setDateFilter('')
    setStatusFilter('All')
    setPage(1)
  }

  const handleCard = (filter: ExamCardFilter) => {
    setStatusFilter((current) => (filter !== 'All' && current === filter ? 'All' : filter))
    setPage(1)
  }

  const handleDelete = (authorized: boolean) => {
    if (!examToDelete) {
      return
    }
    const result = removeExam(examToDelete.id, authorized)
    if (result.ok) {
      toast.success(`Exam "${examToDelete.name}" deleted.`)
    } else {
      toast.error(result.message)
    }
    setExamToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Exams"
        description="Create papers, select questions from the question bank, and move each exam through approval."
        breadcrumbs={[{ label: 'Exams' }]}
        actions={
          canCreateExam(role) ? (
            <Button onClick={() => navigate('/exams/new')}>
              <Plus className="h-4 w-4" />
              Add Exam
            </Button>
          ) : null
        }
      />
      <ExamRoleBar />
      {isLoading ? (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      ) : (
        <ExamSummaryCards exams={exams} active={statusFilter} onSelect={handleCard} />
      )}

      <div className="relative z-20 mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="exam-search" className="block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              id="exam-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search by exam name or ID"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <SearchableSelect
            label="Academic"
            name="academicFilter"
            options={academicOptions}
            value={academicFilter}
            onChange={(value) => {
              const academic = academics.find((item) => item.id === value)
              setAcademicFilter(value)
              setCourseFilter(academic?.courseId ?? 'All')
              setSemesterFilter('All')
              setPage(1)
            }}
          />
          <SearchableSelect
            label="Course"
            name="courseFilter"
            options={courseOptions}
            value={courseFilter}
            onChange={(value) => {
              setCourseFilter(value)
              if (value !== 'All') {
                const academic = academics.find((item) => item.id === academicFilter)
                if (academic && academic.courseId !== value) {
                  setAcademicFilter('All')
                }
              }
              setSemesterFilter('All')
              setPage(1)
            }}
          />
          <SearchableSelect
            label="Semester"
            name="semesterFilter"
            options={semesterOptions}
            value={activeSemester}
            onChange={(value) => {
              setSemesterFilter(value)
              setPage(1)
            }}
          />
          <Select
            label="Exam Type"
            name="typeFilter"
            options={[{ label: 'All types', value: 'All' }, ...EXAM_TYPE_OPTIONS]}
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as TypeFilter)
              setPage(1)
            }}
          />
          <div className="space-y-1.5">
            <label htmlFor="exam-date" className="block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              id="exam-date"
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value)
                setPage(1)
              }}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <Select
            label="Status"
            name="statusFilter"
            options={[{ label: 'All statuses', value: 'All' }, ...EXAM_STATUS_OPTIONS]}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter)
              setPage(1)
            }}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600" aria-live="polite">
            <span className="font-semibold text-slate-900">{filteredExams.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{exams.length}</span> exams
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
            <p className="text-sm text-slate-500">Loading exams...</p>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            title="No exams found"
            description={
              exams.length === 0 ? 'Get started by adding the first examination.' : 'No exams match these filters.'
            }
            action={
              exams.length === 0 && canCreateExam(role) ? (
                <Button onClick={() => navigate('/exams/new')}>
                  <Plus className="h-4 w-4" />
                  Add Exam
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
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <SortableHeader label="ID" column="id" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Exam" column="name" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Type" column="type" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Semester" column="semester" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Date" column="date" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Marks" column="marks" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <SortableHeader label="Status" column="status" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
                    <th className="whitespace-nowrap px-4 py-3 text-right uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((exam) => {
                    const editable = canEditExamInfo(exam, role)
                    const removal = deleteAccess(exam, role)
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{exam.id}</td>
                        <td className="min-w-56 px-4 py-3">
                          <p className="font-medium text-slate-900">{exam.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {courses.find((course) => course.id === exam.courseId)?.code ?? exam.courseId}
                            {' · '}
                            {academics.find((academic) => academic.id === exam.academicId)?.name ?? 'Unknown academic'}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <ExamTypeBadge type={exam.examType} />
                        </td>
                        <td className="min-w-32 px-4 py-3 text-slate-600">{semesterName(exam) || 'Unknown'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(exam.examDate)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{exam.totalMarks}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <ExamStatusBadge status={exam.status} />
                            {exam.isDraft ? <DraftBadge /> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/exams/${exam.id}`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`View ${exam.name}`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {editable ? (
                              <Link
                                to={`/exams/${exam.id}/edit`}
                                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                                aria-label={`Edit ${exam.name}`}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-md p-2 text-slate-300"
                                title="Exam details can be edited while the exam is Initiated, rejected, returned, or in revision."
                                aria-label={`Edit ${exam.name} is unavailable`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            <Link
                              to={`/exams/${exam.id}/questions`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`Questions for ${exam.name}`}
                              title="Questions"
                            >
                              <ListChecks className="h-4 w-4" />
                            </Link>
                            {removal !== 'no' ? (
                              <button
                                type="button"
                                onClick={() => setExamToDelete(exam)}
                                className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label={`Delete ${exam.name}`}
                                title={removal === 'authorized' ? 'Delete approved exam' : 'Delete'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
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
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </>
        )}
      </div>

      <ExamDeleteDialog
        exam={examToDelete}
        open={Boolean(examToDelete)}
        needsAuthorization={examToDelete ? deleteAccess(examToDelete, role) === 'authorized' : false}
        onCancel={() => setExamToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
