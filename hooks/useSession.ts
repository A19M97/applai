'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { Session } from '@/lib/types'
import {
  SESSION_KEY,
  saveSession as persistSave,
  clearSession as persistClear,
} from '@/lib/session'

const SESSION_EVENT = 'applai-session-change'

// Module-level cache: compare raw string so getSnapshot returns a stable
// reference when the underlying data hasn't changed, satisfying React's
// requirement that getSnapshot must not return new objects on every call.
let cachedRaw: string | null | undefined // undefined = not yet read
let cachedSession: Session | null = null

function getSnapshot(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw === cachedRaw) return cachedSession
  cachedRaw = raw
  try {
    cachedSession = raw ? (JSON.parse(raw) as Session) : null
  } catch {
    cachedSession = null
  }
  return cachedSession
}

function subscribe(callback: () => void) {
  window.addEventListener(SESSION_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(SESSION_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function useSession() {
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => null
  )

  const saveSession = useCallback((partial: Partial<Session>) => {
    persistSave(partial)
    cachedRaw = undefined // invalidate cache
    window.dispatchEvent(new Event(SESSION_EVENT))
  }, [])

  const clearSession = useCallback(() => {
    persistClear()
    cachedRaw = undefined // invalidate cache
    window.dispatchEvent(new Event(SESSION_EVENT))
  }, [])

  return { session, saveSession, clearSession }
}
