import { useEffect, useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return {
    page,
    pageSize,
    setPage,
    totalItems: items.length,
    paginatedItems,
  }
}
