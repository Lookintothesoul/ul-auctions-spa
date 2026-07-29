import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from '@/shared/ui/alert.component'

describe('Alert', () => {
  it('uses alert role for errors', () => {
    render(
      <Alert variant="error" title="Ошибка">
        Не удалось сохранить ставку
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Ошибка')
    expect(alert).toHaveTextContent('Не удалось сохранить ставку')
  })

  it('uses status role for informational messages', () => {
    render(
      <Alert variant="info" title="История скрыта">
        Организатор скрыл ставки
      </Alert>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('История скрыта')
  })
})
