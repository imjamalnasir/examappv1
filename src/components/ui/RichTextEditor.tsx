import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Bold, Italic, List, ListOrdered, RemoveFormatting, Underline } from 'lucide-react'
import { isRichTextEmpty, sanitizeQuestionHtml } from '@/utils/richText'

interface RichTextEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  hint?: string
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Write the question',
  hint,
}: RichTextEditorProps) {
  const labelId = useId()
  const editorRef = useRef<HTMLDivElement>(null)
  const skipSync = useRef(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    if (skipSync.current) {
      skipSync.current = false
      return
    }
    if (editor.innerHTML !== value) {
      editor.innerHTML = value
    }
  }, [value])

  const publish = (nextValue: string) => {
    skipSync.current = true
    onChange(nextValue)
  }

  const syncFromEditor = () => {
    publish(editorRef.current?.innerHTML ?? '')
  }

  const run = (command: string) => {
    editorRef.current?.focus()
    document.execCommand(command)
    syncFromEditor()
  }

  const handleBlur = () => {
    const clean = sanitizeQuestionHtml(editorRef.current?.innerHTML ?? '')
    const next = isRichTextEmpty(clean) ? '' : clean
    if (editorRef.current && editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next
    }
    publish(next)
  }

  return (
    <div className="space-y-1.5">
      <label
        id={labelId}
        onClick={() => editorRef.current?.focus()}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      <div
        className={`overflow-hidden rounded-md border bg-white focus-within:ring-2 focus-within:ring-sky-600/20 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
      >
        <div className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5">
          <ToolbarButton label="Bold" onClick={() => run('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" onClick={() => run('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" onClick={() => run('underline')}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Bulleted list" onClick={() => run('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" onClick={() => run('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Clear formatting" onClick={() => run('removeFormat')}>
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <div className="relative">
          {isRichTextEmpty(value) ? (
            <span className="pointer-events-none absolute left-3 top-2 text-sm text-slate-400">
              {placeholder}
            </span>
          ) : null}
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-labelledby={labelId}
            aria-invalid={Boolean(error)}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onInput={syncFromEditor}
            onBlur={handleBlur}
            className="relative min-h-32 px-3 py-2 text-sm leading-6 text-slate-900 outline-none [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
          />
        </div>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
