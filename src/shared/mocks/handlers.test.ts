import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '@/shared/mocks/handlers'
import { mockStore } from '@/shared/mocks/store'
import { CURRENT_USER_SUBSCRIBER_ID } from '@/shared/config/constants'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  mockStore.reset()
})
afterAll(() => server.close())

const UUID_DOWN = '3a05d045-0e67-4f85-b20a-de81d18bba7a'
const UUID_FINISHED = '550e8400-e29b-41d4-a716-446655440002'
const UUID_HIDDEN = '550e8400-e29b-41d4-a716-446655440003'

describe('MSW auction handlers', () => {
  it('filters list by load_city and paginates', async () => {
    const response = await fetch('/api/v1/auctions/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ load_city: 'Пермь', page: 1, per_page: 5 }),
    })

    expect(response.status).toBe(200)
    const json = (await response.json()) as {
      data: Array<{ route: { load: { city: string; city_gc_id: number } } }>
      meta: { total: number; per_page: number }
    }

    expect(json.data.length).toBeGreaterThan(0)
    expect(json.data.every((item) => item.route.load.city === 'Пермь')).toBe(true)
    expect(json.data[0].route.load.city_gc_id).toBe(59)
    expect(json.meta.per_page).toBe(5)
  })

  it('filters by load_gc_id using correct city_gc_id from seed', async () => {
    const response = await fetch('/api/v1/auctions/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ load_gc_id: 102 }),
    })

    const json = (await response.json()) as {
      data: Array<{ route: { load: { city: string; city_gc_id: number } } }>
    }

    expect(json.data.length).toBeGreaterThan(0)
    expect(json.data.every((item) => item.route.load.city_gc_id === 102)).toBe(true)
    expect(json.data.every((item) => item.route.load.city === 'Екатеринбург')).toBe(true)
  })

  it('returns 422 for per_page > 100', async () => {
    const response = await fetch('/api/v1/auctions/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ per_page: 101 }),
    })

    expect(response.status).toBe(422)
    const json = (await response.json()) as { code: string; errors: Array<{ field: string }> }
    expect(json.code).toBe('validation_failed')
    expect(json.errors[0].field).toBe('per_page')
  })

  it('returns 404 for unknown auction', async () => {
    const response = await fetch('/api/v1/auctions/missing-uuid')
    expect(response.status).toBe(404)
  })

  it('rejects bet when can_set_bet is false', async () => {
    const response = await fetch(`/api/v1/auctions/${UUID_FINISHED}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 100000 }),
    })

    expect(response.status).toBe(422)
    const json = (await response.json()) as { code: string }
    expect(json.code).toBe('business_rule_violation')
  })

  it('returns 422 validation error when price is below min', async () => {
    const response = await fetch(`/api/v1/auctions/${UUID_DOWN}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 100 }),
    })

    expect(response.status).toBe(422)
    const json = (await response.json()) as {
      code: string
      errors: Array<{ field: string; code: string }>
    }
    expect(json.code).toBe('validation_failed')
    expect(json.errors[0]).toMatchObject({ field: 'price', code: 'min_value' })
  })

  it('accepts a valid bet and updates store state', async () => {
    const before = mockStore.findByUuid(UUID_DOWN)!
    const available = before.detail.trading.price.available!
    const isAvailableBefore = before.listItem.trading.is_available

    const response = await fetch(`/api/v1/auctions/${UUID_DOWN}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: available }),
    })

    expect(response.status).toBe(200)

    const after = mockStore.findByUuid(UUID_DOWN)!
    expect(after.detail.trading.price.current).toBe(available)
    expect(after.detail.trading.status_mobile).toBe('Leading')
    expect(after.detail.trading.your.bet).toBe(true)
    expect(after.detail.trading.your.last_bet).toBe(available)
    expect(after.listItem.trading.your?.bet).toBe(true)
    expect(after.listItem.trading.is_available).toBe(isAvailableBefore)

    const myBet = after.bets.find((b) => b.subscriber_id === CURRENT_USER_SUBSCRIBER_ID)
    expect(myBet).toBeDefined()
    expect(myBet?.place).toBe(1)
  })

  it('recomputes places by price for Down auctions', async () => {
    const record = mockStore.findByUuid(UUID_DOWN)!
    record.bets = [
      {
        ...record.bets[0],
        id: 1,
        subscriber_id: 20,
        price_with_vat: 29000,
        is_rejected: false,
        place: 1,
      },
      {
        ...record.bets[0],
        id: 2,
        subscriber_id: 21,
        price_with_vat: 27000,
        is_rejected: false,
        place: 2,
      },
    ]

    await fetch(`/api/v1/auctions/${UUID_DOWN}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 28000 }),
    })

    const after = mockStore.findByUuid(UUID_DOWN)!
    const active = after.bets.filter((b) => !b.is_rejected)
    expect(active.map((b) => b.price_with_vat)).toEqual([27000, 28000, 29000])
    expect(active.map((b) => b.place)).toEqual([1, 2, 3])
  })

  it('keeps hide_bets_history flag on detail for hidden auction', async () => {
    const response = await fetch(`/api/v1/auctions/${UUID_HIDDEN}`)
    expect(response.status).toBe(200)
    const json = (await response.json()) as {
      hide_bets_history: boolean
      trading: { hide_bets_history: boolean }
    }
    expect(json.hide_bets_history).toBe(true)
    expect(json.trading.hide_bets_history).toBe(true)
  })
})
