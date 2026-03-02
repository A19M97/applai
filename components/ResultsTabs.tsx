'use client'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useSession } from '@/hooks/useSession'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MatchScore } from '@/components/MatchScore'
import { SkillsBreakdown } from '@/components/SkillsBreakdown'
import { InterviewQuestions } from '@/components/InterviewQuestions'

export function ResultsTabs() {
  const t = useTranslations('ResultsPage')
  const router = useRouter()
  const { session, clearSession } = useSession()

  useEffect(() => {
    if (session !== null && !session.analysis) {
      router.push('/')
    }
  }, [session, router])

  // session is null during SSR hydration — render nothing until client resolves it
  if (!session?.analysis) return null

  const { analysis, prep } = session

  function handleStartOver() {
    clearSession()
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Tabs defaultValue="match">
        <TabsList className="w-full">
          <TabsTrigger value="match" className="flex-1">
            {t('matchAnalysis')}
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex-1">
            {t('interviewPrep')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="match" className="mt-6 space-y-4">
          <MatchScore score={analysis.score} />
          <SkillsBreakdown
            commonSkills={analysis.commonSkills}
            missingSkills={analysis.missingSkills}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {t('strengths')}
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-300 dark:text-gray-600 mt-0.5 select-none">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {t('coverLetterTips')}
            </h3>
            <ul className="space-y-2">
              {analysis.coverLetterTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-300 dark:text-gray-600 mt-0.5 select-none">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="interview" className="mt-6 space-y-4">
          {prep ? (
            <>
              <InterviewQuestions
                title={t('technicalQuestions')}
                questions={prep.technicalQuestions}
              />
              <InterviewQuestions
                title={t('behavioralQuestions')}
                questions={prep.behavioralQuestions}
              />
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
