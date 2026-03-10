'use client'
import { useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useSession } from '@/hooks/useSession'
import { useAnalyzeStream } from '@/hooks/useAnalyzeStream'
import { useInterviewStream } from '@/hooks/useInterviewStream'
import { MatchAnalysis, InterviewPrep } from '@/lib/types'
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

  const analyze = useAnalyzeStream(locale)
  const interview = useInterviewStream(locale)

  // Prevent double-start on StrictMode double-invoke and guard against repeated saves
  const streamStartedRef = useRef(false)
  const analysisSavedRef = useRef(false)
  const prepSavedRef = useRef(false)

  // Start streaming when session is loaded for the first time (no existing analysis)
  useEffect(() => {
    if (session === null) return
    if (session.analysis) return
    if (!session.cv) { router.push('/'); return }
    if (streamStartedRef.current) return
    streamStartedRef.current = true
    analyze.start(session.cv, session.jobDescription)
    interview.start(session.cv, session.jobDescription)
  }, [session, analyze.start, interview.start, router])

  // Persist analysis to localStorage when streaming completes (once)
  useEffect(() => {
    if (analysisSavedRef.current || analyze.streaming || !analyze.partial) return
    const p = analyze.partial
    if (
      p.score !== undefined &&
      p.commonSkills && p.missingSkills && p.strengths && p.coverLetterTips
    ) {
      analysisSavedRef.current = true
      saveSession({ analysis: p as MatchAnalysis })
    }
  }, [analyze.streaming, analyze.partial, saveSession])

  // Persist prep to localStorage when streaming completes (once)
  useEffect(() => {
    if (prepSavedRef.current || interview.streaming || !interview.partial) return
    const p = interview.partial
    if (p.technicalQuestions?.length && p.behavioralQuestions?.length) {
      prepSavedRef.current = true
      saveSession({ prep: p as InterviewPrep })
    }
  }, [interview.streaming, interview.partial, saveSession])

  function handleStartOver() {
    clearSession()
    router.push('/')
  }

  // SSR hydration OR session loaded but useEffect hasn't fired yet
  if (session === null) return <HydrationSkeleton />

  // Merge: prefer session (resume) over streaming state
  const displayAnalysis: Partial<MatchAnalysis> | null = session.analysis ?? analyze.partial
  const displayPrep: Partial<InterviewPrep> | null = session.prep ?? interview.partial

  // Not started yet (useEffect fires after render) — show skeleton instead of flash
  if (!displayAnalysis && !analyze.streaming && !analyze.error) {
    if (!session.cv) return null // will redirect via useEffect
    return <HydrationSkeleton />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Tabs defaultValue="match">
        <TabsList className="w-full">
          <TabsTrigger value="match" className="flex-1">{t('matchTab')}</TabsTrigger>
          <TabsTrigger value="interview" className="flex-1">{t('prepTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="match" className="mt-6 space-y-4">
          {analyze.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{analyze.error}</p>
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
          {interview.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{interview.error}</p>
          ) : displayPrep?.technicalQuestions?.length || displayPrep?.behavioralQuestions?.length ? (
            <>
              {displayPrep.technicalQuestions?.length ? (
                <InterviewQuestions title={t('technicalQ')} questions={displayPrep.technicalQuestions} />
              ) : (
                <SectionSkeleton className="h-32" />
              )}
              {displayPrep.behavioralQuestions?.length ? (
                <InterviewQuestions title={t('behavioralQ')} questions={displayPrep.behavioralQuestions} />
              ) : interview.streaming ? (
                <SectionSkeleton className="h-32" />
              ) : null}
            </>
          ) : interview.streaming ? (
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
