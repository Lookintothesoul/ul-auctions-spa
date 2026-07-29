import { cn } from '@/shared/lib/utils'

type LinkButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<LinkButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function linkButtonClassName(
  variant: LinkButtonVariant = 'primary',
  size: keyof typeof sizeClasses = 'md',
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
