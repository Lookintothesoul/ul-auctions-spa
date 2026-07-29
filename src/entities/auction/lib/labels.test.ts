import { describe, expect, it } from 'vitest'
import { resolveAuctionCardAction } from '@/entities/auction/lib/labels'

describe('resolveAuctionCardAction', () => {
  it('returns set_bet when user can participate and has no bet', () => {
    expect(
      resolveAuctionCardAction({
        trading: {
          can_set_bet: true,
          status: 'Auction',
          your: { bet: false },
        },
      }),
    ).toEqual({ type: 'set_bet', label: 'Сделать ставку' })
  })

  it('returns change_bet when user already has a bet', () => {
    expect(
      resolveAuctionCardAction({
        trading: {
          can_set_bet: true,
          status: 'Auction',
          your: { bet: true },
        },
      }),
    ).toEqual({ type: 'change_bet', label: 'Изменить ставку' })
  })

  it('returns view_bets when betting is not allowed', () => {
    expect(
      resolveAuctionCardAction({
        trading: {
          can_set_bet: false,
          status: 'Auction',
          your: null,
        },
      }),
    ).toEqual({ type: 'view_bets', label: 'Смотреть ставки' })
  })

  it('disables action for finished auctions', () => {
    expect(
      resolveAuctionCardAction({
        trading: {
          can_set_bet: true,
          status: 'Finished',
          your: { bet: true },
        },
      }),
    ).toEqual({ type: 'disabled', label: 'Торги завершены' })
  })
})
