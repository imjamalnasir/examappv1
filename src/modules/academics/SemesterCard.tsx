import { useState } from 'react'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatDateRange } from '@/modules/academics/academicLookups'
import { SubjectAllocationEditor } from '@/modules/academics/SubjectAllocationEditor'
import type { SemesterFormErrors, SemesterFormValue } from '@/types/academic'
import type { Subject } from '@/types/subject'

interface SemesterCardProps {
  semester: SemesterFormValue
  errors?: SemesterFormErrors
  subjects: Subject[]
  courseId: string
  onChange: (semester: SemesterFormValue) => void
  onRemove: () => void
}

export function SemesterCard({
  semester,
  errors,
  subjects,
  courseId,
  onChange,
  onRemove,
}: SemesterCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const title = semester.name.trim() || 'Untitled semester'
  const subjectCount = semester.subjectIds.length
  const nameInputId = `semester-name-${semester.clientId}`

  const toggle = () => {
    onChange({ ...semester, expanded: !semester.expanded })
  }

  const edit = () => {
    onChange({ ...semester, expanded: true })
    window.setTimeout(() => {
      document.getElementById(nameInputId)?.focus()
    }, 0)
  }

  return (
    <article
      className={`overflow-visible rounded-lg border bg-white ${
        errors ? 'border-red-300' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          onClick={toggle}
          className="mt-0.5 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-expanded={semester.expanded}
          aria-label={`${semester.expanded ? 'Collapse' : 'Expand'} ${title}`}
          title="Expand or collapse semester"
        >
          <ChevronDown
            className={`h-4 w-4 transition ${semester.expanded ? 'rotate-180' : ''}`}
          />
        </button>

        <button type="button" onClick={toggle} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Semester {semester.number || '—'} · {formatDateRange(semester.startDate, semester.endDate)} ·{' '}
            {subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}
          </p>
        </button>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={edit}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
            aria-label={`Edit ${title}`}
            title="Edit semester"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${title}`}
            title="Remove semester"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!semester.expanded && errors ? (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
          This semester has validation errors. Expand it to review them.
        </p>
      ) : null}

      {semester.expanded ? (
        <div className="space-y-5 border-t border-slate-200 p-4 sm:p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id={nameInputId}
              label="Semester Name"
              name={`${semester.clientId}-name`}
              required
              value={semester.name}
              error={errors?.name}
              placeholder="e.g. Semester 1"
              onChange={(event) => onChange({ ...semester, name: event.target.value })}
            />
            <Input
              label="Semester Number"
              name={`${semester.clientId}-number`}
              type="number"
              min={1}
              step={1}
              required
              value={semester.number}
              error={errors?.number}
              placeholder="e.g. 1"
              onChange={(event) => onChange({ ...semester, number: event.target.value })}
            />
            <Input
              label="Start Date"
              name={`${semester.clientId}-start`}
              type="date"
              required
              value={semester.startDate}
              error={errors?.startDate}
              onChange={(event) => onChange({ ...semester, startDate: event.target.value })}
            />
            <Input
              label="End Date"
              name={`${semester.clientId}-end`}
              type="date"
              required
              value={semester.endDate}
              error={errors?.endDate}
              onChange={(event) => onChange({ ...semester, endDate: event.target.value })}
            />
          </div>
          <Textarea
            label="Semester Description"
            name={`${semester.clientId}-description`}
            value={semester.description}
            placeholder="Optional notes about this semester"
            className="min-h-20"
            onChange={(event) => onChange({ ...semester, description: event.target.value })}
          />
          <SubjectAllocationEditor
            key={courseId}
            subjectIds={semester.subjectIds}
            subjects={subjects}
            courseId={courseId}
            error={errors?.subjects}
            onChange={(subjectIds) => onChange({ ...semester, subjectIds })}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Remove Semester"
        message={
          subjectCount > 0
            ? `Remove "${title}" and its ${subjectCount} allocated ${
                subjectCount === 1 ? 'subject' : 'subjects'
              }?`
            : `Remove "${title}" from this academic session?`
        }
        confirmLabel="Remove"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onRemove()
        }}
      />
    </article>
  )
}
