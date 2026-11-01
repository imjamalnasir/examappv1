import { EXAM_ROLES, type ExamRole } from '@/types/exam'
import { ROLE_SUMMARIES } from '@/modules/exams/examLabels'
import { useExams } from '@/context/ExamContext'

export function ExamRoleBar() {
  const { role, setRole, actorName, actorTitle } = useExams()

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">
          Acting as {actorName}
          <span className="font-normal text-slate-500"> · {actorTitle}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">{ROLE_SUMMARIES[role]}</p>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <span className="font-medium">Role</span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as ExamRole)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
          aria-label="Current exam role"
        >
          {EXAM_ROLES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
