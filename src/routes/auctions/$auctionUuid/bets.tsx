import { createFileRoute } from '@tanstack/react-router'
import {
  BetsListWidget,
  countParticipants,
} from '@/widgets/bets-list/ui/bets-list-widget.component'
import { useAuctionDetailQuery, useAuctionBetsQuery } from '@/entities/auction/api/queries'
import { QueryError } from '@/shared/ui/query-error.component'
import { PageSkeleton } from '@/shared/ui/skeleton.component'

export const Route = createFileRoute('/auctions/$auctionUuid/bets')({
  component: AuctionBetsPage,
})

function AuctionBetsPage() {
  const { auctionUuid } = Route.useParams()
  const detailQuery = useAuctionDetailQuery(auctionUuid)
  const hideHistory =
    detailQuery.data?.hide_bets_history || detailQuery.data?.trading.hide_bets_history
  const betsQuery = useAuctionBetsQuery(auctionUuid, !hideHistory)

  if (detailQuery.isLoading) {
    return <PageSkeleton label="Загрузка истории ставок" />
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QueryError
        title="Ошибка"
        message={
          detailQuery.error instanceof Error ? detailQuery.error.message : 'Аукцион не найден'
        }
        onRetry={() => void detailQuery.refetch()}
      />
    )
  }

  if (hideHistory) {
    return <BetsListWidget bets={[]} auctionUuid={auctionUuid} hideHistory participantsCount={0} />
  }

  if (betsQuery.isLoading) {
    return <PageSkeleton label="Загрузка списка ставок" />
  }

  if (betsQuery.isError) {
    return (
      <QueryError
        title="Не удалось загрузить ставки"
        message={betsQuery.error instanceof Error ? betsQuery.error.message : 'Ошибка загрузки'}
        onRetry={() => void betsQuery.refetch()}
      />
    )
  }

  const bets = betsQuery.data?.bets ?? []

  return (
    <BetsListWidget
      bets={bets}
      auctionUuid={auctionUuid}
      participantsCount={countParticipants(bets)}
    />
  )
}
