export type AuctionType = 'Request' | 'Up' | 'Down' | 'FixPrice' | 'Unknown'

export type AuctionStatus =
  | 'Planning'
  | 'Auction'
  | 'DeterminateWinner'
  | 'WaitDeal'
  | 'InProgress'
  | 'Finished'
  | 'Stopped'
  | 'Canceled'
  | 'Unknown'

export type TradingStatus =
  | 'NotParticipating'
  | 'Leading'
  | 'Losing'
  | 'OnPending'
  | 'Confirmed'
  | 'ChoosingWinner'
  | 'Winner'
  | 'Accepted'
  | 'Unknown'

export type BidMeasurementType = 'PerRoute' | 'PerKm' | 'Unknown'

export type OperationType = 'Loading' | 'Unloading' | 'Unknown'

export interface AuctionListItemTradingPrice {
  start: number
  current: number
  current_no_vat: number
}

export interface AuctionListItemTradingYour {
  bet: boolean
  last_bet: number | null
}

export interface AuctionListItemRoutePoint {
  city: string
  address: string
  date: string
  city_gc_id: number
  points_count: number
}

export interface AuctionListItem {
  main: {
    id: number
    cargo_num: string
    cargo_date: string
    auc_type: AuctionType
    order_uid: string
    created_at: string
    priority_sort: number
    is_assembly: boolean
    price_per_km: number | null
  }
  organizer: {
    subscriber_id: number
    organization_id: number
    organization_name: string
    organization_inn: string
    organization_kpp: string
    is_hide_organization: boolean
  }
  route: {
    load: AuctionListItemRoutePoint
    unload: AuctionListItemRoutePoint
  }
  cargo: {
    name: string
    weight: number
    volume: number
    body_type: string
    truck_count: number
    is_cargo: boolean
  }
  trading: {
    status: AuctionStatus
    status_mobile: TradingStatus
    start_time: string
    stop_time: string
    bid_measurement_type: BidMeasurementType | null
    can_set_bet: boolean
    allow_counter_bets: boolean
    hide_points_address_and_contacts: boolean
    is_bidder: boolean
    is_available: boolean
    is_accredited: boolean
    is_favorite: boolean
    price: AuctionListItemTradingPrice | null
    your: AuctionListItemTradingYour | null
  }
  payment: {
    form: string
    currency_code: string
  }
}

export interface AuctionListMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface AuctionListResponse {
  data: AuctionListItem[]
  meta: AuctionListMeta
}

export interface AuctionListRequest {
  page?: number
  per_page?: number
  cargo_num?: string
  status?: TradingStatus[]
  statuses?: number[]
  auc_type?: Array<'Request' | 'Up' | 'Down' | 'FixPrice'>
  load_city?: string
  load_gc_id?: number
  unload_city?: string
  unload_gc_id?: number
  load_date_from?: string
  load_date_to?: string
  is_available?: boolean
  is_bidder?: boolean
  current_price_from?: number | null
  current_price_to?: number | null
}

export interface Contact {
  name: string | null
  phone: string | null
  work_phone: string | null
  uid: string | null
  email: string | null
}

export interface RoutePointLocation {
  city_name: string
  city_full_name: string
  city_gc_id: number
  loading_address: string
  lon: number
  lat: number
}

export interface RoutePoint {
  row_num: number
  op_type: OperationType
  start_date: string
  end_date: string
  comment: string | null
  contractor: string
  contractor_inn: string
  location: RoutePointLocation
  cargo: {
    name: string
    package_name: string
    weight: string
    volume: string
  }
  contact: {
    name: string
    phone: string
  }
}

export interface AuctionShowTradingPrice {
  start: number | null
  start_no_vat: number | null
  current: number | null
  current_no_vat: number | null
  available: number | null
  available_no_vat: number | null
  min: number | null
  min_no_vat: number | null
  max: number | null
  max_no_vat: number | null
  step: number | null
  step_no_vat: number | null
  price_per_km: number
}

export interface AuctionShowResponse {
  main: {
    id: number
    cargo_num: string
    cargo_date: string
    order_uid: string
    auc_type: AuctionType
    created_at: string
  }
  organizer: {
    subscriber_id: number
    subscriber_code: string
    infobase_code: string
    organization_name: string
    organization_inn: string
    organization_kpp: string
    organization_id: number
  }
  contacts: Contact[]
  cargo: {
    price: string
    currency: number | null
    is_international: boolean
    distance: number | null
    truck_count: number
    body_type: string
    temp_from?: number | null
    temp_to?: number | null
    loading_types: { side: boolean; top: boolean; rear: boolean; full: boolean }
    docs: { tir: boolean; cmr: boolean; t1: boolean; med: boolean }
    car: {
      type: string
      weight: number | null
      volume: number | null
      width: number | null
      length: number | null
      height: number | null
    } | null
  }
  trading: {
    status: AuctionStatus
    status_mobile: TradingStatus
    start_time: string
    stop_time: string
    bid_measurement_type: BidMeasurementType
    can_set_bet: boolean
    allow_counter_bets: boolean
    hide_bets_history: boolean
    hide_places: boolean
    no_view_cargo_price: boolean
    hide_points_address_and_contacts: boolean
    is_bidder: boolean
    is_favorite: boolean
    price: AuctionShowTradingPrice
    your: {
      bet: boolean
      last_bet: number | null
      last_bet_with_vat: number | null
      win: boolean
    }
    settings: {
      prolong_after_bet: number | null
      winner_confirm: number | null
      transmission_time_in: number | null
      coefficient: number | null
    }
  }
  payment: {
    condition: string | null
    condition_predefined?: string | null
    form: string
    delay: number | null
    delay_type: 'CalendarDays' | 'WorkDays' | 'Unknown' | null
    currency_code: string
    prepay: string | null
  }
  assembly: { num: string | null; date: string | null }
  routes: RoutePoint[]
  admitted_organizations: Array<{
    id: number
    inn: string
    name: string
    full_name: string
    subscriber_id: number
    hide_me: boolean
  }>
  hide_bets_history?: boolean
}

export interface BetItem {
  id: number
  created_at: string
  auction_id: number
  subscriber_id: number
  contact_name: string
  contact_phone: string
  price_with_vat: number
  price_no_vat: number
  organization_id: number
  organization_inn: string
  organization_name: string
  transporter_comment: string | null
  is_rejected: boolean
  is_counter: boolean
  place: number | null
  is_win: boolean
  run_number: number
  cancel_reason: string
  price_info: {
    price_with_vat: number | null
    price_no_vat: number | null
    payment_type: string | null
    vat_rate: string | null
  }
}

export interface BetListResponse {
  bets: BetItem[]
}

export interface SetBetRequest {
  price: number
}

export interface ValidationError {
  field: string
  message: string
  code: string | null
}

export interface ValidationProblem {
  code: string
  title: string
  message: string
  trace_id: string | null
  errors: ValidationError[]
}

export interface ProblemDetail {
  code: string
  title: string
  message: string
  trace_id: string | null
}

export class ApiError extends Error {
  status: number
  body: ProblemDetail | ValidationProblem

  constructor(status: number, body: ProblemDetail | ValidationProblem) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  isValidation(): this is ApiError & { body: ValidationProblem } {
    return this.status === 422 && 'errors' in this.body
  }
}
