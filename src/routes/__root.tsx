import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AppLayout } from '@/app/ui/app-layout.component'
import { ErrorBoundary } from '@/shared/ui/error-boundary.component'
import { NotFoundPage } from '@/shared/ui/not-found.component'

export const Route = createRootRoute({
  component: () => (
    <AppLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AppLayout>
  ),
  notFoundComponent: NotFoundPage,
})
