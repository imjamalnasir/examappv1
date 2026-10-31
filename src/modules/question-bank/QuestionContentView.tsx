import { Check } from 'lucide-react'
import type { McqContent, Question, SubjectiveContent, TrueFalseContent } from '@/types/question'
import { sanitizeQuestionHtml } from '@/utils/richText'

function QuestionHtml({ html }: { html: string }) {
  return (
    <div
      className="text-sm leading-6 text-slate-800 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: sanitizeQuestionHtml(html) }}
    />
  )
}

function ExplanationBlock({ explanation }: { explanation: string }) {
  if (!explanation.trim()) {
    return null
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Explanation</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{explanation}</p>
    </div>
  )
}

function TrueFalseView({ content }: { content: TrueFalseContent }) {
  const answers = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' },
  ] as const

  return (
    <div className="space-y-4">
      <QuestionHtml html={content.questionText} />
      <div className="grid gap-3 sm:grid-cols-2">
        {answers.map((answer) => {
          const correct = content.correctAnswer === answer.value
          return (
            <div
              key={answer.value}
              className={`rounded-md border px-4 py-3 ${
                correct ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
              }`}
            >
              <p className={`text-sm font-medium ${correct ? 'text-emerald-900' : 'text-slate-700'}`}>
                {answer.label}
              </p>
              {correct ? (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Correct answer
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
      <ExplanationBlock explanation={content.explanation} />
    </div>
  )
}

function McqView({ content }: { content: McqContent }) {
  const multiple = content.answerMode === 'multiple'

  return (
    <div className="space-y-4">
      <QuestionHtml html={content.questionText} />
      <p
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          multiple ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-800'
        }`}
      >
        {multiple ? 'Multiple correct answers' : 'Single correct answer'}
      </p>
      <ul className="space-y-2">
        {content.options.map((option) => (
          <li
            key={option.id}
            className={`flex items-start gap-3 rounded-md border px-3 py-3 ${
              option.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
            }`}
          >
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                option.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {option.label}
            </span>
            <span className="flex-1 pt-1 text-sm text-slate-800">{option.text}</span>
            {option.isCorrect ? (
              <span className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                Correct
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <ExplanationBlock explanation={content.explanation} />
    </div>
  )
}

function formatMarks(marks: number): string {
  return `${marks} ${marks === 1 ? 'mark' : 'marks'}`
}

function SubjectiveView({ content }: { content: SubjectiveContent }) {
  return (
    <div className="space-y-4">
      <QuestionHtml html={content.questionText} />
      {content.marks !== null ? (
        <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {formatMarks(content.marks)}
        </p>
      ) : null}
      {content.modelAnswer.trim() ? (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Expected Answer / Model Answer
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {content.modelAnswer}
          </p>
        </div>
      ) : null}
      {content.guidelines.trim() ? (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Answer Guidelines
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {content.guidelines}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function QuestionContentView({ question }: { question: Question }) {
  if (question.type === 'true-false') {
    return <TrueFalseView content={question.content} />
  }
  if (question.type === 'mcq') {
    return <McqView content={question.content} />
  }
  return <SubjectiveView content={question.content} />
}
