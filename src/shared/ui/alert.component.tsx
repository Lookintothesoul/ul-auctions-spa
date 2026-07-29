import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const config: Record<
  AlertVariant,
  { icon: typeof Info; classes: string; role: 'alert' | 'status' }
> = {
  info: { icon: Info, classes: 'border-sky-200 bg-sky-50 text-sky-900', role: 'status' },
  success: {
    icon: CheckCircle2,
    classes: 'border-green-200 bg-green-50 text-green-900',
    role: 'status',
  },
  warning: {
    icon: AlertCircle,
    classes: 'border-amber-200 bg-amber-50 text-amber-900',
    role: 'status',
  },
  error: { icon: XCircle, classes: 'border-red-200 bg-red-50 text-red-900', role: 'alert' },
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { icon: Icon, classes, role } = config[variant]

  return (
    <div role={role} className={cn('flex gap-3 rounded-lg border p-4', classes, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className={cn('text-sm', title && 'mt-1')}>{children}</div>
      </div>
    </div>
  )
}
