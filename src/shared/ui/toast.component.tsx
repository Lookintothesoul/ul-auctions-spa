import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastRole: Record<ToastType, 'status' | 'alert'> = {
  success: 'status',
  info: 'status',
  error: 'alert',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Уведомления"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toastRole[toast.type]}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={cn(
              'pointer-events-auto flex min-w-[280px] max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
              toast.type === 'success' && 'border-green-200 bg-green-50 text-green-900',
              toast.type === 'error' && 'border-red-200 bg-red-50 text-red-900',
              toast.type === 'info' && 'border-sky-200 bg-sky-50 text-sky-900',
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded p-0.5 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              aria-label={`Закрыть уведомление: ${toast.message}`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
