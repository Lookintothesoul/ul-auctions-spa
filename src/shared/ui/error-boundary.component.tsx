import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/ui/button.component'

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Неизвестная ошибка',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center"
          role="alert"
        >
          <AlertTriangle className="size-12 text-amber-500" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-slate-900">
            {this.props.fallbackTitle ?? 'Что-то пошло не так'}
          </h1>
          <p className="text-sm text-slate-600">{this.state.message}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={this.handleReset}>Попробовать снова</Button>
            <Button variant="secondary" onClick={() => window.location.assign('/')}>
              На главную
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
