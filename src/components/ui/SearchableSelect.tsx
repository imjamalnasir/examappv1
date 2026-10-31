import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import type { SelectOption } from '@/types/common'

interface SearchableSelectProps {
  label: string
  name: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  emptyMessage?: string
}

export function SearchableSelect({
  label,
  name,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select',
  disabled = false,
  required = false,
  emptyMessage = 'No matches found.',
}: SearchableSelectProps) {
  const generatedId = useId()
  const listId = `${generatedId}-list`
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((option) => option.value === value)

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return options
    }
    return options.filter((option) => option.label.toLowerCase().includes(normalized))
  }, [options, query])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const closeAndSelect = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      <button
        id={generatedId}
        type="button"
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) {
            return
          }
          setOpen((current) => !current)
          setQuery('')
        }}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-left text-sm outline-none transition focus:ring-2 focus:ring-sky-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-sky-600'
        }`}
      >
        <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 p-2">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  if (filteredOptions.length === 1) {
                    closeAndSelect(filteredOptions[0].value)
                  }
                }
              }}
              placeholder="Search..."
              aria-label={`Search ${label}`}
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`flex w-full px-3 py-2 text-left text-sm hover:bg-sky-50 ${
                        isSelected ? 'bg-sky-50 font-medium text-sky-800' : 'text-slate-700'
                      }`}
                      onClick={() => closeAndSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
