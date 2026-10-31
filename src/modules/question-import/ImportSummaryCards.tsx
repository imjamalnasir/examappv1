interface SummaryItem {
  label: string
  value: number
  tone: 'slate' | 'emerald' | 'red' | 'amber' | 'sky'
}

const toneClasses: Record<SummaryItem['tone'], string> = {
  slate: 'text-slate-900',
  emerald: 'text-emerald-700',
  red: 'text-red-700',
  amber: 'text-amber-700',
  sky: 'text-sky-800',
}

export function ImportSummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${items.length > 4 ? 'xl:grid-cols-5' : 'lg:grid-cols-4'}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${toneClasses[item.tone]}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
