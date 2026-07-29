import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number | null | undefined, currency = '₽'): string {
  if (value == null) return '—'
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${currency}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ru-RU')
}

export function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

export function parseOptionalBoolean(value: string | undefined): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export function parseOptionalStringArray(value: string | undefined): string[] | undefined {
  if (!value?.trim()) return undefined
  return value.split(',').filter(Boolean)
}

export function parseOptionalIntArray(value: string | undefined): number[] | undefined {
  if (!value?.trim()) return undefined
  const nums = value
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n))
  return nums.length ? nums : undefined
}
