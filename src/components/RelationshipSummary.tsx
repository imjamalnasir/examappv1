interface RelationshipSummaryProps {
  items: Array<{ label: string; value: number }>
}

export function RelationshipSummary({ items }: RelationshipSummaryProps) {
  const visible = items.filter((item) => item.value > 0)

  if (visible.length === 0) {
    return (
      <p className="text-sm text-slate-500">No linked child records in the academic hierarchy.</p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          {item.value} {item.label}
        </span>
      ))}
    </div>
  )
}
