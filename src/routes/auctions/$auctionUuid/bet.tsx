import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { SetBetForm } from '@/features/set-bet/ui/set-bet-form.component'
import { useAuctionDetailQuery } from '@/entities/auction/api/queries'
import { Alert } from '@/shared/ui/alert.component'
import { PageSkeleton } from '@/shared/ui/skeleton.component'

export const Route = createFileRoute('/auctions/$auctionUuid/bet')({
  component: SetBetPage,
})

function SetBetPage() {
  const { auctionUuid } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useAuctionDetailQuery(auctionUuid)

  if (isLoading) {
    return <PageSkeleton label="Загрузка формы ставки" />
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Ошибка">
        {error instanceof Error ? error.message : 'Аукцион не найден'}
      </Alert>
    )
  }

  return (
    <section className="mx-auto max-w-lg space-y-4" aria-labelledby="set-bet-page-title">
      <header>
        <Link
          to="/auctions/$auctionUuid"
          params={{ auctionUuid }}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />К аукциону
        </Link>
        <h1 id="set-bet-page-title" className="sr-only">
          Установка ставки для заявки № {data.main.cargo_num}
        </h1>
      </header>

      <SetBetForm
        auction={data}
        auctionUuid={auctionUuid}
        onSuccess={() => {
          void navigate({
            to: '/auctions/$auctionUuid',
            params: { auctionUuid },
          })
        }}
      />
    </section>
  )
}
