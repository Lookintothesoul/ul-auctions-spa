import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, EyeOff, Inbox, Trophy } from 'lucide-react'
import type { BetItem } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge.component'
import { linkButtonClassName } from '@/shared/ui/link-button.styles'
import { Card, CardBody } from '@/shared/ui/card.component'
import { Alert } from '@/shared/ui/alert.component'
import { formatDate, formatPrice } from '@/shared/lib/utils'

interface BetsListWidgetProps {
  bets: BetItem[]
  auctionUuid: string
  hideHistory?: boolean
  participantsCount: number
}

export function BetsListWidget({
  bets,
  auctionUuid,
  hideHistory,
  participantsCount,
}: BetsListWidgetProps) {
  if (hideHistory) {
    return (
      <section className="space-y-4" aria-labelledby="bets-page-title">
        <BetsPageHeader auctionUuid={auctionUuid} />
        <Alert variant="info" title="История ставок скрыта">
          Организатор скрыл историю ставок для данного аукциона.
        </Alert>
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-labelledby="bets-page-title">
      <BetsPageHeader auctionUuid={auctionUuid} />

      <p className="text-sm text-slate-500" aria-live="polite">
        Участников: {participantsCount} · Всего ставок: {bets.length}
      </p>

      {bets.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center"
          role="status"
        >
          <Inbox className="size-12 text-slate-300" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-slate-700">Ставок пока нет</p>
          <Link
            to="/auctions/$auctionUuid/bet"
            params={{ auctionUuid }}
            className={linkButtonClassName('primary', 'md', 'mt-4')}
          >
            Сделать первую ставку
          </Link>
        </div>
      ) : (
        <ol className="space-y-3" aria-label="Рейтинг ставок">
          {bets.map((bet) => (
            <li key={bet.id}>
              <BetRow bet={bet} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function BetsPageHeader({ auctionUuid }: { auctionUuid: string }) {
  return (
    <header>
      <Link
        to="/auctions/$auctionUuid"
        params={{ auctionUuid }}
        className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />К аукциону
      </Link>
      <h1 id="bets-page-title" className="text-2xl font-bold">
        История ставок
      </h1>
    </header>
  )
}

function BetRow({ bet }: { bet: BetItem }) {
  const headingId = useId()

  return (
    <Card
      as="article"
      aria-labelledby={headingId}
      className={bet.is_rejected ? 'opacity-60' : undefined}
    >
      <CardBody>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {bet.place != null && (
                <span
                  className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold"
                  aria-label={`Место ${bet.place}`}
                >
                  {bet.place}
                </span>
              )}
              <div>
                <h2 id={headingId} className="font-medium">
                  {bet.organization_name || '—'}
                </h2>
                <p className="text-xs text-slate-500">ИНН: {bet.organization_inn}</p>
              </div>
            </div>
            {bet.contact_name && <p className="mt-1 text-sm text-slate-500">{bet.contact_name}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatPrice(bet.price_with_vat)}</p>
            <p className="text-xs text-slate-500">без НДС: {formatPrice(bet.price_no_vat)}</p>
          </div>
        </header>

        <footer className="mt-3 flex flex-wrap items-center gap-2">
          {bet.is_win && (
            <Badge variant="success">
              <Trophy className="mr-1 size-3" aria-hidden="true" />
              Победитель
            </Badge>
          )}
          {bet.is_rejected && (
            <Badge variant="danger">
              <EyeOff className="mr-1 size-3" aria-hidden="true" />
              Отменена
            </Badge>
          )}
          {bet.is_counter && <Badge variant="warning">Встречная</Badge>}
          <time className="text-xs text-slate-400" dateTime={bet.created_at}>
            {formatDate(bet.created_at)}
          </time>
        </footer>

        {bet.cancel_reason && (
          <p className="mt-2 text-sm text-red-600" role="note">
            Причина: {bet.cancel_reason}
          </p>
        )}
      </CardBody>
    </Card>
  )
}

export function countParticipants(bets: BetItem[]): number {
  return new Set(bets.filter((b) => !b.is_rejected).map((b) => b.subscriber_id)).size
}
