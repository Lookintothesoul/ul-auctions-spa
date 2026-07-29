import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch, isApiError } from '@/shared/api/client'
import type { SetBetRequest, ValidationProblem } from '@/shared/api/types'
import { auctionKeys } from '@/entities/auction/api/queries'

export function setBet(uuid: string, body: SetBetRequest) {
  return apiFetch<void>(`/auctions/${uuid}/bets`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function useSetBetMutation(uuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SetBetRequest) => setBet(uuid, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.detail(uuid) })
      void queryClient.invalidateQueries({ queryKey: auctionKeys.bets(uuid) })
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() })
    },
  })
}

export function getValidationErrors(error: unknown): ValidationProblem['errors'] | null {
  if (isApiError(error) && error.isValidation()) {
    return error.body.errors
  }
  return null
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.body.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Произошла ошибка'
}
