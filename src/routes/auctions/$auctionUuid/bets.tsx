import { createFileRoute } from '@tanstack/react-router'
import {
  BetsListWidget,
  countParticipants,
} from '@/widgets/bets-list/ui/bets-list-widget.component'
import { useAuctionDetailQuery, useAuctionBetsQuery } from '@/entities/auction/api/queries'
import { Alert } from '@/shared/ui/alert.component'
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
      <Alert variant="error" title="Ошибка">
        {detailQuery.error instanceof Error ? detailQuery.error.message : 'Аукцион не найден'}
      </Alert>
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
      <Alert variant="error" title="Не удалось загрузить ставки">
        {betsQuery.error instanceof Error ? betsQuery.error.message : 'Ошибка загрузки'}
      </Alert>
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
