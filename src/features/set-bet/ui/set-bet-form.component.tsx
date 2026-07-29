import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuctionShowResponse } from '@/shared/api/types'
import { Alert } from '@/shared/ui/alert.component'
import { Button } from '@/shared/ui/button.component'
import { Input } from '@/shared/ui/input.component'
import { Card, CardBody, CardHeader } from '@/shared/ui/card.component'
import { useToast } from '@/shared/ui/toast.component'
import {
  getValidationErrors,
  getErrorMessage,
  useSetBetMutation,
} from '@/entities/auction/api/mutations'
import {
  createBetFormSchema,
  getBetFormHints,
  type BetFormValues,
} from '@/features/set-bet/model/bet-form.schema'

interface SetBetFormProps {
  auction: AuctionShowResponse
  auctionUuid: string
  onSuccess?: () => void
}

export function SetBetForm({ auction, auctionUuid, onSuccess }: SetBetFormProps) {
  const formId = useId()
  const { showToast } = useToast()
  const mutation = useSetBetMutation(auctionUuid)
  const schema = createBetFormSchema(auction.trading.price)
  const hints = getBetFormHints(auction.trading.price)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: auction.trading.price.available ?? auction.trading.price.current ?? undefined,
    },
  })

  useEffect(() => {
    if (mutation.isError) {
      const validationErrors = getValidationErrors(mutation.error)
      if (validationErrors) {
        validationErrors.forEach((err) => {
          if (err.field === 'price') {
            setError('price', { message: err.message })
          }
        })
      }
    }
  }, [mutation.isError, mutation.error, setError])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({ price: values.price })
      showToast('success', 'Ставка успешно принята')
      onSuccess?.()
    } catch (error) {
      const validationErrors = getValidationErrors(error)
      if (validationErrors) {
        validationErrors.forEach((err) => {
          if (err.field === 'price') {
            setError('price', { message: err.message })
          }
        })
      } else {
        showToast('error', getErrorMessage(error))
      }
    }
  })

  if (!auction.trading.can_set_bet) {
    return (
      <Alert variant="warning" title="Ставка недоступна">
        Установка ставки недоступна для данного аукциона. Возможно, торги завершены или у вас нет
        прав на участие.
      </Alert>
    )
  }

  return (
    <Card as="section" aria-labelledby={`${formId}-title`}>
      <CardHeader>
        <h2 id={`${formId}-title`} className="text-lg font-semibold">
          Сделать ставку
        </h2>
        <p className="mt-1 text-sm text-slate-500">Заявка № {auction.main.cargo_num}</p>
      </CardHeader>
      <CardBody>
        <form
          id={formId}
          onSubmit={onSubmit}
          className="space-y-4"
          aria-describedby={hints ? `${formId}-hints` : undefined}
          noValidate
        >
          {hints && (
            <p id={`${formId}-hints`} className="sr-only">
              {hints}
            </p>
          )}

          <Input
            label="Цена ставки, ₽"
            type="number"
            step="any"
            min={0}
            inputMode="decimal"
            required
            hint={hints}
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />

          {mutation.isError && !getValidationErrors(mutation.error) && (
            <Alert variant="error">{getErrorMessage(mutation.error)}</Alert>
          )}

          <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="w-full">
            {auction.trading.your.bet ? 'Изменить ставку' : 'Сделать ставку'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
