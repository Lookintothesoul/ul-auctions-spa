import { useId } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Filter, X } from 'lucide-react'
import { CITIES } from '@/shared/config/cities'
import { AUCTION_STATUS_MAP } from '@/shared/config/constants'
import { useUiStore } from '@/shared/model/ui-store'
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from '@/shared/lib/a11y'
import { Button } from '@/shared/ui/button.component'
import { Input } from '@/shared/ui/input.component'
import { Select } from '@/shared/ui/select.component'
import {
  TRADING_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  AUCTION_STATUS_LABELS,
} from '@/entities/auction/lib/labels'
import type { AuctionSearchParams } from '@/features/auction-filters/model/search-params'
import {
  defaultSearchParams,
  mergeSearchParams,
  serializeSearchParams,
} from '@/features/auction-filters/model/search-params'
import { cn } from '@/shared/lib/utils'

interface AuctionFiltersProps {
  params: AuctionSearchParams
  onChange: (updates: Partial<AuctionSearchParams>) => void
  className?: string
}

const MOBILE_FILTERS_ID = 'auction-filters-dialog'

function FiltersFields({
  params,
  onChange,
}: {
  params: AuctionSearchParams
  onChange: (updates: Partial<AuctionSearchParams>) => void
}) {
  const availableId = useId()
  const bidderId = useId()

  return (
    <>
      <Input
        label="Номер заявки"
        name="cargo_num"
        value={params.cargo_num}
        onChange={(e) => onChange({ cargo_num: e.target.value, page: 1 })}
        placeholder="00000001059"
      />

      <Select
        label="Статус аукциона"
        name="statuses"
        value={params.statuses[0]?.toString() ?? ''}
        onChange={(e) =>
          onChange({
            statuses: e.target.value ? [Number(e.target.value)] : [],
            page: 1,
          })
        }
        placeholder="Все"
      >
        {Object.entries(AUCTION_STATUS_MAP).map(([num, name]) => (
          <option key={num} value={num}>
            {AUCTION_STATUS_LABELS[name as keyof typeof AUCTION_STATUS_LABELS] ?? name}
          </option>
        ))}
      </Select>

      <Select
        label="Мой торговый статус"
        name="status"
        value={params.status[0] ?? ''}
        onChange={(e) =>
          onChange({
            status: e.target.value ? [e.target.value as never] : [],
            page: 1,
          })
        }
        placeholder="Все"
      >
        {Object.entries(TRADING_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Тип аукциона"
        name="auc_type"
        value={params.auc_type[0] ?? ''}
        onChange={(e) =>
          onChange({
            auc_type: e.target.value ? [e.target.value as never] : [],
            page: 1,
          })
        }
        placeholder="Все"
      >
        {(['Request', 'Up', 'Down', 'FixPrice'] as const).map((type) => (
          <option key={type} value={type}>
            {AUCTION_TYPE_LABELS[type]}
          </option>
        ))}
      </Select>

      <Select
        label="Город погрузки"
        name="load_city"
        value={params.load_city}
        onChange={(e) => onChange({ load_city: e.target.value, page: 1 })}
        placeholder="Все"
      >
        {CITIES.map((city) => (
          <option key={city.gc_id} value={city.name}>
            {city.name}
          </option>
        ))}
      </Select>

      <Select
        label="Город выгрузки"
        name="unload_city"
        value={params.unload_city}
        onChange={(e) => onChange({ unload_city: e.target.value, page: 1 })}
        placeholder="Все"
      >
        {CITIES.map((city) => (
          <option key={city.gc_id} value={city.name}>
            {city.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Погрузка от"
          name="load_date_from"
          type="datetime-local"
          value={params.load_date_from ? params.load_date_from.slice(0, 16) : ''}
          onChange={(e) =>
            onChange({
              load_date_from: e.target.value ? `${e.target.value}:00+03:00` : '',
              page: 1,
            })
          }
        />
        <Input
          label="Погрузка до"
          name="load_date_to"
          type="datetime-local"
          value={params.load_date_to ? params.load_date_to.slice(0, 16) : ''}
          onChange={(e) =>
            onChange({
              load_date_to: e.target.value ? `${e.target.value}:00+03:00` : '',
              page: 1,
            })
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Цена от, ₽"
          name="current_price_from"
          type="number"
          min={0}
          inputMode="decimal"
          value={params.current_price_from ?? ''}
          onChange={(e) =>
            onChange({
              current_price_from: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
        />
        <Input
          label="Цена до, ₽"
          name="current_price_to"
          type="number"
          min={0}
          inputMode="decimal"
          value={params.current_price_to ?? ''}
          onChange={(e) =>
            onChange({
              current_price_to: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
        />
      </div>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="sr-only">Дополнительные фильтры</legend>
        <div className="flex items-center gap-2 text-sm">
          <input
            id={availableId}
            type="checkbox"
            checked={params.is_available === true}
            onChange={(e) =>
              onChange({
                is_available: e.target.checked ? true : undefined,
                page: 1,
              })
            }
            className="size-4 rounded border-slate-300"
          />
          <label htmlFor={availableId}>Только доступные для ставки</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            id={bidderId}
            type="checkbox"
            checked={params.is_bidder === true}
            onChange={(e) =>
              onChange({
                is_bidder: e.target.checked ? true : undefined,
                page: 1,
              })
            }
            className="size-4 rounded border-slate-300"
          />
          <label htmlFor={bidderId}>Только где я участвую</label>
        </div>
      </fieldset>

      <Button
        variant="secondary"
        type="reset"
        className="w-full"
        onClick={() => onChange({ ...defaultSearchParams })}
      >
        Сбросить фильтры
      </Button>
    </>
  )
}

export function AuctionFilters({ params, onChange, className }: AuctionFiltersProps) {
  const { isMobileFiltersOpen, closeMobileFilters } = useUiStore()
  const dialogRef = useFocusTrap<HTMLDivElement>(isMobileFiltersOpen)
  useEscapeKey(isMobileFiltersOpen, closeMobileFilters)
  useLockBodyScroll(isMobileFiltersOpen)

  const handleChange = (updates: Partial<AuctionSearchParams>) => {
    onChange(updates)
    if (isMobileFiltersOpen && window.matchMedia('(max-width: 1023px)').matches) {
      closeMobileFilters()
    }
  }

  return (
    <>
      <aside
        aria-label="Фильтры аукционов"
        className={cn('hidden w-full shrink-0 lg:block lg:w-72', className)}
      >
        <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Фильтры
          </h2>
          <form
            role="search"
            aria-label="Поиск аукционов"
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4"
          >
            <FiltersFields params={params} onChange={handleChange} />
          </form>
        </div>
      </aside>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileFilters}
            aria-label="Закрыть панель фильтров"
          />
          <div
            ref={dialogRef}
            id={MOBILE_FILTERS_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filters-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl"
          >
            <header className="flex items-center justify-between border-b px-4 py-3">
              <h2 id="mobile-filters-title" className="font-semibold">
                Фильтры
              </h2>
              <button
                type="button"
                onClick={closeMobileFilters}
                className="rounded-lg p-2 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                aria-label="Закрыть фильтры"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>
            <form
              role="search"
              aria-label="Поиск аукционов"
              onSubmit={(e) => e.preventDefault()}
              className="flex-1 space-y-4 overflow-y-auto p-4 pb-8"
            >
              <FiltersFields params={params} onChange={handleChange} />
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface MobileFiltersButtonProps {
  activeCount?: number
}

export function MobileFiltersButton({ activeCount = 0 }: MobileFiltersButtonProps) {
  const { isMobileFiltersOpen, toggleMobileFilters } = useUiStore()

  return (
    <Button
      variant="secondary"
      type="button"
      className="lg:hidden"
      onClick={toggleMobileFilters}
      aria-expanded={isMobileFiltersOpen}
      aria-controls={MOBILE_FILTERS_ID}
    >
      <Filter className="size-4" aria-hidden="true" />
      Фильтры
      {activeCount > 0 && (
        <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
          <span className="sr-only">Активных фильтров: </span>
          {activeCount}
        </span>
      )}
    </Button>
  )
}

export function useAuctionFiltersNavigate(current: AuctionSearchParams) {
  const navigate = useNavigate({ from: '/' })

  return (updates: Partial<AuctionSearchParams>) => {
    const next = mergeSearchParams(current, updates)
    void navigate({
      search: serializeSearchParams(next) as never,
      replace: true,
    })
  }
}

export { MOBILE_FILTERS_ID }
