import type { SelectHTMLAttributes } from 'react'
import type { SelectOption } from '@/types/common'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}

export function Select({
  label,
  options,
  error,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
        {label}
        {props.required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      <select
        id={selectId}
        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-sky-600/20 ${
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-slate-300 focus:border-sky-600'
        } ${className}`}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
