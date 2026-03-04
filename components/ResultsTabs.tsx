'use client'
import { useEffect, useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useSession } from '@/hooks/useSession'
import { MatchAnalysis, InterviewPrep, Question } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchScore } from '@/components/MatchScore'
import { SkillsBreakdown } from '@/components/SkillsBreakdown'
import { InterviewQuestions } from '@/components/InterviewQuestions'

function SectionSkeleton({ className }: { className?: string }) {
  return <Skeleton className={`w-full rounded-xl ${className ?? 'h-32'}`} />
}

function HydrationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4 mt-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ResultsTabs() {
  const t = useTranslations('results')
  const locale = useLocale()
  const router = useRouter()
  const { session, saveSession, clearSession } = useSession()

  const [partialAnalysis, setPartialAnalysis] = useState<Partial<MatchAnalysis> | null>(null)
  const [partialPrep, setPartialPrep] = useState<Partial<InterviewPrep> | null>(null)
  const [analyzeStreaming, setAnalyzeStreaming] = useState(false)
  const [interviewStreaming, setInterviewStreaming] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [interviewError, setInterviewError] = useState<string | null>(null)

  // Refs to prevent double-start and guard against repeated saves
  const streamStartedRef = useRef(false)
  const analysisSavedRef = useRef(false)
  const prepSavedRef = useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (session === null) return

    // Resume mode: data already in localStorage — nothing to do, render from session directly
    if (session.analysis) return

    // No cv → go back home
    if (!session.cv) {
      router.push('/')
      return
    }

    // Start streaming (only once)
    if (streamStartedRef.current) return
    streamStartedRef.current = true

    startAnalyzeStream(session.cv, session.jobDescription)
    startInterviewStream(session.cv, session.jobDescription)
  }, [session])

  // Persist analysis to localStorage when streaming completes (once)
  useEffect(() => {
    if (analysisSavedRef.current || analyzeStreaming || !partialAnalysis) return
    if (
      partialAnalysis.score !== undefined &&
      partialAnalysis.commonSkills &&
      partialAnalysis.missingSkills &&
      partialAnalysis.strengths &&
      partialAnalysis.coverLetterTips
    ) {
      analysisSavedRef.current = true
      saveSession({ analysis: partialAnalysis as MatchAnalysis })
    }
  }, [analyzeStreaming, partialAnalysis, saveSession])

  // Persist prep to localStorage when streaming completes (once)
  useEffect(() => {
    if (prepSavedRef.current || interviewStreaming || !partialPrep) return
    if (partialPrep.technicalQuestions?.length && partialPrep.behavioralQuestions?.length) {
      prepSavedRef.current = true
      saveSession({ prep: partialPrep as InterviewPrep })
    }
  }, [interviewStreaming, partialPrep, saveSession])

  async function startAnalyzeStream(cv: string, jd: string) {
    analysisSavedRef.current = false
    setAnalyzeStreaming(true)
    setAnalyzeError(null)
    const decoder = new TextDecoder()
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd, locale }),
      })
      if (!res.ok) {
        setAnalyzeError(t('errorAnalyze'))
        return
      }
      const reader = res.body!.getReader()
      let sseBuffer = ''
      const partial: Partial<MatchAnalysis> = {}
      let done = false
      while (!done) {
        const { done: chunkDone, value } = await reader.read()
        if (chunkDone) break
        sseBuffer += decoder.decode(value, { stream: true })
        const events = sseBuffer.split('\n\n')
        sseBuffer = events.pop() ?? ''
        for (const event of events) {
          const data = event.replace(/^data: /, '').trim()
          if (data === '[DONE]') { done = true; break }
          if (!data) continue
          try {
            const parsed = JSON.parse(data) as Partial<MatchAnalysis> & { error?: string }
            if (parsed.error) { setAnalyzeError(parsed.error); return }
            Object.assign(partial, parsed)
            setPartialAnalysis({ ...partial })
          } catch {
            // skip malformed token
          }
        }
      }
    } catch {
      setAnalyzeError(t('errorAnalyze'))
    } finally {
      setAnalyzeStreaming(false)
    }
  }

  async function startInterviewStream(cv: string, jd: string) {
    prepSavedRef.current = false
    setInterviewStreaming(true)
    setInterviewError(null)
    const decoder = new TextDecoder()
    const techQuestions: Question[] = []
    const behavQuestions: Question[] = []
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd, locale }),
      })
      if (!res.ok) {
        setInterviewError(t('errorInterview'))
        return
      }
      const reader = res.body!.getReader()
      let sseBuffer = ''
      let done = false
      while (!done) {
        const { done: chunkDone, value } = await reader.read()
        if (chunkDone) break
        sseBuffer += decoder.decode(value, { stream: true })
        const events = sseBuffer.split('\n\n')
        sseBuffer = events.pop() ?? ''
        for (const event of events) {
          const data = event.replace(/^data: /, '').trim()
          if (data === '[DONE]') { done = true; break }
          if (!data) continue
          try {
            const parsed = JSON.parse(data) as {
              technicalQuestion?: Question
              behavioralQuestion?: Question
              error?: string
            }
            if (parsed.error) { setInterviewError(parsed.error); return }
            if (parsed.technicalQuestion) techQuestions.push(parsed.technicalQuestion)
            else if (parsed.behavioralQuestion) behavQuestions.push(parsed.behavioralQuestion)
            setPartialPrep({
              technicalQuestions: [...techQuestions],
              behavioralQuestions: [...behavQuestions],
            })
          } catch {
            // skip malformed token
          }
        }
      }
    } catch {
      setInterviewError(t('errorInterview'))
    } finally {
      setInterviewStreaming(false)
    }
  }

  function handleStartOver() {
    clearSession()
    router.push('/')
  }

  // SSR hydration — session not yet read from localStorage
  if (session === null) return <HydrationSkeleton />

  // Merge: prefer session (resume) over streaming state
  const displayAnalysis: Partial<MatchAnalysis> | null = session.analysis ?? partialAnalysis
  const displayPrep: Partial<InterviewPrep> | null = session.prep ?? partialPrep

  // Session loaded but streaming hasn't started yet (useEffect fires after render)
  if (!displayAnalysis && !analyzeStreaming && !analyzeError) {
    if (session.cv) return <HydrationSkeleton />
    return null // will redirect via useEffect
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Tabs defaultValue="match">
        <TabsList className="w-full">
          <TabsTrigger value="match" className="flex-1">
            {t('matchTab')}
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex-1">
            {t('prepTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="match" className="mt-6 space-y-4">
          {analyzeError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{analyzeError}</p>
          ) : (
            <>
              {displayAnalysis?.score !== undefined ? (
                <MatchScore score={displayAnalysis.score} />
              ) : (
                <SectionSkeleton className="h-32" />
              )}

              {displayAnalysis?.commonSkills && displayAnalysis?.missingSkills ? (
                <SkillsBreakdown
                  commonSkills={displayAnalysis.commonSkills}
                  missingSkills={displayAnalysis.missingSkills}
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-40 rounded-xl" />
                  <Skeleton className="h-40 rounded-xl" />
                </div>
              )}

              {displayAnalysis?.strengths ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {t('strengths')}
                  </h3>
                  <ul className="space-y-2">
                    {displayAnalysis.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-gray-300 dark:text-gray-600 mt-0.5 select-none">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <SectionSkeleton className="h-36" />
              )}

              {displayAnalysis?.coverLetterTips ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {t('coverTips')}
                  </h3>
                  <ul className="space-y-2">
                    {displayAnalysis.coverLetterTips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-gray-300 dark:text-gray-600 mt-0.5 select-none">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <SectionSkeleton className="h-36" />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="interview" className="mt-6 space-y-4">
          {interviewError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{interviewError}</p>
          ) : displayPrep?.technicalQuestions?.length || displayPrep?.behavioralQuestions?.length ? (
            <>
              {displayPrep.technicalQuestions?.length ? (
                <InterviewQuestions
                  title={t('technicalQ')}
                  questions={displayPrep.technicalQuestions}
                />
              ) : (
                <SectionSkeleton className="h-32" />
              )}
              {displayPrep.behavioralQuestions?.length ? (
                <InterviewQuestions
                  title={t('behavioralQ')}
                  questions={displayPrep.behavioralQuestions}
                />
              ) : interviewStreaming ? (
                <SectionSkeleton className="h-32" />
              ) : null}
            </>
          ) : interviewStreaming ? (
            <>
              <SectionSkeleton className="h-32" />
              <SectionSkeleton className="h-32" />
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noPrepData')}</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="pt-2 flex justify-center">
        <Button variant="outline" onClick={handleStartOver}>
          {t('startOver')}
        </Button>
      </div>
    </div>
  )
}
