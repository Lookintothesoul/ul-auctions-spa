import { API_BASE_URL } from '@/shared/config/constants'
import { ApiError, type ProblemDetail, type ValidationProblem } from '@/shared/api/types'

async function parseError(response: Response): Promise<ApiError> {
  let body: ProblemDetail | ValidationProblem
  try {
    body = await response.json()
  } catch {
    body = {
      code: 'unknown_error',
      title: 'Ошибка',
      message: response.statusText || 'Неизвестная ошибка',
      trace_id: null,
    }
  }
  return new ApiError(response.status, body)
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError'
}
