/**
 * Public API types for the app.
 *
 * Source of truth: `openapi.auctions.v0.json`
 * Pipeline: `npm run generate:api`
 *   1) scripts/prepare-openapi.mjs — marks response schema properties as required
 *      (upstream OpenAPI omits most `required` arrays)
 *   2) openapi-typescript → schema.generated.ts
 *
 * Hooks: predev / prebuild / pretest. CI also fails on generated drift (`check:api`).
 */
import type { components, operations, paths } from '@/shared/api/schema.generated'

export type { components, operations, paths }

type Schemas = components['schemas']

export type AuctionType = Schemas['AuctionType']
export type AuctionStatus = Schemas['AuctionStatus']
export type TradingStatus = Schemas['TradingStatus']
export type BidMeasurementType = Schemas['BidMeasurementType']
export type OperationType = Schemas['OperationType']

export type AuctionListRequest = Schemas['AuctionListRequest']
export type AuctionListItem = Schemas['AuctionListItem']
export type AuctionListItemTradingPrice = Schemas['AuctionListItemTradingPrice']
export type AuctionListItemTradingYour = Schemas['AuctionListItemTradingYour']
export type AuctionListItemRoutePoint = Schemas['AuctionListItemRoutePoint']
export type AuctionListMeta = Schemas['AuctionListMeta']
/** Alias used across the app (OpenAPI name: AuctionListResponseBase). */
export type AuctionListResponse = Schemas['AuctionListResponseBase']

export type AuctionShowResponse = Schemas['AuctionShowResponse']
export type AuctionShowTradingPrice = Schemas['AuctionShowTradingPrice']
export type Contact = Schemas['Contact']
export type RoutePoint = Schemas['RoutePoint']
export type RoutePointLocation = Schemas['RoutePointLocation']

export type BetItem = Schemas['BetItem']
export type BetListResponse = Schemas['BetListResponse']
export type SetBetRequest = Schemas['SetBetRequest']

export type ValidationError = Schemas['ValidationError']
export type ValidationProblem = Schemas['ValidationProblem']
export type ProblemDetail = Schemas['ProblemDetail']

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
