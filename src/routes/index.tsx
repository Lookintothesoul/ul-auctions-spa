import { createFileRoute } from '@tanstack/react-router'
import { AuctionListWidget } from '@/widgets/auction-list/ui/auction-list-widget.component'
import {
  parseAuctionSearchParams,
  defaultSearchParams,
} from '@/features/auction-filters/model/search-params'

export const Route = createFileRoute('/')({
  validateSearch: (search) => parseAuctionSearchParams(search),
  component: AuctionsListPage,
})

function AuctionsListPage() {
  const searchParams = Route.useSearch()

  return <AuctionListWidget searchParams={searchParams} />
}

export { defaultSearchParams }
