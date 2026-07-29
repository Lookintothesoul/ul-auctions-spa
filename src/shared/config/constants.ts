export const API_BASE_URL = '/api/v1'

export const DEFAULT_PAGE = 1
export const DEFAULT_PER_PAGE = 10
export const MAX_PER_PAGE = 100

export const AUCTION_STATUS_MAP: Record<number, string> = {
  1: 'Planning',
  2: 'Auction',
  3: 'DeterminateWinner',
  4: 'WaitDeal',
  5: 'InProgress',
  6: 'Finished',
  7: 'Stopped',
  8: 'Canceled',
}

export const CURRENT_USER_SUBSCRIBER_ID = 13
