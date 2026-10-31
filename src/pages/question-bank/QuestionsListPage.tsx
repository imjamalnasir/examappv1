import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Select } from '@/components/ui/Select'
import { useCourses } from '@/context/CourseContext'
import { useQuestions } from '@/context/QuestionContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { usePagination } from '@/hooks/usePagination'
import { DifficultyBadge, QuestionStatusBadge, QuestionTypeBadge } from '@/modules/question-bank/QuestionBadges'
import { QuestionDeleteDialog } from '@/modules/question-bank/QuestionDeleteDialog'
import {
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from '@/modules/question-bank/questionLabels'
import type { DifficultyLevel, Question, QuestionType } from '@/types/question'
import { formatDate } from '@/utils/format'
import { plainTextFromHtml, previewText } from '@/utils/richText'
import { getTopicsByCourse } from '@/utils/relationships'

type SortKey = 'id' | 'question' | 'course' | 'topic' | 'type' | 'difficulty' | 'createdDate'
type SortDirection = 'asc' | 'desc'
type TypeFilter = 'All' | QuestionType
type DifficultyFilter = 'All' | DifficultyLevel

const typeOrder: Record<QuestionType, number> = {
  'true-false': 0,
  mcq: 1,
  subjective: 2,
}

const difficultyOrder: Record<DifficultyLevel, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
}

function idNumber(id: string): number {
  const match = id.match(/(\d+)$/)
  return match ? Number(match[1]) : 0
}

function compareQuestions(
  left: Question,
  right: Question,
  key: SortKey,
  direction: SortDirection,
  courseName: (question: Question) => string,
  topicName: (question: Question) => string,
): number {
  const factor = direction === 'asc' ? 1 : -1
  let result = 0

  switch (key) {
    case 'id':
      result = idNumber(left.id) - idNumber(right.id)
      break
    case 'question':
      result = plainTextFromHtml(left.content.questionText).localeCompare(
        plainTextFromHtml(right.content.questionText),
      )
      break
    case 'course':
      result = courseName(left).localeCompare(courseName(right))
      break
    case 'topic':
      result = topicName(left).localeCompare(topicName(right))
      break
    case 'type':
      result = typeOrder[left.type] - typeOrder[right.type]
      break
    case 'difficulty':
      result = difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty]
      break
    case 'createdDate':
      result = left.createdDate.localeCompare(right.createdDate)
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

export function QuestionsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { questions, removeQuestion } = useQuestions()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const { topics } = useTopics()
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All')
  const [sortKey, setSortKey] = useState<SortKey>('createdDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timeout)
  }, [])

  const courseFilterOptions = useMemo(
    () => [
      { label: 'All courses', value: 'All' },
      ...courses
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((course) => ({
          label: `${course.name} (${course.code})`,
          value: course.id,
        })),
    ],
    [courses],
  )

  const topicFilterOptions = useMemo(() => {
    const source =
      courseFilter === 'All' ? topics : getTopicsByCourse(topics, subjects, courseFilter)

    return [
      { label: 'All topics', value: 'All' },
      ...source
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((topic) => {
          const subject = subjects.find((item) => item.id === topic.subjectId)
          const course = courses.find((item) => item.id === subject?.courseId)
          const suffix = courseFilter === 'All' && course ? ` (${course.code})` : ''
          return { label: `${topic.name}${suffix}`, value: topic.id }
        }),
    ]
  }, [topics, subjects, courses, courseFilter])

  const courseNameById = useMemo(() => {
    const names = new Map<string, string>()
    courses.forEach((course) => names.set(course.id, course.name))
    return names
  }, [courses])

  const topicNameById = useMemo(() => {
    const names = new Map<string, string>()
    topics.forEach((topic) => names.set(topic.id, topic.name))
    return names
  }, [topics])

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return questions
      .filter((question) => {
        const matchesCourse = courseFilter === 'All' || question.courseId === courseFilter
        const matchesTopic = topicFilter === 'All' || question.topicId === topicFilter
        const matchesType = typeFilter === 'All' || question.type === typeFilter
        const matchesDifficulty =
          difficultyFilter === 'All' || question.difficulty === difficultyFilter
        const matchesSearch =
          query.length === 0 ||
          question.id.toLowerCase().includes(query) ||
          plainTextFromHtml(question.content.questionText).toLowerCase().includes(query)

        return matchesCourse && matchesTopic && matchesType && matchesDifficulty && matchesSearch
      })
      .sort((left, right) =>
        compareQuestions(
          left,
          right,
          sortKey,
          sortDirection,
          (question) => courseNameById.get(question.courseId) ?? '',
          (question) => topicNameById.get(question.topicId) ?? '',
        ),
      )
  }, [
    questions,
    search,
    courseFilter,
    topicFilter,
    typeFilter,
    difficultyFilter,
    sortKey,
    sortDirection,
    courseNameById,
    topicNameById,
  ])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(filteredQuestions, 5)

  const filtersActive =
    search.trim().length > 0 ||
    courseFilter !== 'All' ||
    topicFilter !== 'All' ||
    typeFilter !== 'All' ||
    difficultyFilter !== 'All'

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
    setCourseFilter('All')
    setTopicFilter('All')
    setTypeFilter('All')
    setDifficultyFilter('All')
    setPage(1)
  }

  const handleDelete = () => {
    if (!questionToDelete) {
      return
    }
    const removed = removeQuestion(questionToDelete.id)
    if (removed) {
      toast.success(`Question "${questionToDelete.id}" deleted.`)
    } else {
      toast.error('Unable to delete question.')
    }
    setQuestionToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Question Bank"
        description="Manage and organize questions by course, topic, question type, and difficulty."
        breadcrumbs={[{ label: 'Question Bank' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/question-bank/import')}>
              <Upload className="h-4 w-4" />
              Import Questions
            </Button>
            <Button onClick={() => navigate('/question-bank/new')}>
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </>
        }
      />

      <div className="relative z-20 mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="question-search" className="block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              id="question-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search by question text or question ID"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <div className="xl:col-span-2">
            <SearchableSelect
              label="Course"
              name="courseFilter"
              options={courseFilterOptions}
              value={courseFilter}
              placeholder="All courses"
              onChange={(value) => {
                setCourseFilter(value)
                setTopicFilter('All')
                setPage(1)
              }}
            />
          </div>
          <div className="xl:col-span-2">
            <SearchableSelect
              label="Topic"
              name="topicFilter"
              options={topicFilterOptions}
              value={topicFilter}
              placeholder="All topics"
              emptyMessage="No topics for this course."
              onChange={(value) => {
                setTopicFilter(value)
                setPage(1)
              }}
            />
          </div>
          <div className="xl:col-span-3">
            <Select
              label="Question Type"
              name="typeFilter"
              options={[{ label: 'All types', value: 'All' }, ...QUESTION_TYPE_OPTIONS]}
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as TypeFilter)
                setPage(1)
              }}
            />
          </div>
          <div className="xl:col-span-3">
            <Select
              label="Difficulty Level"
              name="difficultyFilter"
              options={[{ label: 'All levels', value: 'All' }, ...DIFFICULTY_OPTIONS]}
              value={difficultyFilter}
              onChange={(event) => {
                setDifficultyFilter(event.target.value as DifficultyFilter)
                setPage(1)
              }}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600" aria-live="polite">
            {filtersActive ? (
              <>
                <span className="font-semibold text-slate-900">{filteredQuestions.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{questions.length}</span> total
                questions
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-900">{questions.length}</span> total
                questions
              </>
            )}
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
            <p className="text-sm text-slate-500">Loading questions...</p>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            title="No questions found"
            description={
              questions.length === 0
                ? 'Get started by adding your first question.'
                : 'No questions match these filters.'
            }
            action={
              questions.length === 0 ? (
                <Button onClick={() => navigate('/question-bank/new')}>
                  <Plus className="h-4 w-4" />
                  Add Question
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
                    <SortableHeader
                      label="Question ID"
                      column="id"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Question"
                      column="question"
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
                      label="Topic"
                      column="topic"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Question Type"
                      column="type"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Difficulty Level"
                      column="difficulty"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="Created Date"
                      column="createdDate"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <th className="whitespace-nowrap px-4 py-3 text-right uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((question) => {
                    const preview = previewText(question.content.questionText, 110)
                    return (
                      <tr key={question.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {question.id}
                        </td>
                        <td className="min-w-64 max-w-sm px-4 py-3">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="line-clamp-2 text-slate-800" title={preview}>
                              {preview || '—'}
                            </span>
                            {question.status === 'Draft' ? (
                              <QuestionStatusBadge status="Draft" />
                            ) : null}
                          </div>
                        </td>
                        <td className="min-w-44 max-w-xs px-4 py-3 text-slate-600">
                          {courseNameById.get(question.courseId) ?? 'Unknown'}
                        </td>
                        <td className="min-w-40 px-4 py-3 text-slate-600">
                          {topicNameById.get(question.topicId) ?? 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <QuestionTypeBadge type={question.type} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <DifficultyBadge level={question.difficulty} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDate(question.createdDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/question-bank/${question.id}`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`View question ${question.id}`}
                              title="View Question"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/question-bank/${question.id}/edit`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`Edit question ${question.id}`}
                              title="Edit Question"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setQuestionToDelete(question)}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete question ${question.id}`}
                              title="Delete Question"
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

      <QuestionDeleteDialog
        question={questionToDelete}
        open={Boolean(questionToDelete)}
        onCancel={() => setQuestionToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
