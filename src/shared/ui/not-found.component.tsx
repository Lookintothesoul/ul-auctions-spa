import { Link } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { defaultSearchParams } from '@/features/auction-filters/model/search-params'
import { linkButtonClassName } from '@/shared/ui/link-button.styles'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <FileQuestion className="size-12 text-slate-400" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-slate-900">Страница не найдена</h1>
      <p className="text-sm text-slate-600">
        Запрашиваемый адрес не существует или аукцион был удалён.
      </p>
      <Link to="/" search={defaultSearchParams} className={linkButtonClassName()}>
        К списку аукционов
      </Link>
    </div>
  )
}
