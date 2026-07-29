import { useId } from 'react'
import { Inbox } from 'lucide-react'
import { AuctionCard } from '@/entities/auction/ui/auction-card.component'
import { useAuctionListQuery } from '@/entities/auction/api/queries'
import {
  AuctionFilters,
  MobileFiltersButton,
  useAuctionFiltersNavigate,
} from '@/features/auction-filters/ui/auction-filters.component'
import {
  searchParamsToFilters,
  defaultSearchParams,
  countActiveFilters,
  getActiveFilterChips,
  type AuctionSearchParams,
} from '@/features/auction-filters/model/search-params'
import { Alert } from '@/shared/ui/alert.component'
import { Button } from '@/shared/ui/button.component'
import { Badge } from '@/shared/ui/badge.component'
import { AuctionCardSkeleton } from '@/shared/ui/skeleton.component'

interface AuctionListWidgetProps {
  searchParams: AuctionSearchParams
}

export function AuctionListWidget({ searchParams }: AuctionListWidgetProps) {
  const headingId = useId()
  const filters = searchParamsToFilters(searchParams)
  const { data, isLoading, isError, error, isFetching, refetch } = useAuctionListQuery(filters)
  const navigateFilters = useAuctionFiltersNavigate(searchParams)
  const activeFilters = countActiveFilters(searchParams)
  const activeChips = getActiveFilterChips(searchParams)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <AuctionFilters params={searchParams} onChange={navigateFilters} />

      <section className="min-w-0 flex-1" aria-labelledby={headingId}>
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 id={headingId} className="text-xl font-bold text-slate-900 sm:text-2xl">
              Аукционы
            </h1>
            {data?.meta && (
              <p className="text-sm text-slate-500" aria-live="polite" aria-atomic="true">
                Найдено: {data.meta.total}
                {isFetching && !isLoading && ' · обновление…'}
              </p>
            )}
          </div>
          <MobileFiltersButton activeCount={activeFilters} />
        </header>

        {activeChips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2" role="status">
            <span className="text-xs text-slate-500" id="active-filters-label">
              Активные фильтры:
            </span>
            <ul
              className="flex flex-wrap items-center gap-2"
              aria-labelledby="active-filters-label"
            >
              {activeChips.map((chip) => (
                <li key={chip.key}>
                  <Badge variant="info">{chip.label}</Badge>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={() => navigateFilters({ ...defaultSearchParams })}
            >
              Сбросить все
            </button>
          </div>
        )}

        {isLoading && (
          <div
            className="space-y-4"
            role="status"
            aria-busy="true"
            aria-label="Загрузка списка аукционов"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="space-y-3">
            <Alert variant="error" title="Не удалось загрузить аукционы">
              {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </Alert>
            <Button variant="secondary" onClick={() => void refetch()}>
              Повторить
            </Button>
          </div>
        )}

        {!isLoading && !isError && data?.data.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center sm:py-16"
            role="status"
          >
            <Inbox className="size-12 text-slate-300" aria-hidden="true" />
            <p className="mt-4 text-lg font-medium text-slate-700">Аукционы не найдены</p>
            <p className="mt-1 text-sm text-slate-500">Попробуйте изменить параметры фильтрации</p>
            {activeFilters > 0 && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigateFilters({ ...defaultSearchParams })}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <ul className="space-y-4" aria-label="Список аукционов">
              {data.data.map((item) => (
                <li key={item.main.order_uid}>
                  <AuctionCard item={item} />
                </li>
              ))}
            </ul>

            {data.meta.last_page > 1 && (
              <nav
                className="mt-6 flex items-center justify-center gap-2"
                aria-label="Пагинация списка аукционов"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={searchParams.page <= 1}
                  onClick={() => navigateFilters({ page: searchParams.page - 1 })}
                  aria-label="Предыдущая страница"
                >
                  Назад
                </Button>
                <span className="px-3 text-sm text-slate-600" aria-current="page">
                  Страница {searchParams.page} из {data.meta.last_page}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={searchParams.page >= data.meta.last_page}
                  onClick={() => navigateFilters({ page: searchParams.page + 1 })}
                  aria-label="Следующая страница"
                >
                  Вперёд
                </Button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  )
}
