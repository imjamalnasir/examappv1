import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CourseContext'
import { useQuestions } from '@/context/QuestionContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { QuestionForm } from '@/modules/question-bank/QuestionForm'
import { questionToFormValues } from '@/modules/question-bank/questionFormState'
import type { QuestionFormValues } from '@/types/question'

export function QuestionEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { questions, getById, editQuestion } = useQuestions()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const { topics } = useTopics()
  const question = getById(id)

  if (!question) {
    return (
      <div>
        <PageHeader
          title="Question Not Found"
          breadcrumbs={[
            { label: 'Question Bank', path: '/question-bank' },
            { label: 'Edit' },
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

  const handleSubmit = (values: QuestionFormValues, asDraft: boolean) => {
    const updated = editQuestion(question.id, values, asDraft)
    if (!updated) {
      toast.error('Unable to update question.')
      return
    }
    toast.success(
      asDraft
        ? `Question "${updated.id}" saved as draft.`
        : `Question "${updated.id}" updated.`,
    )
    navigate(`/question-bank/${updated.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${question.id}`}
        description="Update the question, then save it as a draft or publish it."
        breadcrumbs={[
          { label: 'Question Bank', path: '/question-bank' },
          { label: question.id, path: `/question-bank/${question.id}` },
          { label: 'Edit' },
        ]}
      />
      <QuestionForm
        key={question.id}
        initialValues={questionToFormValues(question)}
        questions={questions}
        courses={courses}
        subjects={subjects}
        topics={topics}
        excludeId={question.id}
        submitLabel="Save Question"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/question-bank/${question.id}`)}
      />
    </div>
  )
}
