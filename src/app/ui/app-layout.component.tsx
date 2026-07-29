import { Link } from '@tanstack/react-router'
import { Truck } from 'lucide-react'
import { defaultSearchParams } from '@/features/auction-filters/model/search-params'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Перейти к основному содержимому
      </a>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav
            aria-label="Основная навигация"
            className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6"
          >
            <Link
              to="/"
              search={defaultSearchParams}
              className="flex items-center gap-2 rounded-lg font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Truck className="size-6 text-blue-600" aria-hidden="true" />
              <span className="hidden sm:inline">Умная Логистика</span>
              <span className="text-sm font-normal text-slate-500">· Аукционы</span>
            </Link>
          </nav>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6"
        >
          {children}
        </main>

        <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          <p>Тестовое задание · UL Auctions SPA</p>
        </footer>
      </div>
    </>
  )
}
