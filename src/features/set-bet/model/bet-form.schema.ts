import { z } from 'zod'
import type { AuctionShowTradingPrice } from '@/shared/api/types'

export function createBetFormSchema(price: AuctionShowTradingPrice) {
  return z.object({
    price: z.coerce
      .number({ message: 'Укажите цену' })
      .positive('Цена должна быть больше 0')
      .superRefine((value, ctx) => {
        if (price.min != null && value < price.min) {
          ctx.addIssue({
            code: 'custom',
            message: `Минимальная ставка: ${price.min.toLocaleString('ru-RU')} ₽`,
          })
        }
        if (price.max != null && value > price.max) {
          ctx.addIssue({
            code: 'custom',
            message: `Максимальная ставка: ${price.max.toLocaleString('ru-RU')} ₽`,
          })
        }
        if (price.step != null && price.min != null) {
          const diff = Math.round((value - price.min) * 100) / 100
          const steps = Math.round(diff / price.step)
          if (Math.abs(diff - steps * price.step) > 0.01) {
            ctx.addIssue({
              code: 'custom',
              message: `Ставка должна быть кратна шагу ${price.step.toLocaleString('ru-RU')} ₽`,
            })
          }
        }
      }),
  })
}

export type BetFormValues = z.infer<ReturnType<typeof createBetFormSchema>>

export function getBetFormHints(price: AuctionShowTradingPrice): string {
  const parts: string[] = []
  if (price.available != null) {
    parts.push(`Рекомендуемая цена: ${price.available.toLocaleString('ru-RU')} ₽`)
  }
  if (price.step != null) {
    parts.push(`Шаг: ${price.step.toLocaleString('ru-RU')} ₽`)
  }
  if (price.min != null && price.max != null) {
    parts.push(
      `Диапазон: ${price.min.toLocaleString('ru-RU')} – ${price.max.toLocaleString('ru-RU')} ₽`,
    )
  }
  return parts.join(' · ')
}
