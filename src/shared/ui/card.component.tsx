import { cn } from '@/shared/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'article' | 'section'
}

export function Card({ children, className, as: Component = 'div', ...props }: CardProps) {
  return (
    <Component
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({
  children,
  className,
  as: Component = 'header',
}: {
  children: React.ReactNode
  className?: string
  as?: 'header' | 'div'
}) {
  return (
    <Component className={cn('border-b border-slate-100 px-4 py-3 sm:px-6', className)}>
      {children}
    </Component>
  )
}

export function CardBody({
  children,
  className,
  as: Component = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section'
}) {
  return <Component className={cn('px-4 py-4 sm:px-6', className)}>{children}</Component>
}

interface DescriptionListProps {
  items: Array<{ term: string; details: React.ReactNode }>
  className?: string
}

export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl className={cn('grid gap-3 text-sm sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.term}>
          <dt className="text-slate-500">{item.term}</dt>
          <dd className="font-medium">{item.details}</dd>
        </div>
      ))}
    </dl>
  )
}
