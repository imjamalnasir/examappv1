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
import { sortTopicsByDisplayOrder } from '@/services/topicService'
import type { EntityStatus } from '@/types/common'
import type { Topic } from '@/types/topic'
import {
  getCoursesByDepartment,
  getSubjectsByCourse,
  getSubjectsByDepartment,
  resolveTopicHierarchy,
} from '@/utils/relationships'

export function TopicsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { topics, removeTopic } = useTopics()
  const { subjects } = useSubjects()
  const { courses } = useCourses()
  const { departments } = useDepartments()

  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('All')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | EntityStatus>('All')
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null)

  const courseFilterOptions = useMemo(() => {
    if (departmentFilter === 'All') {
      return courses
    }
    return getCoursesByDepartment(courses, departmentFilter)
  }, [courses, departmentFilter])

  const subjectFilterOptions = useMemo(() => {
    if (courseFilter !== 'All') {
      return getSubjectsByCourse(subjects, courseFilter)
    }
    if (departmentFilter !== 'All') {
      return getSubjectsByDepartment(subjects, courses, departmentFilter)
    }
    return subjects
  }, [subjects, courses, departmentFilter, courseFilter])

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = topics.filter((topic) => {
      const hierarchy = resolveTopicHierarchy(topic, subjects, courses, departments)
      const matchesDepartment =
        departmentFilter === 'All' || hierarchy.department?.id === departmentFilter
      const matchesCourse = courseFilter === 'All' || hierarchy.course?.id === courseFilter
      const matchesSubject = subjectFilter === 'All' || topic.subjectId === subjectFilter
      const matchesStatus = statusFilter === 'All' || topic.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        topic.name.toLowerCase().includes(query) ||
        topic.id.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        (hierarchy.subject?.name.toLowerCase().includes(query) ?? false) ||
        (hierarchy.subject?.code.toLowerCase().includes(query) ?? false) ||
        (hierarchy.course?.name.toLowerCase().includes(query) ?? false) ||
        (hierarchy.department?.name.toLowerCase().includes(query) ?? false)

      return (
        matchesDepartment &&
        matchesCourse &&
        matchesSubject &&
        matchesStatus &&
        matchesSearch
      )
    })

    return sortTopicsByDisplayOrder(filtered)
  }, [
    topics,
    search,
    departmentFilter,
    courseFilter,
    subjectFilter,
    statusFilter,
    subjects,
    courses,
    departments,
  ])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(
    filteredTopics,
    5,
  )

  const handleDelete = () => {
    if (!topicToDelete) {
      return
    }

    const removed = removeTopic(topicToDelete.id)
    if (removed) {
      toast.success(`Topic "${topicToDelete.name}" deleted.`)
    } else {
      toast.error('Unable to delete topic.')
    }
    setTopicToDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Topics"
        description="Manage topics linked through wing, course, and subject hierarchy."
        breadcrumbs={[{ label: 'Topics' }]}
        actions={
          <Button onClick={() => navigate('/topics/new')}>
            <Plus className="h-4 w-4" />
            Add New Topic
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by topic, subject, course, or wing..."
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:max-w-sm"
          />
          <select
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value)
              setCourseFilter('All')
              setSubjectFilter('All')
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-48"
          >
            <option value="All">All Wings</option>
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
              setSubjectFilter('All')
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-56"
          >
            <option value="All">All Courses</option>
            {courseFilterOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(event) => {
              setSubjectFilter(event.target.value)
              setPage(1)
            }}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 xl:w-52"
          >
            <option value="All">All Subjects</option>
            {subjectFilterOptions.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
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
            title="No topics found"
            description={
              topics.length === 0
                ? 'Get started by adding your first topic.'
                : 'Try adjusting your search or filters.'
            }
            action={
              topics.length === 0 ? (
                <Button onClick={() => navigate('/topics/new')}>
                  <Plus className="h-4 w-4" />
                  Add New Topic
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
                    <th className="px-4 py-3">Topic ID</th>
                    <th className="px-4 py-3">Topic Name</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Display Order</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((topic) => {
                    const hierarchy = resolveTopicHierarchy(
                      topic,
                      subjects,
                      courses,
                      departments,
                    )
                    return (
                      <tr key={topic.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {topic.id}
                        </td>
                        <td className="min-w-44 px-4 py-3 text-slate-800">{topic.name}</td>
                        <td className="min-w-40 px-4 py-3 text-slate-600">
                          {hierarchy.subject?.name ?? 'Unknown'}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                          {topic.description || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {topic.displayOrder}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge status={topic.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/topics/${topic.id}`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`View ${topic.name}`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/topics/${topic.id}/edit`}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                              aria-label={`Edit ${topic.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setTopicToDelete(topic)}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${topic.name}`}
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
        open={Boolean(topicToDelete)}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topicToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setTopicToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
