import { Link } from '@tanstack/react-router'
import { ArrowLeft, EyeOff, MapPin, Phone, User } from 'lucide-react'
import type { AuctionShowResponse } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge.component'
import { linkButtonClassName } from '@/shared/ui/link-button.styles'
import { Card, CardBody, CardHeader, DescriptionList } from '@/shared/ui/card.component'
import { formatDate, formatPrice } from '@/shared/lib/utils'
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_LABELS,
  getAuctionStatusBadgeVariant,
  getAuctionTypeBadgeVariant,
  getTradingStatusBadgeVariant,
} from '@/entities/auction/lib/labels'
import { defaultSearchParams } from '@/features/auction-filters/model/search-params'

interface AuctionDetailWidgetProps {
  auction: AuctionShowResponse
  auctionUuid: string
}

export function AuctionDetailWidget({ auction, auctionUuid }: AuctionDetailWidgetProps) {
  const hideAddress = auction.trading.hide_points_address_and_contacts
  const hideBets = auction.hide_bets_history || auction.trading.hide_bets_history

  return (
    <article className="space-y-6" aria-labelledby="auction-detail-title">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/"
            search={defaultSearchParams}
            className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />К списку
          </Link>
          <h1 id="auction-detail-title" className="text-2xl font-bold">
            Заявка № {auction.main.cargo_num}
          </h1>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="Статусы аукциона">
            <li>
              <Badge variant={getAuctionTypeBadgeVariant(auction.main.auc_type)}>
                {AUCTION_TYPE_LABELS[auction.main.auc_type]}
              </Badge>
            </li>
            <li>
              <Badge variant={getAuctionStatusBadgeVariant(auction.trading.status)}>
                {AUCTION_STATUS_LABELS[auction.trading.status]}
              </Badge>
            </li>
            <li>
              <Badge variant={getTradingStatusBadgeVariant(auction.trading.status_mobile)}>
                {TRADING_STATUS_LABELS[auction.trading.status_mobile]}
              </Badge>
            </li>
          </ul>
        </div>
        <nav
          aria-label="Действия с аукционом"
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
        >
          {!hideBets && (
            <Link
              to="/auctions/$auctionUuid/bets"
              params={{ auctionUuid }}
              className={linkButtonClassName('secondary', 'md', 'w-full sm:w-auto')}
            >
              Ставки
            </Link>
          )}
          {auction.trading.can_set_bet && (
            <Link
              to="/auctions/$auctionUuid/bet"
              params={{ auctionUuid }}
              className={linkButtonClassName('primary', 'md', 'w-full sm:w-auto')}
            >
              {auction.trading.your.bet ? 'Изменить ставку' : 'Сделать ставку'}
            </Link>
          )}
        </nav>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card as="section" aria-labelledby="organizer-heading">
            <CardHeader>
              <h2 id="organizer-heading" className="font-semibold">
                Организатор
              </h2>
            </CardHeader>
            <CardBody>
              <DescriptionList
                items={[
                  { term: 'Компания', details: auction.organizer.organization_name },
                  {
                    term: 'ИНН / КПП',
                    details: `${auction.organizer.organization_inn} / ${auction.organizer.organization_kpp}`,
                  },
                ]}
              />
            </CardBody>
          </Card>

          {auction.contacts.length > 0 && !hideAddress && (
            <Card as="section" aria-labelledby="contacts-heading">
              <CardHeader>
                <h2 id="contacts-heading" className="font-semibold">
                  Контакты
                </h2>
              </CardHeader>
              <CardBody as="section">
                <ul className="space-y-3">
                  {auction.contacts.map((contact, i) => (
                    <li key={contact.uid ?? i} className="flex flex-wrap gap-4 text-sm">
                      {contact.name && (
                        <span className="inline-flex items-center gap-1">
                          <User className="size-4 text-slate-400" aria-hidden="true" />
                          {contact.name}
                        </span>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          <Phone className="size-4" aria-hidden="true" />
                          {contact.phone}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {hideAddress && (
            <Card as="section" aria-labelledby="hidden-address-heading">
              <CardBody className="flex items-center gap-2 text-sm text-slate-500">
                <EyeOff className="size-4" aria-hidden="true" />
                <p id="hidden-address-heading">Адреса и контакты скрыты организатором</p>
              </CardBody>
            </Card>
          )}

          <Card as="section" aria-labelledby="route-heading">
            <CardHeader>
              <h2 id="route-heading" className="font-semibold">
                Маршрут
              </h2>
            </CardHeader>
            <CardBody>
              <ol className="space-y-4">
                {auction.routes.map((point) => (
                  <li
                    key={point.row_num}
                    className="flex gap-3 rounded-lg border border-slate-100 p-3"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-blue-500" aria-hidden="true" />
                    <div>
                      <p className="font-medium">
                        {point.op_type === 'Loading' ? 'Погрузка' : 'Выгрузка'} —{' '}
                        {point.location.city_name}
                      </p>
                      {!hideAddress && point.location.loading_address && (
                        <address className="text-sm text-slate-500 not-italic">
                          {point.location.loading_address}
                        </address>
                      )}
                      <p className="text-xs text-slate-400">
                        <time dateTime={point.start_date}>{formatDate(point.start_date)}</time>
                        {point.end_date !== point.start_date && (
                          <>
                            {' — '}
                            <time dateTime={point.end_date}>{formatDate(point.end_date)}</time>
                          </>
                        )}
                      </p>
                      <p className="mt-1 text-sm">
                        {point.cargo.name}: {point.cargo.weight} т, {point.cargo.volume} м³
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card as="section" aria-labelledby="cargo-heading">
            <CardHeader>
              <h2 id="cargo-heading" className="font-semibold">
                Груз и ТС
              </h2>
            </CardHeader>
            <CardBody>
              <DescriptionList
                items={[
                  { term: 'Тип кузова', details: auction.cargo.body_type },
                  {
                    term: 'Расстояние',
                    details: auction.cargo.distance != null ? `${auction.cargo.distance} км` : '—',
                  },
                  ...(!auction.trading.no_view_cargo_price
                    ? [{ term: 'Стоимость груза', details: `${auction.cargo.price} ₽` }]
                    : []),
                  ...(auction.cargo.car
                    ? [
                        { term: 'Тип ТС', details: auction.cargo.car.type },
                        {
                          term: 'Грузоподъёмность',
                          details: `${auction.cargo.car.weight ?? '—'} т`,
                        },
                      ]
                    : []),
                ]}
              />
            </CardBody>
          </Card>

          <Card as="section" aria-labelledby="payment-heading">
            <CardHeader>
              <h2 id="payment-heading" className="font-semibold">
                Условия оплаты
              </h2>
            </CardHeader>
            <CardBody>
              <DescriptionList
                items={[
                  { term: 'Форма оплаты', details: auction.payment.form },
                  ...(auction.payment.condition
                    ? [{ term: 'Условие', details: auction.payment.condition }]
                    : []),
                  ...(auction.payment.delay != null
                    ? [{ term: 'Отсрочка', details: `${auction.payment.delay} дн.` }]
                    : []),
                ]}
              />
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-6" aria-label="Параметры торгов">
          <Card as="section" aria-labelledby="trading-heading">
            <CardHeader>
              <h2 id="trading-heading" className="font-semibold">
                Торги
              </h2>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Текущая цена</dt>
                  <dd className="text-2xl font-bold">
                    {formatPrice(auction.trading.price.current)}
                  </dd>
                  <dd className="text-xs text-slate-400">
                    без НДС: {formatPrice(auction.trading.price.current_no_vat)}
                  </dd>
                </div>
                {auction.trading.price.available != null && (
                  <div>
                    <dt className="text-slate-500">Доступная цена</dt>
                    <dd className="font-medium">{formatPrice(auction.trading.price.available)}</dd>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 border-t pt-3">
                  <div>
                    <dt className="text-xs text-slate-500">Min</dt>
                    <dd className="font-medium">{formatPrice(auction.trading.price.min)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Max</dt>
                    <dd className="font-medium">{formatPrice(auction.trading.price.max)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Шаг</dt>
                    <dd className="font-medium">{formatPrice(auction.trading.price.step)}</dd>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <dt className="text-slate-500">Моя ставка</dt>
                  <dd className="font-medium">
                    {auction.trading.your.bet
                      ? formatPrice(auction.trading.your.last_bet)
                      : 'Нет ставки'}
                  </dd>
                </div>
                <div className="text-xs text-slate-400">
                  <p>
                    Начало:{' '}
                    <time dateTime={auction.trading.start_time}>
                      {formatDate(auction.trading.start_time)}
                    </time>
                  </p>
                  <p>
                    Окончание:{' '}
                    <time dateTime={auction.trading.stop_time}>
                      {formatDate(auction.trading.stop_time)}
                    </time>
                  </p>
                </div>
              </dl>
            </CardBody>
          </Card>

          {auction.trading.settings && (
            <Card as="section" aria-labelledby="settings-heading">
              <CardHeader>
                <h2 id="settings-heading" className="font-semibold">
                  Параметры торгов
                </h2>
              </CardHeader>
              <CardBody>
                <dl className="space-y-2 text-sm">
                  {auction.trading.settings.prolong_after_bet != null && (
                    <div>
                      <dt className="sr-only">Продление после ставки</dt>
                      <dd>
                        Продление после ставки: {auction.trading.settings.prolong_after_bet} мин
                      </dd>
                    </div>
                  )}
                  {auction.trading.settings.transmission_time_in != null && (
                    <div>
                      <dt className="sr-only">Время на передачу</dt>
                      <dd>Время на передачу: {auction.trading.settings.transmission_time_in} ч</dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </article>
  )
}
