import type { AuctionListItem, AuctionShowResponse, BetItem } from '@/shared/api/types'
import { getCityGcId } from '@/shared/config/cities'

export interface MockAuctionRecord {
  uuid: string
  listItem: AuctionListItem
  detail: AuctionShowResponse
  bets: BetItem[]
}

const UUID_1 = '3a05d045-0e67-4f85-b20a-de81d18bba7a'
const UUID_2 = '550e8400-e29b-41d4-a716-446655440001'
const UUID_3 = '550e8400-e29b-41d4-a716-446655440002'
const UUID_4 = '550e8400-e29b-41d4-a716-446655440003'
const UUID_5 = '550e8400-e29b-41d4-a716-446655440004'

function createListItem(
  overrides: Partial<{
    id: number
    uuid: string
    cargo_num: string
    auc_type: AuctionListItem['main']['auc_type']
    status: AuctionListItem['trading']['status']
    status_mobile: AuctionListItem['trading']['status_mobile']
    load_city: string
    unload_city: string
    load_date: string
    unload_date: string
    cargo_name: string
    weight: number
    volume: number
    body_type: string
    current_price: number
    price_per_km: number
    can_set_bet: boolean
    is_available: boolean
    is_bidder: boolean
    has_bet: boolean
    last_bet: number | null
    hide_points: boolean
  }>,
): AuctionListItem {
  const id = overrides.id ?? 1236
  const uuid = overrides.uuid ?? UUID_1
  const currentPrice = overrides.current_price ?? 30000

  return {
    main: {
      id,
      cargo_num: overrides.cargo_num ?? '00000001059',
      cargo_date: '2026-05-04T14:49:09',
      auc_type: overrides.auc_type ?? 'Down',
      order_uid: uuid,
      created_at: '2026-05-25T11:48:20',
      priority_sort: 0,
      is_assembly: false,
      price_per_km: overrides.price_per_km ?? 199,
    },
    organizer: {
      subscriber_id: 98,
      organization_id: 340,
      organization_name: 'ЛИМ',
      organization_inn: '7703769184',
      organization_kpp: '770301001',
      is_hide_organization: false,
    },
    route: {
      load: {
        city: overrides.load_city ?? 'Пермь',
        address: overrides.hide_points ? '' : 'Транспортная 9',
        date: overrides.load_date ?? '2026-05-26T09:00:00',
        city_gc_id: getCityGcId(overrides.load_city ?? 'Пермь') ?? 59,
        points_count: 1,
      },
      unload: {
        city: overrides.unload_city ?? 'Москва',
        address: overrides.hide_points ? '' : 'ул. Ленина 1',
        date: overrides.unload_date ?? '2026-05-28T18:00:00',
        city_gc_id: getCityGcId(overrides.unload_city ?? 'Москва') ?? 100,
        points_count: 1,
      },
    },
    cargo: {
      name: overrides.cargo_name ?? 'Мороженое',
      weight: overrides.weight ?? 10,
      volume: overrides.volume ?? 20,
      body_type: overrides.body_type ?? 'тентованный',
      truck_count: 1,
      is_cargo: true,
      is_international: false,
      containered: false,
      incoterms: '',
      conics: 0,
      belts: 0,
      adr: 0,
      coupling: false,
      air_pass: false,
      low_loader: false,
      additional_load: false,
      temp_from: -18,
      temp_to: -15,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: true, t1: false, med: false },
      car: null,
    },
    trading: {
      status: overrides.status ?? 'Auction',
      status_mobile: overrides.status_mobile ?? 'NotParticipating',
      start_time: '2026-05-25T16:03:00',
      stop_time: '2026-05-25T18:00:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: overrides.can_set_bet ?? true,
      allow_counter_bets: true,
      hide_points_address_and_contacts: overrides.hide_points ?? false,
      direction: '',
      comment: '',
      is_bidder: overrides.is_bidder ?? false,
      is_available: overrides.is_available ?? true,
      is_accredited: true,
      is_favorite: false,
      price: {
        start: 35000,
        current: currentPrice,
        current_no_vat: Math.round((currentPrice / 1.22) * 100) / 100,
      },
      your: {
        bet: overrides.has_bet ?? false,
        last_bet: overrides.last_bet ?? null,
      },
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      is_last_bet_with_vat: false,
    },
    payment: {
      form: 'Безналичная с НДС',
      currency_code: '643',
      consignor: '',
      consignee: '',
    },
  }
}

function createDetailFromList(
  listItem: AuctionListItem,
  options: {
    hide_bets_history?: boolean
    hide_points?: boolean
    no_view_cargo_price?: boolean
    min?: number
    max?: number
    step?: number
    available?: number
  } = {},
): AuctionShowResponse {
  const current = listItem.trading.price?.current ?? 30000
  const available = options.available ?? current - 500
  const min = options.min ?? 20000
  const max = options.max ?? 35000
  const step = options.step ?? 500

  return {
    main: {
      id: listItem.main.id,
      cargo_num: listItem.main.cargo_num,
      cargo_date: listItem.main.cargo_date,
      order_uid: listItem.main.order_uid,
      auc_type: listItem.main.auc_type,
      created_at: listItem.main.created_at,
    },
    organizer: {
      subscriber_id: listItem.organizer.subscriber_id,
      subscriber_code: '12345',
      infobase_code: 'RU_Cargo_01',
      organization_name: listItem.organizer.organization_name,
      organization_inn: listItem.organizer.organization_inn,
      organization_kpp: listItem.organizer.organization_kpp,
      organization_id: listItem.organizer.organization_id,
    },
    contacts: options.hide_points
      ? []
      : [
          {
            name: 'Иванов Иван Иванович',
            phone: '+79001234567',
            work_phone: null,
            uid: '550e8400-e29b-41d4-a716-446655440000',
            email: 'ivanov@example.com',
          },
        ],
    cargo: {
      price: options.no_view_cargo_price ? '0' : '150000',
      currency: 643,
      is_international: false,
      distance: 1500,
      truck_count: listItem.cargo.truck_count,
      body_type: listItem.cargo.body_type,
      temp_from: -18,
      temp_to: -15,
      conics: null,
      belts: null,
      adr: null,
      coupling: null,
      air_pass: null,
      low_loader: null,
      additional_load: null,
      containered: false,
      container_type: null,
      container_size: null,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: true, t1: false, med: false },
      car: {
        type: 'Тягач',
        weight: 20,
        volume: 82,
        width: 2.4,
        length: 13.6,
        height: 2.7,
      },
    },
    trading: {
      status: listItem.trading.status,
      status_mobile: listItem.trading.status_mobile,
      start_time: listItem.trading.start_time,
      stop_time: listItem.trading.stop_time,
      bid_measurement_type: listItem.trading.bid_measurement_type ?? 'PerRoute',
      can_set_bet: listItem.trading.can_set_bet,
      allow_counter_bets: listItem.trading.allow_counter_bets,
      hide_bets_history: options.hide_bets_history ?? false,
      hide_places: false,
      no_view_cargo_price: options.no_view_cargo_price ?? false,
      hide_points_address_and_contacts:
        options.hide_points ?? listItem.trading.hide_points_address_and_contacts,
      is_bidder: listItem.trading.is_bidder,
      is_favorite: listItem.trading.is_favorite,
      is_last_bet_with_vat: null,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: false,
      chat_id: null,
      price: {
        start: listItem.trading.price?.start ?? 35000,
        start_no_vat: 28700,
        current,
        current_no_vat: listItem.trading.price?.current_no_vat ?? 24590,
        available,
        available_no_vat: Math.round((available / 1.22) * 100) / 100,
        min,
        min_no_vat: Math.round((min / 1.22) * 100) / 100,
        max,
        max_no_vat: Math.round((max / 1.22) * 100) / 100,
        step,
        step_no_vat: Math.round((step / 1.22) * 100) / 100,
        price_per_km: listItem.main.price_per_km ?? 16.39,
      },
      your: {
        bet: listItem.trading.your?.bet ?? false,
        last_bet: listItem.trading.your?.last_bet ?? null,
        last_bet_with_vat: listItem.trading.your?.last_bet ?? null,
        win: listItem.trading.status_mobile === 'Winner',
      },
      settings: {
        prolong_after_bet: 10,
        winner_confirm: 1,
        winner_counter_mode: null,
        transmission_time_in: 24,
        coefficient: 10,
      },
    },
    payment: {
      condition: 'По оригиналам накладных (ТН, ТТН, CMR)',
      condition_predefined: 'ПоОригиналамНаладных',
      form: listItem.payment.form,
      delay: 30,
      delay_type: 'CalendarDays',
      currency_code: listItem.payment.currency_code,
      prepay: '0',
    },
    assembly: { num: null, date: null },
    routes: [
      {
        row_num: 1,
        op_type: 'Loading',
        start_date: listItem.route.load.date,
        end_date: listItem.route.load.date,
        comment: null,
        contractor: listItem.organizer.organization_name,
        contractor_inn: listItem.organizer.organization_inn,
        location: {
          city_name: listItem.route.load.city,
          city_full_name: `${listItem.route.load.city}, Россия`,
          city_gc_id: listItem.route.load.city_gc_id,
          loading_address: options.hide_points ? '' : listItem.route.load.address,
          lon: 56.238,
          lat: 58.01,
        },
        cargo: {
          name: listItem.cargo.name,
          package_name: 'паллеты',
          weight: listItem.cargo.weight.toFixed(3),
          volume: listItem.cargo.volume.toFixed(3),
          length: '0',
          width: '0',
          height: '0',
          oversized: false,
          package_amount: null,
        },
        contact: options.hide_points
          ? { name: '', phone: '' }
          : { name: 'Петров П.П.', phone: '+79001112233' },
      },
      {
        row_num: 2,
        op_type: 'Unloading',
        start_date: listItem.route.unload.date,
        end_date: listItem.route.unload.date,
        comment: null,
        contractor: '',
        contractor_inn: '',
        location: {
          city_name: listItem.route.unload.city,
          city_full_name: `${listItem.route.unload.city}, Россия`,
          city_gc_id: listItem.route.unload.city_gc_id,
          loading_address: options.hide_points ? '' : listItem.route.unload.address,
          lon: 37.617,
          lat: 55.755,
        },
        cargo: {
          name: listItem.cargo.name,
          package_name: '',
          weight: listItem.cargo.weight.toFixed(3),
          volume: listItem.cargo.volume.toFixed(3),
          length: '0',
          width: '0',
          height: '0',
          oversized: false,
          package_amount: null,
        },
        contact: { name: '', phone: '' },
      },
    ],
    admitted_organizations: [
      {
        id: 14,
        inn: '9616244307',
        is_main: true,
        name: 'ООО Перевозчик',
        full_name: 'Общество с ограниченной ответственностью Перевозчик',
        site: null,
        subscriber_id: 13,
        subscriber_code: '54321',
        subscriber_role: null,
        infobase_code: 'RU_Cargo_01',
        infobase_address: null,
        nalog_key: null,
        hide_me: false,
        current_vat_rate: '22',
      },
    ],
    hide_bets_history: options.hide_bets_history ?? false,
  }
}

function createInitialBets(auctionId: number, currentPrice: number): BetItem[] {
  return [
    {
      id: auctionId * 100 + 1,
      created_at: '2026-05-25T16:05:00',
      auction_id: auctionId,
      subscriber_id: 20,
      contact_name: 'Сидоров А.А.',
      contact_phone: '+79003334455',
      price_with_vat: currentPrice,
      price_no_vat: Math.round((currentPrice / 1.22) * 100) / 100,
      organization_id: 20,
      organization_inn: '7701234567',
      organization_name: 'ООО Быстрая Доставка',
      transporter_comment: null,
      is_rejected: false,
      is_counter: false,
      place: 1,
      is_win: false,
      run_number: 0,
      cancel_reason: '',
      price_info: {
        price_with_vat: currentPrice,
        price_no_vat: Math.round((currentPrice / 1.22) * 100) / 100,
        payment_type: 'Безналичная с НДС',
        vat_rate: '22',
      },
    },
    {
      id: auctionId * 100 + 2,
      created_at: '2026-05-25T16:03:00',
      auction_id: auctionId,
      subscriber_id: 21,
      contact_name: 'Козлов В.В.',
      contact_phone: '',
      price_with_vat: currentPrice + 1000,
      price_no_vat: Math.round(((currentPrice + 1000) / 1.22) * 100) / 100,
      organization_id: 21,
      organization_inn: '7707654321',
      organization_name: 'ИП Козлов',
      transporter_comment: null,
      is_rejected: true,
      is_counter: false,
      place: 2,
      is_win: false,
      run_number: 0,
      cancel_reason: 'Ставка отменена организатором',
      price_info: {
        price_with_vat: currentPrice + 1000,
        price_no_vat: Math.round(((currentPrice + 1000) / 1.22) * 100) / 100,
        payment_type: 'Безналичная с НДС',
        vat_rate: '22',
      },
    },
  ]
}

function buildSeedData(): MockAuctionRecord[] {
  const items: MockAuctionRecord[] = []

  const list1 = createListItem({
    id: 1236,
    uuid: UUID_1,
    cargo_num: '00000001059',
    auc_type: 'Down',
    load_city: 'Пермь',
    unload_city: 'Москва',
    current_price: 28500,
    can_set_bet: true,
    is_available: true,
  })
  items.push({
    uuid: UUID_1,
    listItem: list1,
    detail: createDetailFromList(list1, { available: 28000, step: 500 }),
    bets: createInitialBets(1236, 28500),
  })

  const list2 = createListItem({
    id: 1237,
    uuid: UUID_2,
    cargo_num: '00000001060',
    auc_type: 'Up',
    load_city: 'Екатеринбург',
    unload_city: 'Казань',
    cargo_name: 'Стройматериалы',
    current_price: 45000,
    status_mobile: 'Leading',
    has_bet: true,
    last_bet: 45000,
    is_bidder: true,
    can_set_bet: true,
  })
  items.push({
    uuid: UUID_2,
    listItem: list2,
    detail: createDetailFromList(list2, { available: 45500, step: 1000, min: 40000, max: 60000 }),
    bets: [
      ...createInitialBets(1237, 44000),
      {
        id: 123702,
        created_at: '2026-05-25T17:00:00',
        auction_id: 1237,
        subscriber_id: 13,
        contact_name: 'Текущий пользователь',
        contact_phone: '+79009998877',
        price_with_vat: 45000,
        price_no_vat: 36885.25,
        organization_id: 14,
        organization_inn: '9616244307',
        organization_name: 'ООО Перевозчик',
        transporter_comment: null,
        is_rejected: false,
        is_counter: false,
        place: 1,
        is_win: false,
        run_number: 0,
        cancel_reason: '',
        price_info: {
          price_with_vat: 45000,
          price_no_vat: 36885.25,
          payment_type: 'Безналичная с НДС',
          vat_rate: '22',
        },
      },
    ],
  })

  const list3 = createListItem({
    id: 1238,
    uuid: UUID_3,
    cargo_num: '00000001061',
    auc_type: 'FixPrice',
    load_city: 'Санкт-Петербург',
    unload_city: 'Новосибирск',
    cargo_name: 'Оборудование',
    current_price: 120000,
    status: 'Finished',
    status_mobile: 'Winner',
    has_bet: true,
    last_bet: 120000,
    is_bidder: true,
    can_set_bet: false,
    is_available: false,
  })
  items.push({
    uuid: UUID_3,
    listItem: list3,
    detail: createDetailFromList(list3),
    bets: createInitialBets(1238, 120000).map((b, i) =>
      i === 0
        ? { ...b, is_win: true, subscriber_id: 13, organization_name: 'ООО Перевозчик', place: 1 }
        : b,
    ),
  })

  const list4 = createListItem({
    id: 1239,
    uuid: UUID_4,
    cargo_num: '00000001062',
    auc_type: 'Request',
    load_city: 'Москва',
    unload_city: 'Самара',
    cargo_name: 'Продукты питания',
    current_price: 55000,
    hide_points: true,
    can_set_bet: true,
  })
  const detail4 = createDetailFromList(list4, { hide_points: true, hide_bets_history: true })
  items.push({
    uuid: UUID_4,
    listItem: list4,
    detail: detail4,
    bets: [],
  })

  const list5 = createListItem({
    id: 1240,
    uuid: UUID_5,
    cargo_num: '00000001063',
    auc_type: 'Down',
    load_city: 'Челябинск',
    unload_city: 'Уфа',
    cargo_name: 'Металлопрокат',
    weight: 20,
    volume: 0,
    body_type: 'открытый',
    current_price: 75000,
    status_mobile: 'Losing',
    has_bet: true,
    last_bet: 76000,
    is_bidder: true,
    can_set_bet: true,
  })
  items.push({
    uuid: UUID_5,
    listItem: list5,
    detail: createDetailFromList(list5, {
      available: 74500,
      step: 500,
      no_view_cargo_price: true,
    }),
    bets: createInitialBets(1240, 74500),
  })

  // Generate more items for pagination
  for (let i = 6; i <= 25; i++) {
    const uuid = `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`
    const cities = [
      ['Пермь', 'Москва'],
      ['Екатеринбург', 'Санкт-Петербург'],
      ['Казань', 'Новосибирск'],
      ['Самара', 'Челябинск'],
      ['Уфа', 'Красноярск'],
    ]
    const [load, unload] = cities[i % cities.length]
    const types: AuctionListItem['main']['auc_type'][] = ['Down', 'Up', 'FixPrice', 'Request']
    const list = createListItem({
      id: 1240 + i,
      uuid,
      cargo_num: `0000000${1060 + i}`,
      auc_type: types[i % types.length],
      load_city: load,
      unload_city: unload,
      cargo_name: `Груз #${i}`,
      current_price: 20000 + i * 1500,
      can_set_bet: i % 3 !== 0,
      is_available: i % 4 !== 0,
    })
    items.push({
      uuid,
      listItem: list,
      detail: createDetailFromList(list),
      bets: i % 5 === 0 ? [] : createInitialBets(1240 + i, 20000 + i * 1500),
    })
  }

  return items
}

function createStoreState() {
  return {
    auctions: buildSeedData(),
    nextBetId: 100000,
  }
}

export const mockStore = {
  ...createStoreState(),

  reset() {
    const next = createStoreState()
    this.auctions = next.auctions
    this.nextBetId = next.nextBetId
  },

  findByUuid(uuid: string) {
    return this.auctions.find((a) => a.uuid === uuid)
  },

  findById(id: number) {
    return this.auctions.find((a) => a.listItem.main.id === id)
  },

  /**
   * Recompute places for active bets by auction economics:
   * Down/FixPrice — lower price is better; Up/Request — higher price is better.
   */
  recomputeBetPlaces(record: MockAuctionRecord) {
    const aucType = record.detail.main.auc_type
    const ascending = aucType === 'Down' || aucType === 'FixPrice'
    const active = record.bets.filter((b) => !b.is_rejected)
    const rejected = record.bets.filter((b) => b.is_rejected)

    active.sort((a, b) => {
      const diff = a.price_with_vat - b.price_with_vat
      return ascending ? diff : -diff
    })

    active.forEach((bet, index) => {
      bet.place = index + 1
    })
    rejected.forEach((bet) => {
      bet.place = null
    })

    record.bets = [...active, ...rejected]
  },

  syncListFromDetail(record: MockAuctionRecord) {
    const d = record.detail
    record.listItem.trading.status = d.trading.status
    // List DTO uses a narrower inline enum than TradingStatus — map unknown values.
    const listStatuses = [
      'NotParticipating',
      'Leading',
      'Losing',
      'Winner',
      'Confirmed',
      'Unknown',
    ] as const
    record.listItem.trading.status_mobile = listStatuses.includes(
      d.trading.status_mobile as (typeof listStatuses)[number],
    )
      ? (d.trading.status_mobile as (typeof listStatuses)[number])
      : 'Unknown'
    record.listItem.trading.can_set_bet = d.trading.can_set_bet
    record.listItem.trading.is_bidder = d.trading.is_bidder
    // is_available is an independent list flag — keep existing seed/list value
    record.listItem.trading.price = {
      start: d.trading.price.start ?? 0,
      current: d.trading.price.current ?? 0,
      current_no_vat: d.trading.price.current_no_vat ?? 0,
    }
    record.listItem.trading.your = {
      bet: d.trading.your.bet,
      last_bet: d.trading.your.last_bet,
    }
  },
}

export type MockStore = typeof mockStore
