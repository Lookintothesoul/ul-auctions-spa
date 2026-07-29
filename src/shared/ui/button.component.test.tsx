import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/shared/ui/button.component'

describe('Button', () => {
  it('renders children and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Сохранить</Button>)

    const button = screen.getByRole('button', { name: 'Сохранить' })
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled while loading and announces busy state', () => {
    render(
      <Button isLoading onClick={vi.fn()}>
        Отправить
      </Button>,
    )

    const button = screen.getByRole('button', { name: /Отправить/ })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })
})
