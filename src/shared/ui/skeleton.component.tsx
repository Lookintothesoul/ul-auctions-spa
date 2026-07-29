import { cn } from '@/shared/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-slate-200', className)} aria-hidden="true" />
  )
}

export function AuctionCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      role="status"
      aria-busy="true"
      aria-label="Загрузка карточки аукциона"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
    </div>
  )
}

export function PageSkeleton({ label = 'Загрузка страницы' }: { label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <Skeleton className="h-64 w-full max-w-md" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
