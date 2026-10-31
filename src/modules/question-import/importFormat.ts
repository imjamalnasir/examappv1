import type { ImportRecordStatus, ImportRowStatus } from '@/types/questionImport'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatImportDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function importRecordStatus(success: number, failed: number, skipped: number): ImportRecordStatus {
  if (success === 0) {
    return 'Failed'
  }
  if (failed > 0 || skipped > 0) {
    return 'Partial'
  }
  return 'Completed'
}

export function rowStatusLabel(status: ImportRowStatus): string {
  if (status === 'valid') {
    return 'Valid'
  }
  if (status === 'invalid') {
    return 'Invalid'
  }
  return 'Warning'
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
