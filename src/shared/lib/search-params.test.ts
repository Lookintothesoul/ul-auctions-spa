import { describe, expect, it } from 'vitest'
import {
  parseAuctionSearchParams,
  searchParamsToFilters,
  filtersToSearchParams,
  mergeSearchParams,
  serializeSearchParams,
  defaultSearchParams,
  countActiveFilters,
  getActiveFilterChips,
  type AuctionSearchParams,
} from '@/features/auction-filters/model/search-params'
import { mapAuctionListItemToCard } from '@/entities/auction/lib/mappers'
import { createBetFormSchema } from '@/features/set-bet/model/bet-form.schema'
import type { AuctionListItem } from '@/shared/api/types'

describe('parseAuctionSearchParams', () => {
  it('applies safe fallbacks for invalid values', () => {
    const result = parseAuctionSearchParams({
      page: '-1',
      per_page: '999',
      cargo_num: 123,
      is_available: 'maybe',
    })

    expect(result.page).toBe(1)
    expect(result.per_page).toBe(10)
    expect(result.cargo_num).toBe('123')
    expect(result.is_available).toBeUndefined()
  })

  it('parses comma-separated arrays from URL strings', () => {
    const result = parseAuctionSearchParams({
      status: 'Leading,Losing',
      auc_type: 'Down,Up',
      statuses: '2,6',
    })

    expect(result.status).toEqual(['Leading', 'Losing'])
    expect(result.auc_type).toEqual(['Down', 'Up'])
    expect(result.statuses).toEqual([2, 6])
  })

  it('parses arrays from router state', () => {
    const result = parseAuctionSearchParams({
      status: ['Leading'],
      auc_type: ['Down'],
      statuses: [2],
    })

    expect(result.status).toEqual(['Leading'])
    expect(result.auc_type).toEqual(['Down'])
    expect(result.statuses).toEqual([2])
  })

  it('parses boolean filters', () => {
    const result = parseAuctionSearchParams({
      is_available: 'true',
      is_bidder: 'false',
    })

    expect(result.is_available).toBe(true)
    expect(result.is_bidder).toBe(false)
  })
})

describe('mergeSearchParams', () => {
  it('clears filters when empty values are passed', () => {
    const current: AuctionSearchParams = {
      ...defaultSearchParams,
      load_city: 'Пермь',
      status: ['Leading'],
      is_available: true,
      current_price_from: 10000,
    }

    const next = mergeSearchParams(current, {
      load_city: '',
      status: [],
      is_available: undefined,
      current_price_from: undefined,
    })

    expect(next.load_city).toBe('')
    expect(next.status).toEqual([])
    expect(next.is_available).toBeUndefined()
    expect(next.current_price_from).toBeUndefined()
  })
})

describe('serializeSearchParams', () => {
  it('omits empty values from URL payload', () => {
    const serialized = serializeSearchParams({
      ...defaultSearchParams,
      load_city: 'Пермь',
      status: ['Leading'],
    })

    expect(serialized.load_city).toBe('Пермь')
    expect(serialized.status).toBe('Leading')
    expect(serialized.cargo_num).toBeUndefined()
    expect(serialized.is_available).toBeUndefined()
  })
})

describe('searchParamsToFilters', () => {
  it('builds API request omitting empty fields', () => {
    const filters = searchParamsToFilters({
      ...defaultSearchParams,
      page: 2,
      cargo_num: '00000001059',
      load_city: 'Пермь',
      current_price_from: 10000,
    })

    expect(filters).toEqual({
      page: 2,
      per_page: defaultSearchParams.per_page,
      cargo_num: '00000001059',
      load_city: 'Пермь',
      current_price_from: 10000,
    })
  })
})

describe('filtersToSearchParams', () => {
  it('serializes filters back to URL search params', () => {
    const params = filtersToSearchParams({
      ...defaultSearchParams,
      status: ['Leading'],
      auc_type: ['Down'],
      is_available: true,
    })

    expect(params.status).toBe('Leading')
    expect(params.auc_type).toBe('Down')
    expect(params.is_available).toBe('true')
    expect(params.cargo_num).toBeUndefined()
  })
})

describe('mapAuctionListItemToCard', () => {
  const item: AuctionListItem = {
    main: {
      id: 1,
      cargo_num: '00000001059',
      cargo_date: '2026-05-04T14:49:09',
      auc_type: 'Down',
      order_uid: '3a05d045-0e67-4f85-b20a-de81d18bba7a',
      created_at: '2026-05-25T11:48:20',
      priority_sort: 0,
      is_assembly: false,
      price_per_km: 199,
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
        city: 'Пермь',
        address: 'Транспортная 9',
        date: '2026-05-26T09:00:00',
        city_gc_id: 59,
        points_count: 1,
      },
      unload: {
        city: 'Москва',
        address: 'ул. Ленина 1',
        date: '2026-05-28T18:00:00',
        city_gc_id: 100,
        points_count: 1,
      },
    },
    cargo: {
      name: 'Мороженое',
      weight: 10,
      volume: 20,
      body_type: 'тентованный',
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
      status: 'Auction',
      status_mobile: 'NotParticipating',
      start_time: '2026-05-25T16:03:00',
      stop_time: '2026-05-25T18:00:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      allow_counter_bets: true,
      hide_points_address_and_contacts: false,
      direction: '',
      comment: '',
      is_bidder: false,
      is_available: true,
      is_accredited: true,
      is_favorite: false,
      price: { start: 35000, current: 30000, current_no_vat: 24590 },
      your: { bet: false, last_bet: null },
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

  it('maps list item to card view model', () => {
    const vm = mapAuctionListItemToCard(item)

    expect(vm.uuid).toBe(item.main.order_uid)
    expect(vm.cargoNum).toBe('00000001059')
    expect(vm.loadCity).toBe('Пермь')
    expect(vm.unloadCity).toBe('Москва')
    expect(vm.hasBet).toBe(false)
  })
})

describe('createBetFormSchema', () => {
  const price = {
    start: 35000,
    start_no_vat: 28700,
    current: 30000,
    current_no_vat: 24590,
    available: 29500,
    available_no_vat: 24180,
    min: 20000,
    min_no_vat: 16393,
    max: 35000,
    max_no_vat: 28700,
    step: 500,
    step_no_vat: 410,
    price_per_km: 16.39,
  }

  it('rejects zero and negative prices', () => {
    const schema = createBetFormSchema(price)
    expect(schema.safeParse({ price: 0 }).success).toBe(false)
    expect(schema.safeParse({ price: -100 }).success).toBe(false)
  })

  it('validates min, max and step', () => {
    const schema = createBetFormSchema(price)

    expect(schema.safeParse({ price: 10000 }).success).toBe(false)
    expect(schema.safeParse({ price: 40000 }).success).toBe(false)
    expect(schema.safeParse({ price: 20250 }).success).toBe(false)
    expect(schema.safeParse({ price: 29500 }).success).toBe(true)
  })
})

describe('getActiveFilterChips', () => {
  it('covers every active filter counted by countActiveFilters', () => {
    const params: AuctionSearchParams = {
      ...defaultSearchParams,
      cargo_num: '00000001059',
      status: ['Leading'],
      statuses: [2],
      auc_type: ['Down'],
      load_city: 'Пермь',
      unload_city: 'Москва',
      load_date_from: '2026-05-26T09:00:00+03:00',
      load_date_to: '2026-05-28T18:00:00+03:00',
      is_available: true,
      is_bidder: true,
      current_price_from: 10000,
      current_price_to: 50000,
    }

    const chips = getActiveFilterChips(params)
    expect(chips).toHaveLength(countActiveFilters(params))
    expect(chips.map((c) => c.key)).toEqual(
      expect.arrayContaining([
        'cargo_num',
        'status:Leading',
        'statuses:2',
        'auc_type:Down',
        'load_city',
        'unload_city',
        'load_date_from',
        'load_date_to',
        'is_available',
        'is_bidder',
        'current_price_from',
        'current_price_to',
      ]),
    )
  })
})
