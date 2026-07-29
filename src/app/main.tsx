import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/index.css'
import { AppProviders } from '@/app/providers/app-providers'

async function enableMocking() {
  if (import.meta.env.PROD) return

  const { worker } = await import('@/shared/mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}

void enableMocking().then(() => {
  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  createRoot(root).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
