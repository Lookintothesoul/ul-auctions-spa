import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface VisuallyHiddenProps {
  children: ReactNode
  as?: 'span' | 'h1' | 'h2' | 'p'
  className?: string
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
  className,
}: VisuallyHiddenProps) {
  return <Component className={cn('sr-only', className)}>{children}</Component>
}
