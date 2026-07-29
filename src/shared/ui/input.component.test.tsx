import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '@/shared/ui/input.component'

describe('Input', () => {
  it('associates label with the field', () => {
    render(<Input label="Цена ставки" name="price" />)

    expect(screen.getByLabelText('Цена ставки')).toBeInTheDocument()
  })

  it('shows error message with alert role', () => {
    render(<Input label="Цена" name="price" error="Цена должна быть больше 0" />)

    const field = screen.getByLabelText('Цена')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Цена должна быть больше 0')
  })

  it('exposes hint via aria-describedby when there is no error', () => {
    render(<Input label="Цена" name="price" hint="Шаг: 500 ₽" />)

    const field = screen.getByLabelText('Цена')
    const describedBy = field.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)).toHaveTextContent('Шаг: 500 ₽')
  })
})
