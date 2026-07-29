import { Alert } from '@/shared/ui/alert.component'
import { Button } from '@/shared/ui/button.component'

interface QueryErrorProps {
  title: string
  message: string
  onRetry?: () => void
}

export function QueryError({ title, message, onRetry }: QueryErrorProps) {
  return (
    <div className="space-y-3">
      <Alert variant="error" title={title}>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  )
}
