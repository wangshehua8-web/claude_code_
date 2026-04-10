import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    '已投递': 'bg-stone-100 text-stone-800',
    '简历筛选中': 'bg-blue-100 text-blue-800',
    '笔试邀请': 'bg-purple-100 text-purple-800',
    '一面邀请': 'bg-indigo-100 text-indigo-800',
    '二面邀请': 'bg-indigo-100 text-indigo-800',
    '三面邀请': 'bg-indigo-100 text-indigo-800',
    'HR面': 'bg-orange-100 text-orange-800',
    'Offer': 'bg-emerald-100 text-emerald-800',
    '已拒绝': 'bg-rose-100 text-rose-800',
    '已放弃': 'bg-stone-100 text-stone-500',
  }
  return statusColors[status] || 'bg-stone-100 text-stone-800'
}