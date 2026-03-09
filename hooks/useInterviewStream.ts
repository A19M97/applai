'use client'
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { InterviewPrep, Question } from '@/lib/types'

export function useInterviewStream(locale: string) {
  const t = useTranslations('results')
  const [partial, setPartial] = useState<Partial<InterviewPrep> | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async (cv: string, jd: string) => {
    setPartial(null)
    setStreaming(true)
    setError(null)
    const decoder = new TextDecoder()
    const techQuestions: Question[] = []
    const behavQuestions: Question[] = []
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd, locale }),
      })
      if (!res.ok) { setError(t('errorInterview')); return }
      const reader = res.body?.getReader()
      if (!reader) { setError(t('errorInterview')); return }
      let sseBuffer = ''
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
            const parsed = JSON.parse(data) as {
              technicalQuestion?: Question
              behavioralQuestion?: Question
              error?: string
            }
            if (parsed.error) { setError(parsed.error); return }
            if (parsed.technicalQuestion) techQuestions.push(parsed.technicalQuestion)
            else if (parsed.behavioralQuestion) behavQuestions.push(parsed.behavioralQuestion)
            setPartial({
              technicalQuestions: [...techQuestions],
              behavioralQuestions: [...behavQuestions],
            })
          } catch {
            // skip malformed token
          }
        }
      }
    } catch {
      setError(t('errorInterview'))
    } finally {
      setStreaming(false)
    }
  }, [locale, t])

  return { partial, streaming, error, start }
}
