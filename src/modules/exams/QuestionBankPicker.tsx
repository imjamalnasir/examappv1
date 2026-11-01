import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { usePagination } from '@/hooks/usePagination'
import { DifficultyBadge, QuestionStatusBadge, QuestionTypeBadge } from '@/modules/question-bank/QuestionBadges'
import { DIFFICULTY_OPTIONS } from '@/modules/question-bank/questionLabels'
import { ClassificationBadge } from '@/modules/exams/ExamStatusBadge'
import { bankMarks, questionCategory, type ExamQuestionCategory } from '@/modules/exams/examRules'
import type { QuestionClassification } from '@/types/exam'
import type { DifficultyLevel, Question } from '@/types/question'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'
import { previewText } from '@/utils/richText'

type CategoryFilter = 'All' | ExamQuestionCategory
type DifficultyFilter = 'All' | DifficultyLevel

export function QuestionBankPicker({
  questions,
  topics,
  subjects,
  selected,
  replacingId,
  onAdd,
  onReplace,
}: {
  questions: Question[]
  topics: Topic[]
  subjects: Subject[]
  selected: { questionId: string; classification: QuestionClassification }[]
  replacingId: string | null
  onAdd: (questionId: string, classification: QuestionClassification) => void
  onReplace: (questionId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState('All')
  const [topicId, setTopicId] = useState('All')
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All')
  const [marks, setMarks] = useState('All')

  const selectedById = useMemo(() => {
    const map = new Map<string, QuestionClassification>()
    selected.forEach((item) => map.set(item.questionId, item.classification))
    return map
  }, [selected])

  const subjectOptions = useMemo(() => {
    const ids = new Set(
      questions
        .map((question) => topics.find((topic) => topic.id === question.topicId)?.subjectId)
        .filter((id): id is string => Boolean(id)),
    )
    return [
      { label: 'All subjects', value: 'All' },
      ...subjects
        .filter((subject) => ids.has(subject.id))
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((subject) => ({ label: `${subject.name} (${subject.code})`, value: subject.id })),
    ]
  }, [questions, subjects, topics])

  const topicOptions = useMemo(() => {
    const source = topics.filter((topic) => {
      const used = questions.some((question) => question.topicId === topic.id)
      if (!used) {
        return false
      }
      return subjectId === 'All' || topic.subjectId === subjectId
    })
    return [
      { label: 'All topics', value: 'All' },
      ...source
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((topic) => ({ label: topic.name, value: topic.id })),
    ]
  }, [questions, subjectId, topics])

  const markOptions = useMemo(() => {
    const values = Array.from(new Set(questions.map((question) => bankMarks(question)))).sort((left, right) => left - right)
    return [{ label: 'All marks', value: 'All' }, ...values.map((value) => ({ label: String(value), value: String(value) }))]
  }, [questions])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return questions.filter((question) => {
      const topic = topics.find((item) => item.id === question.topicId)
      const matchesSubject = subjectId === 'All' || topic?.subjectId === subjectId
      const matchesTopic = topicId === 'All' || question.topicId === topicId
      const matchesCategory = category === 'All' || questionCategory(question) === category
      const matchesDifficulty = difficulty === 'All' || question.difficulty === difficulty
      const matchesMarks = marks === 'All' || String(bankMarks(question)) === marks
      const text = previewText(question.content.questionText, 400).toLowerCase()
      const matchesSearch = query.length === 0 || question.id.toLowerCase().includes(query) || text.includes(query)
      return matchesSubject && matchesTopic && matchesCategory && matchesDifficulty && matchesMarks && matchesSearch
    })
  }, [category, difficulty, marks, questions, search, subjectId, topicId, topics])

  const { page, pageSize, setPage, totalItems, paginatedItems } = usePagination(filtered, 5)
  const filtersActive =
    search.trim().length > 0 || subjectId !== 'All' || topicId !== 'All' || category !== 'All' || difficulty !== 'All' || marks !== 'All'

  const reset = () => {
    setSearch('')
    setSubjectId('All')
    setTopicId('All')
    setCategory('All')
    setDifficulty('All')
    setMarks('All')
    setPage(1)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Question Bank</h2>
            <p className="mt-1 text-sm text-slate-500">
              Questions from the subjects allocated to this semester. Objective covers true/false and MCQ items.
            </p>
          </div>
          <Link to="/question-bank" className="text-sm font-medium text-sky-800 hover:text-sky-950">
            Open question bank
          </Link>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
            <label htmlFor="exam-question-search" className="block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              id="exam-question-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search by question text or ID"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <Select
            label="Subject"
            name="subjectFilter"
            options={subjectOptions}
            value={subjectId}
            onChange={(event) => {
              setSubjectId(event.target.value)
              setTopicId('All')
              setPage(1)
            }}
          />
          <Select
            label="Topic"
            name="topicFilter"
            options={topicOptions}
            value={topicId}
            onChange={(event) => {
              setTopicId(event.target.value)
              setPage(1)
            }}
          />
          <Select
            label="Question Type"
            name="categoryFilter"
            options={[
              { label: 'All types', value: 'All' },
              { label: 'Subjective', value: 'Subjective' },
              { label: 'Objective', value: 'Objective' },
            ]}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as CategoryFilter)
              setPage(1)
            }}
          />
          <Select
            label="Difficulty Level"
            name="difficultyFilter"
            options={[{ label: 'All levels', value: 'All' }, ...DIFFICULTY_OPTIONS]}
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value as DifficultyFilter)
              setPage(1)
            }}
          />
          <Select
            label="Marks"
            name="marksFilter"
            options={markOptions}
            value={marks}
            onChange={(event) => {
              setMarks(event.target.value)
              setPage(1)
            }}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={reset} disabled={!filtersActive}>
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>

        {paginatedItems.length === 0 ? (
          <EmptyState
            title="No questions found"
            description={
              questions.length === 0
                ? 'No question-bank items belong to the subjects on this semester.'
                : 'No questions match these filters.'
            }
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                  Reset Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Question</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((question) => {
                    const topic = topics.find((item) => item.id === question.topicId)
                    const subject = subjects.find((item) => item.id === topic?.subjectId)
                    const classification = selectedById.get(question.id)
                    const preview = previewText(question.content.questionText, 120)
                    return (
                      <tr key={question.id} className="align-top">
                        <td className="min-w-64 max-w-sm px-4 py-3">
                          <p className="font-medium text-slate-900">{question.id}</p>
                          <p className="mt-1 text-slate-600">{preview}</p>
                          {question.status === 'Draft' ? (
                            <div className="mt-1">
                              <QuestionStatusBadge status="Draft" />
                            </div>
                          ) : null}
                        </td>
                        <td className="min-w-36 px-4 py-3 text-slate-600">{subject?.name ?? 'Unknown'}</td>
                        <td className="min-w-36 px-4 py-3 text-slate-600">{topic?.name ?? 'Unknown'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <QuestionTypeBadge type={question.type} />
                            <span className="text-xs text-slate-500">{questionCategory(question)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <DifficultyBadge level={question.difficulty} />
                        </td>
                        <td className="px-4 py-3 text-slate-700">{bankMarks(question)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            {replacingId ? (
                              question.id === replacingId ? (
                                <span className="text-xs font-medium text-slate-500">Replacing this question</span>
                              ) : classification ? (
                                <span className="text-xs text-slate-500">Already on the paper</span>
                              ) : (
                                <Button size="sm" onClick={() => onReplace(question.id)}>
                                  Use this question
                                </Button>
                              )
                            ) : classification ? (
                              <ClassificationBadge classification={classification} />
                            ) : (
                              <>
                                <Button size="sm" onClick={() => onAdd(question.id, 'Final')}>
                                  Add Final
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => onAdd(question.id, 'Draft')}>
                                  Add Draft
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={setPage} />
          </div>
        )}
      </div>
    </section>
  )
}
