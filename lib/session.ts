import { Session } from './types'

const KEY = 'applai_session'

export function saveSession(partial: Partial<Session>): void {
  const existing = loadSession() ?? {}
  const updated = { ...existing, ...partial }
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function loadSession(): Session | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}
