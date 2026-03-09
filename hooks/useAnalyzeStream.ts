'use client'
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { MatchAnalysis } from '@/lib/types'

export function useAnalyzeStream(locale: string) {
  const t = useTranslations('results')
  const [partial, setPartial] = useState<Partial<MatchAnalysis> | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async (cv: string, jd: string) => {
    setPartial(null)
    setStreaming(true)
    setError(null)
    const decoder = new TextDecoder()
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd, locale }),
      })
      if (!res.ok) { setError(t('errorAnalyze')); return }
      const reader = res.body?.getReader()
      if (!reader) { setError(t('errorAnalyze')); return }
      let sseBuffer = ''
      const accumulated: Partial<MatchAnalysis> = {}
      outer: while (true) {
        const { done: chunkDone, value } = await reader.read()
        if (chunkDone) break
        sseBuffer += decoder.decode(value, { stream: true })
        const events = sseBuffer.split('\n\n')
        sseBuffer = events.pop() ?? ''
        for (const event of events) {
          const data = event.replace(/^data: /, '').trim()
          if (data === '[DONE]') break outer
          if (!data) continue
          try {
            const parsed = JSON.parse(data) as Partial<MatchAnalysis> & { error?: string }
            if (parsed.error) { setError(parsed.error); return }
            Object.assign(accumulated, parsed)
            setPartial({ ...accumulated })
          } catch {
            // skip malformed token
          }
        }
      }
    } catch {
      setError(t('errorAnalyze'))
    } finally {
      setStreaming(false)
    }
  }, [locale, t])

  return { partial, streaming, error, start }
}
