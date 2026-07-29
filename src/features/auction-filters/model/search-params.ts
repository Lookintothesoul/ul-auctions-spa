import { z } from 'zod'
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/shared/config/constants'

const tradingStatusEnum = z.enum([
  'NotParticipating',
  'Leading',
  'Losing',
  'OnPending',
  'Confirmed',
  'ChoosingWinner',
  'Winner',
  'Accepted',
  'Unknown',
])

const aucTypeEnum = z.enum(['Request', 'Up', 'Down', 'FixPrice'])

function toCommaString(value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(',')
  return String(value)
}

function toNumberArray(value: unknown): number[] {
  const raw = toCommaString(value)
  if (!raw) return []
  return raw
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n))
}

function toStringArray(value: unknown): string[] {
  const raw = toCommaString(value)
  if (!raw) return []
  return raw.split(',').filter(Boolean)
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value == null || value === '') return undefined
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export const auctionSearchParamsSchema = z.object({
  page: z.preprocess(
    (v) => (v == null || v === '' ? DEFAULT_PAGE : v),
    z.coerce.number().int().min(1).catch(DEFAULT_PAGE),
  ),
  per_page: z.preprocess(
    (v) => (v == null || v === '' ? DEFAULT_PER_PAGE : v),
    z.coerce.number().int().min(1).max(100).catch(DEFAULT_PER_PAGE),
  ),
  cargo_num: z.preprocess((v) => (v == null ? '' : String(v)), z.string().catch('')),
  status: z.preprocess((v) => toStringArray(v), z.array(tradingStatusEnum).catch([])),
  statuses: z.preprocess((v) => toNumberArray(v), z.array(z.number()).catch([])),
  auc_type: z.preprocess((v) => toStringArray(v), z.array(aucTypeEnum).catch([])),
  load_city: z.preprocess((v) => (v == null ? '' : String(v)), z.string().catch('')),
  unload_city: z.preprocess((v) => (v == null ? '' : String(v)), z.string().catch('')),
  load_date_from: z.preprocess((v) => (v == null ? '' : String(v)), z.string().catch('')),
  load_date_to: z.preprocess((v) => (v == null ? '' : String(v)), z.string().catch('')),
  is_available: z.preprocess((v) => toOptionalBoolean(v), z.boolean().optional().catch(undefined)),
  is_bidder: z.preprocess((v) => toOptionalBoolean(v), z.boolean().optional().catch(undefined)),
  current_price_from: z.preprocess(
    (v) => toOptionalNumber(v),
    z.number().optional().catch(undefined),
  ),
  current_price_to: z.preprocess(
    (v) => toOptionalNumber(v),
    z.number().optional().catch(undefined),
  ),
})

export type AuctionSearchParams = z.infer<typeof auctionSearchParamsSchema>

export const defaultSearchParams: AuctionSearchParams = {
  page: DEFAULT_PAGE,
  per_page: DEFAULT_PER_PAGE,
  cargo_num: '',
  status: [],
  statuses: [],
  auc_type: [],
  load_city: '',
  unload_city: '',
  load_date_from: '',
  load_date_to: '',
  is_available: undefined,
  is_bidder: undefined,
  current_price_from: undefined,
  current_price_to: undefined,
}

export function parseAuctionSearchParams(raw: Record<string, unknown>): AuctionSearchParams {
  return auctionSearchParamsSchema.parse(raw)
}

export function mergeSearchParams(
  current: AuctionSearchParams,
  updates: Partial<AuctionSearchParams>,
): AuctionSearchParams {
  const merged = { ...current, ...updates }

  if ('cargo_num' in updates && !updates.cargo_num) merged.cargo_num = ''
  if ('load_city' in updates && !updates.load_city) merged.load_city = ''
  if ('unload_city' in updates && !updates.unload_city) merged.unload_city = ''
  if ('load_date_from' in updates && !updates.load_date_from) merged.load_date_from = ''
  if ('load_date_to' in updates && !updates.load_date_to) merged.load_date_to = ''
  if ('status' in updates && !updates.status?.length) merged.status = []
  if ('statuses' in updates && !updates.statuses?.length) merged.statuses = []
  if ('auc_type' in updates && !updates.auc_type?.length) merged.auc_type = []
  if ('is_available' in updates && updates.is_available === undefined) {
    merged.is_available = undefined
  }
  if ('is_bidder' in updates && updates.is_bidder === undefined) {
    merged.is_bidder = undefined
  }
  if ('current_price_from' in updates && updates.current_price_from === undefined) {
    merged.current_price_from = undefined
  }
  if ('current_price_to' in updates && updates.current_price_to === undefined) {
    merged.current_price_to = undefined
  }

  return merged
}

export function searchParamsToFilters(params: AuctionSearchParams) {
  return {
    page: params.page,
    per_page: params.per_page,
    ...(params.cargo_num && { cargo_num: params.cargo_num }),
    ...(params.status.length && { status: params.status }),
    ...(params.statuses.length && { statuses: params.statuses }),
    ...(params.auc_type.length && { auc_type: params.auc_type }),
    ...(params.load_city && { load_city: params.load_city }),
    ...(params.unload_city && { unload_city: params.unload_city }),
    ...(params.load_date_from && { load_date_from: params.load_date_from }),
    ...(params.load_date_to && { load_date_to: params.load_date_to }),
    ...(params.is_available !== undefined && { is_available: params.is_available }),
    ...(params.is_bidder !== undefined && { is_bidder: params.is_bidder }),
    ...(params.current_price_from !== undefined && {
      current_price_from: params.current_price_from,
    }),
    ...(params.current_price_to !== undefined && {
      current_price_to: params.current_price_to,
    }),
  }
}

/** Strip empty values before writing to URL */
export function serializeSearchParams(
  params: AuctionSearchParams,
): Record<string, string | number | boolean | undefined> {
  return {
    page: params.page,
    per_page: params.per_page,
    cargo_num: params.cargo_num || undefined,
    status: params.status.length ? params.status.join(',') : undefined,
    statuses: params.statuses.length ? params.statuses.join(',') : undefined,
    auc_type: params.auc_type.length ? params.auc_type.join(',') : undefined,
    load_city: params.load_city || undefined,
    unload_city: params.unload_city || undefined,
    load_date_from: params.load_date_from || undefined,
    load_date_to: params.load_date_to || undefined,
    is_available: params.is_available !== undefined ? String(params.is_available) : undefined,
    is_bidder: params.is_bidder !== undefined ? String(params.is_bidder) : undefined,
    current_price_from:
      params.current_price_from !== undefined ? String(params.current_price_from) : undefined,
    current_price_to:
      params.current_price_to !== undefined ? String(params.current_price_to) : undefined,
  }
}

export function filtersToSearchParams(params: AuctionSearchParams): Record<string, string> {
  const serialized = serializeSearchParams(params)
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(serialized)) {
    if (value !== undefined) result[key] = String(value)
  }

  return result
}

export function countActiveFilters(params: AuctionSearchParams): number {
  let count = 0
  if (params.cargo_num) count++
  if (params.status.length) count++
  if (params.statuses.length) count++
  if (params.auc_type.length) count++
  if (params.load_city) count++
  if (params.unload_city) count++
  if (params.load_date_from) count++
  if (params.load_date_to) count++
  if (params.is_available !== undefined) count++
  if (params.is_bidder !== undefined) count++
  if (params.current_price_from !== undefined) count++
  if (params.current_price_to !== undefined) count++
  return count
}
