import type { AuctionStatus, AuctionType, TradingStatus } from '@/shared/api/types'

export const AUCTION_TYPE_LABELS: Record<AuctionType, string> = {
  Request: 'Заявочный',
  Up: 'На повышение',
  Down: 'На понижение',
  FixPrice: 'Фикс. цена',
  Unknown: 'Неизвестный',
}

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  Planning: 'Планирование',
  Auction: 'Торги',
  DeterminateWinner: 'Определение победителя',
  WaitDeal: 'Ожидание сделки',
  InProgress: 'В работе',
  Finished: 'Завершён',
  Stopped: 'Остановлен',
  Canceled: 'Отменён',
  Unknown: 'Неизвестный',
}

export const TRADING_STATUS_LABELS: Record<TradingStatus, string> = {
  NotParticipating: 'Не участвует',
  Leading: 'Лидирует',
  Losing: 'Перебит',
  OnPending: 'На рассмотрении',
  Confirmed: 'Подтверждён',
  ChoosingWinner: 'Выбор победителя',
  Winner: 'Победитель',
  Accepted: 'Принят',
  Unknown: 'Неизвестный',
}

export function getAuctionTypeBadgeVariant(
  type: AuctionType,
): 'default' | 'success' | 'warning' | 'info' {
  switch (type) {
    case 'Down':
      return 'info'
    case 'Up':
      return 'success'
    case 'FixPrice':
      return 'warning'
    default:
      return 'default'
  }
}

export function getTradingStatusBadgeVariant(
  status: TradingStatus,
): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'Leading':
    case 'Winner':
    case 'Confirmed':
    case 'Accepted':
      return 'success'
    case 'Losing':
      return 'danger'
    case 'NotParticipating':
      return 'muted'
    default:
      return 'warning'
  }
}

export function getAuctionStatusBadgeVariant(
  status: AuctionStatus,
): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'Auction':
      return 'success'
    case 'Finished':
    case 'InProgress':
      return 'muted'
    case 'Canceled':
    case 'Stopped':
      return 'danger'
    default:
      return 'warning'
  }
}

export type AuctionCardAction =
  | { type: 'set_bet'; label: 'Сделать ставку' }
  | { type: 'change_bet'; label: 'Изменить ставку' }
  | { type: 'view_bets'; label: 'Смотреть ставки' }
  | { type: 'disabled'; label: string }

export function resolveAuctionCardAction(item: {
  trading: {
    can_set_bet: boolean
    status: AuctionStatus
    your: { bet: boolean } | null
  }
}): AuctionCardAction {
  if (item.trading.status === 'Finished' || item.trading.status === 'Canceled') {
    return { type: 'disabled', label: 'Торги завершены' }
  }

  if (!item.trading.can_set_bet) {
    return { type: 'view_bets', label: 'Смотреть ставки' }
  }

  if (item.trading.your?.bet) {
    return { type: 'change_bet', label: 'Изменить ставку' }
  }

  return { type: 'set_bet', label: 'Сделать ставку' }
}
