import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AuctionShowResponse } from '@/shared/api/types'
import { ToastProvider } from '@/shared/ui/toast.component'
import { SetBetForm } from '@/features/set-bet/ui/set-bet-form.component'

const mutateAsync = vi.fn()

vi.mock('@/entities/auction/api/mutations', async () => {
  const actual = await vi.importActual<typeof import('@/entities/auction/api/mutations')>(
    '@/entities/auction/api/mutations',
  )
  return {
    ...actual,
    useSetBetMutation: () => ({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    }),
  }
})

function createAuction(overrides?: Partial<AuctionShowResponse['trading']>): AuctionShowResponse {
  return {
    main: {
      id: 1,
      cargo_num: '00000001059',
      cargo_date: '2026-05-04T14:49:09',
      order_uid: '3a05d045-0e67-4f85-b20a-de81d18bba7a',
      auc_type: 'Down',
      created_at: '2026-05-25T11:48:20',
    },
    organizer: {
      subscriber_id: 98,
      subscriber_code: '12345',
      infobase_code: 'RU_Cargo_01',
      organization_name: 'ЛИМ',
      organization_inn: '7703769184',
      organization_kpp: '770301001',
      organization_id: 340,
    },
    contacts: [],
    cargo: {
      price: '150000',
      currency: 643,
      is_international: false,
      distance: 1500,
      truck_count: 1,
      body_type: 'тентованный',
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: false, t1: false, med: false },
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
      hide_bets_history: false,
      hide_places: false,
      no_view_cargo_price: false,
      hide_points_address_and_contacts: false,
      is_bidder: false,
      is_favorite: false,
      price: {
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
      },
      your: {
        bet: false,
        last_bet: null,
        last_bet_with_vat: null,
        win: false,
      },
      settings: {
        prolong_after_bet: 10,
        winner_confirm: 1,
        transmission_time_in: 24,
        coefficient: 10,
      },
      ...overrides,
    },
    payment: {
      condition: null,
      form: 'Безналичная с НДС',
      delay: 30,
      delay_type: 'CalendarDays',
      currency_code: '643',
      prepay: '0',
    },
    assembly: { num: null, date: null },
    routes: [],
    admitted_organizations: [],
  }
}

function renderForm(auction: AuctionShowResponse) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <SetBetForm auction={auction} auctionUuid={auction.main.order_uid} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('SetBetForm', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue(undefined)
  })

  it('shows unavailable state when can_set_bet is false', () => {
    renderForm(createAuction({ can_set_bet: false }))

    expect(screen.getByText('Ставка недоступна')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Цена ставки/)).not.toBeInTheDocument()
  })

  it('renders form with recommended price and submits valid bet', async () => {
    const user = userEvent.setup()
    renderForm(createAuction())

    const priceInput = screen.getByLabelText(/Цена ставки/)
    expect(priceInput).toHaveValue(29500)

    await user.clear(priceInput)
    await user.type(priceInput, '29000')
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }))

    expect(mutateAsync).toHaveBeenCalledWith({ price: 29000 })
  })

  it('shows client validation error for price below min', async () => {
    const user = userEvent.setup()
    renderForm(createAuction())

    const priceInput = screen.getByLabelText(/Цена ставки/)
    await user.clear(priceInput)
    await user.type(priceInput, '10000')
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Минимальная ставка/)
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
