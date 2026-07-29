import type { AuctionListItem } from '@/shared/api/types'
import { formatDate, formatPrice } from '@/shared/lib/utils'
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_LABELS,
} from '@/entities/auction/lib/labels'

export interface AuctionCardViewModel {
  uuid: string
  cargoNum: string
  aucTypeLabel: string
  statusLabel: string
  tradingStatusLabel: string
  loadCity: string
  unloadCity: string
  loadDate: string
  unloadDate: string
  cargoName: string
  cargoWeight: string
  cargoVolume: string
  bodyType: string
  currentPrice: string
  pricePerKm: string
  step: string | null
  hasBet: boolean
  organizerName: string
}

export function mapAuctionListItemToCard(item: AuctionListItem): AuctionCardViewModel {
  return {
    uuid: item.main.order_uid,
    cargoNum: item.main.cargo_num,
    aucTypeLabel: AUCTION_TYPE_LABELS[item.main.auc_type] ?? item.main.auc_type,
    statusLabel: AUCTION_STATUS_LABELS[item.trading.status] ?? item.trading.status,
    tradingStatusLabel:
      TRADING_STATUS_LABELS[item.trading.status_mobile] ?? item.trading.status_mobile,
    loadCity: item.route.load.city,
    unloadCity: item.route.unload.city,
    loadDate: formatDate(item.route.load.date),
    unloadDate: formatDate(item.route.unload.date),
    cargoName: item.cargo.name,
    cargoWeight: `${item.cargo.weight} т`,
    cargoVolume: `${item.cargo.volume} м³`,
    bodyType: item.cargo.body_type,
    currentPrice: formatPrice(item.trading.price?.current),
    pricePerKm: formatPrice(item.main.price_per_km),
    step: null,
    hasBet: item.trading.your?.bet ?? false,
    organizerName: item.organizer.is_hide_organization ? 'Скрыт' : item.organizer.organization_name,
  }
}
