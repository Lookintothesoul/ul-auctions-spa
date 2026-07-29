import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Package, Truck } from 'lucide-react'
import type { AuctionListItem } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge.component'
import { Button } from '@/shared/ui/button.component'
import { linkButtonClassName } from '@/shared/ui/link-button.styles'
import { Card, CardBody } from '@/shared/ui/card.component'
import { formatPrice } from '@/shared/lib/utils'
import { mapAuctionListItemToCard } from '@/entities/auction/lib/mappers'
import {
  getAuctionStatusBadgeVariant,
  getAuctionTypeBadgeVariant,
  getTradingStatusBadgeVariant,
  resolveAuctionCardAction,
} from '@/entities/auction/lib/labels'
import { usePrefetchAuctionDetail } from '@/entities/auction/api/queries'

interface AuctionCardProps {
  item: AuctionListItem
}

export function AuctionCard({ item }: AuctionCardProps) {
  const headingId = useId()
  const vm = mapAuctionListItemToCard(item)
  const action = resolveAuctionCardAction(item)
  const prefetch = usePrefetchAuctionDetail()

  return (
    <Card
      as="article"
      aria-labelledby={headingId}
      className="transition-shadow hover:shadow-md"
      onMouseEnter={() => prefetch(vm.uuid)}
      onFocus={() => prefetch(vm.uuid)}
    >
      <CardBody>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id={headingId} className="text-lg font-semibold">
              <Link
                to="/auctions/$auctionUuid"
                params={{ auctionUuid: vm.uuid }}
                className="text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Заявка № {vm.cargoNum}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-slate-500">{vm.organizerName}</p>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Статусы аукциона">
            <li>
              <Badge variant={getAuctionTypeBadgeVariant(item.main.auc_type)}>
                <span className="sr-only">Тип: </span>
                {vm.aucTypeLabel}
              </Badge>
            </li>
            <li>
              <Badge variant={getAuctionStatusBadgeVariant(item.trading.status)}>
                <span className="sr-only">Статус: </span>
                {vm.statusLabel}
              </Badge>
            </li>
            <li>
              <Badge variant={getTradingStatusBadgeVariant(item.trading.status_mobile)}>
                <span className="sr-only">Мой статус: </span>
                {vm.tradingStatusLabel}
              </Badge>
            </li>
          </ul>
        </header>

        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>{vm.loadCity}</span>
          <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
          <span>{vm.unloadCity}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Погрузка: <time dateTime={item.route.load.date}>{vm.loadDate}</time> · Выгрузка:{' '}
          <time dateTime={item.route.unload.date}>{vm.unloadDate}</time>
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
            <Package className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs text-slate-500">Груз</dt>
              <dd className="text-sm font-medium">{vm.cargoName}</dd>
              <dd className="text-xs text-slate-500">
                {vm.cargoWeight}, {vm.cargoVolume}, {vm.bodyType}
              </dd>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Текущая цена</dt>
            <dd className="text-lg font-semibold text-slate-900">{vm.currentPrice}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Цена за км</dt>
            <dd className="text-sm font-medium">{vm.pricePerKm}</dd>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
            <Truck className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs text-slate-500">Моя ставка</dt>
              <dd className="text-sm font-medium">
                {vm.hasBet ? formatPrice(item.trading.your?.last_bet) : 'Нет ставки'}
              </dd>
            </div>
          </div>
        </dl>

        <footer className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {action.type === 'disabled' ? (
            <Button variant="secondary" disabled className="w-full sm:w-auto" aria-disabled="true">
              {action.label}
            </Button>
          ) : action.type === 'view_bets' ? (
            <Link
              to="/auctions/$auctionUuid/bets"
              params={{ auctionUuid: vm.uuid }}
              className={linkButtonClassName('secondary', 'md', 'w-full sm:w-auto')}
            >
              {action.label}
            </Link>
          ) : (
            <Link
              to="/auctions/$auctionUuid/bet"
              params={{ auctionUuid: vm.uuid }}
              className={linkButtonClassName('primary', 'md', 'w-full sm:w-auto')}
            >
              {action.label}
            </Link>
          )}
          <Link
            to="/auctions/$auctionUuid"
            params={{ auctionUuid: vm.uuid }}
            className={linkButtonClassName('ghost', 'md', 'w-full sm:w-auto')}
          >
            Подробнее
          </Link>
        </footer>
      </CardBody>
    </Card>
  )
}
