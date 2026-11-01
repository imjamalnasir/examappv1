import { Link } from 'react-router-dom'
import { ArrowLeftRight, Trash2 } from 'lucide-react'
import { DifficultyBadge, QuestionTypeBadge } from '@/modules/question-bank/QuestionBadges'
import { bankMarks, resolveExamQuestionMeta } from '@/modules/exams/examRules'
import type { ExamQuestionSelection, QuestionClassification } from '@/types/exam'
import type { Question } from '@/types/question'
import type { Subject } from '@/types/subject'
import type { Topic } from '@/types/topic'
import { previewText } from '@/utils/richText'

export function SelectedQuestionEditor({
  selected,
  questions,
  topics,
  subjects,
  replacingId,
  onChange,
  onStartReplace,
  onCancelReplace,
}: {
  selected: ExamQuestionSelection[]
  questions: Question[]
  topics: Topic[]
  subjects: Subject[]
  replacingId: string | null
  onChange: (next: ExamQuestionSelection[]) => void
  onStartReplace: (questionId: string) => void
  onCancelReplace: () => void
}) {
  const update = (questionId: string, patch: Partial<ExamQuestionSelection>) => {
    onChange(selected.map((item) => (item.questionId === questionId ? { ...item, ...patch } : item)))
  }

  const total = selected.reduce((sum, item) => sum + (Number.isFinite(item.marks) ? item.marks : 0), 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Selected Questions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Final questions are the paper. Draft questions are tracked as a separate reserve. A question can be added only once.
        </p>
      </div>
      {selected.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">
          No questions on this paper yet. Add final and draft questions from the bank above.
        </p>
      ) : (
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
                <th className="px-4 py-3">Final / Draft</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selected.map((item) => {
                const meta = resolveExamQuestionMeta(item.questionId, questions, topics, subjects)
                const preview = meta.question ? previewText(meta.question.content.questionText, 100) : ''
                const replacing = replacingId === item.questionId
                return (
                  <tr key={item.questionId} className={replacing ? 'bg-amber-50' : undefined}>
                    <td className="min-w-56 px-4 py-3">
                      <p className="font-medium text-slate-900">{item.questionId}</p>
                      {meta.question ? (
                        <Link to={`/question-bank/${item.questionId}`} className="mt-1 block text-slate-600 hover:text-sky-800">
                          {preview}
                        </Link>
                      ) : (
                        <p className="mt-1 text-rose-700">Missing from the question bank.</p>
                      )}
                    </td>
                    <td className="min-w-36 px-4 py-3 text-slate-600">{meta.subjectName}</td>
                    <td className="min-w-36 px-4 py-3 text-slate-600">{meta.topicName}</td>
                    <td className="px-4 py-3">
                      {meta.question ? <QuestionTypeBadge type={meta.question.type} /> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {meta.question ? <DifficultyBadge level={meta.question.difficulty} /> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        aria-label={`Marks for ${item.questionId}`}
                        value={item.marks}
                        title={meta.question ? `Question bank default is ${bankMarks(meta.question)}` : undefined}
                        onChange={(event) => {
                          const next = Number(event.target.value)
                          update(item.questionId, { marks: Number.isFinite(next) ? next : 0 })
                        }}
                        className="h-9 w-20 rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`class-${item.questionId}`}>
                        Classification for {item.questionId}
                      </label>
                      <select
                        id={`class-${item.questionId}`}
                        value={item.classification}
                        onChange={(event) =>
                          update(item.questionId, { classification: event.target.value as QuestionClassification })
                        }
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                      >
                        <option value="Final">Final</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {replacing ? (
                          <button
                            type="button"
                            onClick={onCancelReplace}
                            className="rounded-md px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                          >
                            Cancel replace
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onStartReplace(item.questionId)}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
                            aria-label={`Replace ${item.questionId}`}
                            title="Replace"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (replacing) {
                              onCancelReplace()
                            }
                            onChange(selected.filter((entry) => entry.questionId !== item.questionId))
                          }}
                          className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${item.questionId}`}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50">
                <td colSpan={5} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selected marks
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{total}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
