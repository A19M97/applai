'use client'
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { InterviewPrep, Question } from '@/lib/types'
import { readSSEStream } from '@/lib/readSSEStream'

export function useInterviewStream(locale: string) {
  const t = useTranslations('results')
  const [partial, setPartial] = useState<Partial<InterviewPrep> | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async (cv: string, jd: string) => {
    setPartial(null)
    setError(null)
    const techQuestions: Question[] = []
    const behavQuestions: Question[] = []

    await readSSEStream(
      '/api/interview',
      { cv, jobDescription: jd, locale },
      (data) => {
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
      },
      () => setError(t('errorInterview')),
      setStreaming,
    )
  }, [locale, t])

  return { partial, streaming, error, start }
}
