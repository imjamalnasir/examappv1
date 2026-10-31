import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { formatCredits } from '@/modules/academics/academicLookups'
import type { Subject } from '@/types/subject'

interface SubjectPickerState {
  subjectId: string
}

interface SubjectAllocationEditorProps {
  subjectIds: string[]
  subjects: Subject[]
  courseId: string
  error?: string
  onChange: (subjectIds: string[]) => void
}

const emptyPicker: SubjectPickerState = {
  subjectId: '',
}

export function SubjectAllocationEditor({
  subjectIds,
  subjects,
  courseId,
  error,
  onChange,
}: SubjectAllocationEditorProps) {
  const [picker, setPicker] = useState<SubjectPickerState>(emptyPicker)
  const [pickerError, setPickerError] = useState('')
  const [subjectToRemove, setSubjectToRemove] = useState<string | null>(null)

  const courseSubjects = useMemo(
    () => subjects.filter((subject) => subject.courseId === courseId),
    [subjects, courseId],
  )

  const subjectOptions = useMemo(
    () =>
      courseSubjects
        .filter((subject) => !subjectIds.includes(subject.id))
        .map((subject) => ({
          label: `${subject.name} (${subject.code})`,
          value: subject.id,
        })),
    [courseSubjects, subjectIds],
  )

  const selectedSubject = courseSubjects.find((subject) => subject.id === picker.subjectId)
  const subjectEmptyMessage = !courseId
    ? 'Select a course for this academic session first.'
    : courseSubjects.length > 0 && subjectOptions.length === 0
      ? 'All subjects for this course are already assigned.'
      : 'No subjects found for this course.'

  const handleAdd = () => {
    if (!courseId) {
      setPickerError('Select a course for this academic session first.')
      return
    }
    if (!picker.subjectId) {
      setPickerError('Subject selection is required.')
      return
    }
    if (subjectIds.includes(picker.subjectId)) {
      setPickerError('This subject is already assigned to this semester.')
      return
    }
    const subject = courseSubjects.find((item) => item.id === picker.subjectId)
    if (!subject) {
      setPickerError('Choose a subject that belongs to this academic session’s course.')
      return
    }

    onChange([...subjectIds, picker.subjectId])
    setPicker(emptyPicker)
    setPickerError('')
  }

  const confirmRemove = () => {
    if (!subjectToRemove) {
      return
    }
    onChange(subjectIds.filter((subjectId) => subjectId !== subjectToRemove))
    setSubjectToRemove(null)
  }

  const removalSubject = subjectToRemove
    ? subjects.find((subject) => subject.id === subjectToRemove)
    : undefined

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Subject Allocation</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add subjects from this academic session’s course. Each semester keeps its own list.
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <SearchableSelect
            label="Subject"
            name="allocationSubject"
            required
            options={subjectOptions}
            value={picker.subjectId}
            disabled={!courseId}
            placeholder={courseId ? 'Select a subject' : 'Select a course first'}
            emptyMessage={subjectEmptyMessage}
            onChange={(subjectId) => {
              setPicker({ subjectId })
              setPickerError('')
            }}
          />
          <div className="space-y-1.5">
            <p className="block text-sm font-medium text-slate-700">Subject Code</p>
            <div className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700">
              {selectedSubject?.code ?? '—'}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="block text-sm font-medium text-slate-700">Subject Credits</p>
            <div className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700">
              {formatCredits(selectedSubject?.credits)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">Code and credits are filled from the Subjects module.</p>
          <Button type="button" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>
        {pickerError ? <p className="mt-2 text-xs text-red-600">{pickerError}</p> : null}
      </div>

      {subjectIds.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-800">No subjects allocated</p>
          <p className="mt-1 text-sm text-slate-500">Add one or more subjects for this semester.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Subject Code</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {subjectIds.map((subjectId) => {
                const subject = subjects.find((item) => item.id === subjectId)
                return (
                  <tr key={subjectId}>
                    <td className="min-w-44 px-4 py-3 text-slate-800">
                      {subject ? (
                        <Link
                          to={`/subjects/${subject.id}`}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {subject.name}
                        </Link>
                      ) : (
                        'Unknown subject'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {subject?.code ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatCredits(subject?.credits)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSubjectToRemove(subjectId)}
                        className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${subject?.name ?? 'subject'}`}
                        title="Remove subject"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <ConfirmDialog
        open={Boolean(subjectToRemove)}
        title="Remove Subject"
        message={`Remove "${removalSubject?.name ?? 'this subject'}" from this semester?`}
        confirmLabel="Remove"
        onCancel={() => setSubjectToRemove(null)}
        onConfirm={confirmRemove}
      />
    </div>
  )
}
