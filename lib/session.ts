import { Session } from './types'

export const SESSION_KEY = 'applai_session'

export function saveSession(partial: Partial<Session>): void {
  const existing = loadSession() ?? {}
  const updated = { ...existing, ...partial }
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
}

export function loadSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
