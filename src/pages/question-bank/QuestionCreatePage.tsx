import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useCourses } from '@/context/CourseContext'
import { useQuestions } from '@/context/QuestionContext'
import { useSubjects } from '@/context/SubjectContext'
import { useTopics } from '@/context/TopicContext'
import { useToast } from '@/context/ToastContext'
import { QuestionForm } from '@/modules/question-bank/QuestionForm'
import { emptyQuestionFormValues } from '@/modules/question-bank/questionFormState'
import { suggestQuestionId } from '@/services/questionService'
import type { QuestionFormValues } from '@/types/question'

export function QuestionCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { questions, addQuestion } = useQuestions()
  const { courses } = useCourses()
  const { subjects } = useSubjects()
  const { topics } = useTopics()
  const [initialValues] = useState<QuestionFormValues>(() =>
    emptyQuestionFormValues(suggestQuestionId(questions)),
  )

  const handleSubmit = (values: QuestionFormValues, asDraft: boolean) => {
    const created = addQuestion(values, asDraft)
    toast.success(
      asDraft
        ? `Question "${created.id}" saved as draft.`
        : `Question "${created.id}" saved.`,
    )
    navigate(`/question-bank/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Question"
        description="Create a true/false, multiple-choice, or subjective question for one course topic."
        breadcrumbs={[
          { label: 'Question Bank', path: '/question-bank' },
          { label: 'Add' },
        ]}
      />
      <QuestionForm
        initialValues={initialValues}
        questions={questions}
        courses={courses}
        subjects={subjects}
        topics={topics}
        submitLabel="Save Question"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/question-bank')}
      />
    </div>
  )
}
