import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CourseContext'
import { useQuestions } from '@/context/QuestionContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import {
  DifficultyBadge,
  QuestionStatusBadge,
  QuestionTypeBadge,
} from '@/modules/question-bank/QuestionBadges'
import { QuestionContentView } from '@/modules/question-bank/QuestionContentView'
import { QuestionDeleteDialog } from '@/modules/question-bank/QuestionDeleteDialog'
import {
  DIFFICULTY_DESCRIPTIONS,
  QUESTION_TYPE_DESCRIPTIONS,
} from '@/modules/question-bank/questionLabels'
import { formatDate } from '@/utils/format'
import { previewText } from '@/utils/richText'

export function QuestionViewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getById, removeQuestion } = useQuestions()
  const { courses } = useCourses()
  const { topics } = useTopics()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const question = getById(id)
  const course = question ? courses.find((item) => item.id === question.courseId) : undefined
  const topic = question ? topics.find((item) => item.id === question.topicId) : undefined

  if (!question) {
    return (
      <div>
        <PageHeader
          title="Question Not Found"
          breadcrumbs={[
            { label: 'Question Bank', path: '/question-bank' },
            { label: 'Not Found' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p>The requested question does not exist or was deleted.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/question-bank')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Question Bank
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    const questionId = question.id
    navigate('/question-bank')
    removeQuestion(questionId)
    toast.success(`Question "${questionId}" deleted.`)
  }

  return (
    <div>
      <PageHeader
        title={question.id}
        description={previewText(question.content.questionText, 160) || 'Question details.'}
        breadcrumbs={[
          { label: 'Question Bank', path: '/question-bank' },
          { label: question.id },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/question-bank')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Question Bank
            </Button>
            <Button onClick={() => navigate(`/question-bank/${question.id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit Question
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Question Overview</h2>
          </div>
          <dl className="grid gap-6 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Question ID
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{question.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Question Status
              </dt>
              <dd className="mt-1">
                <QuestionStatusBadge status={question.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Question Type
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <QuestionTypeBadge type={question.type} />
                <span className="text-xs text-slate-500">
                  {QUESTION_TYPE_DESCRIPTIONS[question.type]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Difficulty Level
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <DifficultyBadge level={question.difficulty} />
                <span className="text-xs text-slate-500">
                  {DIFFICULTY_DESCRIPTIONS[question.difficulty]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {course ? (
                  <Link to={`/courses/${course.id}`} className="text-sky-700 hover:underline">
                    {course.name}
                  </Link>
                ) : (
                  'Unknown course'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Topic</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {topic ? (
                  <Link to={`/topics/${topic.id}`} className="text-sky-700 hover:underline">
                    {topic.name}
                  </Link>
                ) : (
                  'Unknown topic'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created Date
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(question.createdDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last Updated Date
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(question.updatedDate)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Question Content</h2>
          </div>
          <div className="p-5">
            <QuestionContentView question={question} />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-between">
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Question
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={() => navigate('/question-bank')}>
                Back to Question Bank
              </Button>
              <Button onClick={() => navigate(`/question-bank/${question.id}/edit`)}>
                <Pencil className="h-4 w-4" />
                Edit Question
              </Button>
            </div>
          </div>
        </section>
      </div>

      <QuestionDeleteDialog
        question={question}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
