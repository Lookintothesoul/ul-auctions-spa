import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, placeholder, required, ...props }, ref) => {
    const autoId = useId()
    const selectId = id ?? props.name ?? autoId
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
            {required ? (
              <>
                {' '}
                <span className="text-red-600" aria-hidden="true">
                  *
                </span>
                <span className="sr-only"> (обязательно)</span>
              </>
            ) : null}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50',
            error && 'border-red-500',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
