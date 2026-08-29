const rawBase = import.meta.env.VITE_API_BASE_URL ?? 'https://cyberops-ai-soc.onrender.com'

export const API_BASE_URL = rawBase.replace(/\/+$/, '')

export const POLL_INTERVAL_MS = 10000

export const REQUEST_TIMEOUT_MS = 15000
