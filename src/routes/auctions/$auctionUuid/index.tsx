import { createFileRoute } from '@tanstack/react-router'
import { AuctionDetailWidget } from '@/widgets/auction-detail/ui/auction-detail-widget.component'
import { useAuctionDetailQuery } from '@/entities/auction/api/queries'
import { Alert } from '@/shared/ui/alert.component'
import { PageSkeleton } from '@/shared/ui/skeleton.component'

export const Route = createFileRoute('/auctions/$auctionUuid/')({
  component: AuctionDetailPage,
})

function AuctionDetailPage() {
  const { auctionUuid } = Route.useParams()
  const { data, isLoading, isError, error } = useAuctionDetailQuery(auctionUuid)

  if (isLoading) {
    return <PageSkeleton label="Загрузка аукциона" />
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Не удалось загрузить аукцион">
        {error instanceof Error ? error.message : 'Аукцион не найден'}
      </Alert>
    )
  }

  return <AuctionDetailWidget auction={data} auctionUuid={auctionUuid} />
}
