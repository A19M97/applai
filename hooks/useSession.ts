'use client'
import { useState, useCallback } from 'react'
import { Session } from '@/lib/types'
import {
  loadSession,
  saveSession as persistSave,
  clearSession as persistClear,
} from '@/lib/session'

export function useSession() {
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === 'undefined') return null
    return loadSession()
  })

  const saveSession = useCallback((partial: Partial<Session>) => {
    persistSave(partial)
    setSession(loadSession())
  }, [])

  const clearSession = useCallback(() => {
    persistClear()
    setSession(null)
  }, [])

  return { session, saveSession, clearSession }
}
