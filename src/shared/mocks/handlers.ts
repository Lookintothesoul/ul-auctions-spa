import { http, HttpResponse, delay } from 'msw'
import type {
  AuctionListRequest,
  AuctionListResponse,
  BetListResponse,
  SetBetRequest,
  ValidationProblem,
} from '@/shared/api/types'
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  CURRENT_USER_SUBSCRIBER_ID,
} from '@/shared/config/constants'
import { getCityGcId } from '@/shared/config/cities'
import { mockStore } from '@/shared/mocks/store'

const API = '/api/v1'

function filterAuctions(body: AuctionListRequest = {}) {
  let items = [...mockStore.auctions]

  if (body.cargo_num) {
    const q = body.cargo_num.toLowerCase()
    items = items.filter((a) => a.listItem.main.cargo_num.toLowerCase().includes(q))
  }

  if (body.status?.length) {
    items = items.filter((a) => body.status!.includes(a.listItem.trading.status_mobile))
  }

  if (body.statuses?.length) {
    const statusNames = body.statuses.map((n) => {
      const map: Record<number, string> = {
        1: 'Planning',
        2: 'Auction',
        3: 'DeterminateWinner',
        4: 'WaitDeal',
        5: 'InProgress',
        6: 'Finished',
        7: 'Stopped',
        8: 'Canceled',
      }
      return map[n]
    })
    items = items.filter((a) => statusNames.includes(a.listItem.trading.status))
  }

  if (body.auc_type?.length) {
    items = items.filter((a) => body.auc_type!.includes(a.listItem.main.auc_type as never))
  }

  if (body.load_city) {
    items = items.filter((a) => a.listItem.route.load.city === body.load_city)
  } else if (body.load_gc_id) {
    items = items.filter((a) => a.listItem.route.load.city_gc_id === body.load_gc_id)
  }

  if (body.unload_city) {
    items = items.filter((a) => a.listItem.route.unload.city === body.unload_city)
  } else if (body.unload_gc_id) {
    items = items.filter((a) => a.listItem.route.unload.city_gc_id === body.unload_gc_id)
  }

  if (body.load_date_from) {
    const from = new Date(body.load_date_from).getTime()
    items = items.filter((a) => new Date(a.listItem.route.load.date).getTime() >= from)
  }

  if (body.load_date_to) {
    const to = new Date(body.load_date_to).getTime()
    items = items.filter((a) => new Date(a.listItem.route.load.date).getTime() <= to)
  }

  if (body.is_available === true) {
    items = items.filter((a) => a.listItem.trading.is_available)
  } else if (body.is_available === false) {
    items = items.filter((a) => !a.listItem.trading.is_available)
  }

  if (body.is_bidder === true) {
    items = items.filter((a) => a.listItem.trading.is_bidder)
  } else if (body.is_bidder === false) {
    items = items.filter((a) => !a.listItem.trading.is_bidder)
  }

  if (body.current_price_from != null) {
    items = items.filter(
      (a) => (a.listItem.trading.price?.current ?? 0) >= body.current_price_from!,
    )
  }

  if (body.current_price_to != null) {
    items = items.filter((a) => (a.listItem.trading.price?.current ?? 0) <= body.current_price_to!)
  }

  return items
}

function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(Math.max(1, page), lastPage)
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const to = Math.min(currentPage * perPage, total)
  const data = items.slice((currentPage - 1) * perPage, currentPage * perPage)

  return {
    data,
    meta: {
      current_page: currentPage,
      from,
      last_page: lastPage,
      per_page: perPage,
      to,
      total,
    },
  }
}

function validateBetPrice(price: number, auctionUuid: string): ValidationProblem | null {
  const record = mockStore.findByUuid(auctionUuid)
  if (!record) return null

  const { min, max, step } = record.detail.trading.price

  if (price <= 0) {
    return {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      trace_id: crypto.randomUUID().replace(/-/g, ''),
      errors: [{ field: 'price', message: 'Цена должна быть больше 0.', code: 'min_value' }],
    }
  }

  if (min != null && price < min) {
    return {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      trace_id: crypto.randomUUID().replace(/-/g, ''),
      errors: [
        {
          field: 'price',
          message: `Минимальная ставка: ${min.toLocaleString('ru-RU')} ₽`,
          code: 'min_value',
        },
      ],
    }
  }

  if (max != null && price > max) {
    return {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      trace_id: crypto.randomUUID().replace(/-/g, ''),
      errors: [
        {
          field: 'price',
          message: `Максимальная ставка: ${max.toLocaleString('ru-RU')} ₽`,
          code: 'max_value',
        },
      ],
    }
  }

  if (step != null && min != null) {
    const diff = Math.round((price - min) * 100) / 100
    const steps = Math.round(diff / step)
    if (Math.abs(diff - steps * step) > 0.01) {
      return {
        code: 'validation_failed',
        title: 'Ошибка валидации',
        message: 'Запрос содержит некорректные поля.',
        trace_id: crypto.randomUUID().replace(/-/g, ''),
        errors: [
          {
            field: 'price',
            message: `Ставка должна быть кратна шагу ${step.toLocaleString('ru-RU')} ₽`,
            code: 'step_mismatch',
          },
        ],
      }
    }
  }

  return null
}

export const handlers = [
  http.post(`${API}/auctions/list`, async ({ request }) => {
    await delay(300)
    const body = (await request.json().catch(() => ({}))) as AuctionListRequest
    const page = body.page ?? DEFAULT_PAGE
    const perPage = body.per_page ?? DEFAULT_PER_PAGE

    if (perPage > 100) {
      const problem: ValidationProblem = {
        code: 'validation_failed',
        title: 'Ошибка валидации',
        message: 'Запрос содержит некорректные поля.',
        trace_id: crypto.randomUUID().replace(/-/g, ''),
        errors: [
          { field: 'per_page', message: 'Значение должно быть не больше 100.', code: 'max_value' },
        ],
      }
      return HttpResponse.json(problem, { status: 422 })
    }

    const filtered = filterAuctions(body)
    const paged = paginate(filtered, page, perPage)

    const response: AuctionListResponse = {
      data: paged.data.map((a) => a.listItem),
      meta: paged.meta,
    }

    return HttpResponse.json(response)
  }),

  http.get(`${API}/auctions/:auctionUuid`, async ({ params }) => {
    await delay(200)
    const uuid = params.auctionUuid as string
    const record = mockStore.findByUuid(uuid)

    if (!record) {
      return HttpResponse.json(
        {
          code: 'resource_not_found',
          title: 'Не найдено',
          message: 'Аукцион не найден',
          trace_id: null,
        },
        { status: 404 },
      )
    }

    return HttpResponse.json(record.detail)
  }),

  http.get(`${API}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
    await delay(200)
    const uuid = params.auctionUuid as string
    const record = mockStore.findByUuid(uuid)

    if (!record) {
      return HttpResponse.json(
        {
          code: 'resource_not_found',
          title: 'Не найдено',
          message: 'Аукцион не найден',
          trace_id: null,
        },
        { status: 404 },
      )
    }

    const url = new URL(request.url)
    const all = url.searchParams.get('all') === 'true'
    let bets = [...record.bets]

    if (!all) {
      bets = bets.filter((b) => !b.is_rejected || b.cancel_reason === '')
    }

    bets.sort((a, b) => (a.place ?? 999) - (b.place ?? 999))

    const response: BetListResponse = { bets }
    return HttpResponse.json(response)
  }),

  http.post(`${API}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
    await delay(400)
    const uuid = params.auctionUuid as string
    const record = mockStore.findByUuid(uuid)

    if (!record) {
      return HttpResponse.json(
        {
          code: 'resource_not_found',
          title: 'Не найдено',
          message: 'Аукцион не найден',
          trace_id: null,
        },
        { status: 404 },
      )
    }

    if (!record.detail.trading.can_set_bet) {
      return HttpResponse.json(
        {
          code: 'business_rule_violation',
          title: 'Действие недоступно',
          message: 'Установка ставки недоступна для данного аукциона',
          trace_id: null,
        },
        { status: 422 },
      )
    }

    const body = (await request.json()) as SetBetRequest
    const validation = validateBetPrice(body.price, uuid)

    if (validation) {
      return HttpResponse.json(validation, { status: 422 })
    }

    const aucType = record.detail.main.auc_type
    const currentPrice = record.detail.trading.price.current ?? body.price
    const isDown = aucType === 'Down' || aucType === 'FixPrice'
    const isBetter = isDown ? body.price < currentPrice : body.price > currentPrice

    mockStore.nextBetId += 1
    const newBet = {
      id: mockStore.nextBetId,
      created_at: new Date().toISOString(),
      auction_id: record.listItem.main.id,
      subscriber_id: CURRENT_USER_SUBSCRIBER_ID,
      contact_name: 'Текущий пользователь',
      contact_phone: '+79009998877',
      price_with_vat: body.price,
      price_no_vat: Math.round((body.price / 1.22) * 100) / 100,
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
        price_with_vat: body.price,
        price_no_vat: Math.round((body.price / 1.22) * 100) / 100,
        payment_type: 'Безналичная с НДС',
        vat_rate: '22',
      },
    }

    record.bets = record.bets.filter((b) => b.subscriber_id !== CURRENT_USER_SUBSCRIBER_ID)
    record.bets.unshift(newBet)

    record.bets.forEach((bet, index) => {
      bet.place = index + 1
    })

    if (isBetter || aucType === 'Request') {
      record.detail.trading.price.current = body.price
      record.detail.trading.price.current_no_vat = newBet.price_no_vat
      record.detail.trading.price.available = isDown
        ? body.price - (record.detail.trading.price.step ?? 500)
        : body.price + (record.detail.trading.price.step ?? 500)
      record.detail.trading.status_mobile = 'Leading'
    } else {
      record.detail.trading.status_mobile = 'Losing'
    }

    record.detail.trading.your = {
      bet: true,
      last_bet: body.price,
      last_bet_with_vat: body.price,
      win: false,
    }
    record.detail.trading.is_bidder = true

    mockStore.syncListFromDetail(record)

    return new HttpResponse(null, { status: 200 })
  }),
]

// Re-export for tests
export { getCityGcId }
