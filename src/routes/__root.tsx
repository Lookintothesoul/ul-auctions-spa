import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AppLayout } from '@/app/ui/app-layout.component'

export const Route = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})
