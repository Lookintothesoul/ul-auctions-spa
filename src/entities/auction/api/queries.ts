import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'
import type {
  AuctionListRequest,
  AuctionListResponse,
  AuctionShowResponse,
  BetListResponse,
} from '@/shared/api/types'

export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (filters: AuctionListRequest) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...auctionKeys.details(), uuid] as const,
  bets: (uuid: string) => [...auctionKeys.all, 'bets', uuid] as const,
}

export function fetchAuctionList(body: AuctionListRequest) {
  return apiFetch<AuctionListResponse>('/auctions/list', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchAuctionDetail(uuid: string) {
  return apiFetch<AuctionShowResponse>(`/auctions/${uuid}`)
}

export function fetchAuctionBets(uuid: string, all = false) {
  const params = all ? '?all=true' : ''
  return apiFetch<BetListResponse>(`/auctions/${uuid}/bets${params}`)
}

export function useAuctionListQuery(filters: AuctionListRequest) {
  return useQuery({
    queryKey: auctionKeys.list(filters),
    queryFn: () => fetchAuctionList(filters),
    placeholderData: (prev) => prev,
  })
}

export function useAuctionDetailQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: auctionKeys.detail(uuid),
    queryFn: () => fetchAuctionDetail(uuid),
    enabled: enabled && Boolean(uuid),
  })
}

export function useAuctionBetsQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: auctionKeys.bets(uuid),
    queryFn: () => fetchAuctionBets(uuid, true),
    enabled: enabled && Boolean(uuid),
  })
}

export function usePrefetchAuctionDetail() {
  const queryClient = useQueryClient()

  return (uuid: string) => {
    void queryClient.prefetchQuery({
      queryKey: auctionKeys.detail(uuid),
      queryFn: () => fetchAuctionDetail(uuid),
      staleTime: 30_000,
    })
  }
}
