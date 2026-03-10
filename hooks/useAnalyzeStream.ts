'use client'
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { MatchAnalysis } from '@/lib/types'
import { readSSEStream } from '@/lib/readSSEStream'

export function useAnalyzeStream(locale: string) {
  const t = useTranslations('results')
  const [partial, setPartial] = useState<Partial<MatchAnalysis> | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async (cv: string, jd: string) => {
    setPartial(null)
    setError(null)
    const accumulated: Partial<MatchAnalysis> = {}

    await readSSEStream(
      '/api/analyze',
      { cv, jobDescription: jd, locale },
      (data) => {
        try {
          const parsed = JSON.parse(data) as Partial<MatchAnalysis> & { error?: string }
          if (parsed.error) { setError(parsed.error); return }
          Object.assign(accumulated, parsed)
          setPartial({ ...accumulated })
        } catch {
          // skip malformed token
        }
      },
      () => setError(t('errorAnalyze')),
      setStreaming,
    )
  }, [locale, t])

  return { partial, streaming, error, start }
}
