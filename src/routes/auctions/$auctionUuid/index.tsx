import { createFileRoute } from '@tanstack/react-router'
import { AuctionDetailWidget } from '@/widgets/auction-detail/ui/auction-detail-widget.component'
import { useAuctionDetailQuery } from '@/entities/auction/api/queries'
import { QueryError } from '@/shared/ui/query-error.component'
import { PageSkeleton } from '@/shared/ui/skeleton.component'

export const Route = createFileRoute('/auctions/$auctionUuid/')({
  component: AuctionDetailPage,
})

function AuctionDetailPage() {
  const { auctionUuid } = Route.useParams()
  const { data, isLoading, isError, error, refetch } = useAuctionDetailQuery(auctionUuid)

  if (isLoading) {
    return <PageSkeleton label="Загрузка аукциона" />
  }

  if (isError || !data) {
    return (
      <QueryError
        title="Не удалось загрузить аукцион"
        message={error instanceof Error ? error.message : 'Аукцион не найден'}
        onRetry={() => void refetch()}
      />
    )
  }

  return <AuctionDetailWidget auction={data} auctionUuid={auctionUuid} />
}
