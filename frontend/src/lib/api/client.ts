import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config'

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function joinUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(joinUrl(path), {
      ...init,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      let detail = `Request failed (${response.status})`
      try {
        const body: unknown = await response.json()
        if (body && typeof body === 'object') {
          const record = body as Record<string, unknown>
          if (typeof record.detail === 'string') {
            detail = record.detail
          } else if (typeof record.message === 'string') {
            detail = record.message
          }
        }
      } catch {
        /* ignore parse errors */
      }
      throw new ApiError(detail, response.status)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 0)
    }
    throw new ApiError('Unable to reach the CyberOps API', 0)
  } finally {
    window.clearTimeout(timeoutId)
  }
}
