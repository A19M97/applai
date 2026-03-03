'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { saveSession, loadSession } from '@/lib/session'
import { MatchAnalysis, InterviewPrep } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function StepForm() {
  const t = useTranslations('HomePage')
  const locale = useLocale()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [cv, setCv] = useState('')
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const session = loadSession()
    setHasSession(!!(session?.analysis))
  }, [])

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setCv(data.text)
    } catch {
      setError(t('errorPDF'))
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    try {
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd, locale }),
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok) throw new Error(analyzeData.error ?? t('errorAnalyze'))

      const analysis: MatchAnalysis = analyzeData
      saveSession({ cv, jobDescription: jd, analysis })

      const matchSummary = analysis.commonSkills.join(', ')
      const interviewRes = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd, matchSummary, locale }),
      })
      const interviewData = await interviewRes.json()
      if (!interviewRes.ok) throw new Error(interviewData.error ?? t('errorInterview'))

      const prep: InterviewPrep = interviewData
      saveSession({ prep })

      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorAnalyze'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {hasSession && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t('sessionBanner')}
          </span>
          <Link
            href="/results"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline ml-2 whitespace-nowrap"
          >
            {t('viewResults')}
          </Link>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 1 ? t('step1Title') : t('step2Title')}
          </h2>
          <span className="text-sm text-gray-400">{t('stepIndicator', { step })}</span>
        </div>

        <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mb-8">
          <div
            className="h-1 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {step === 1 ? (
          <>
            <textarea
              className="w-full h-64 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('cvPlaceholder')}
              value={cv}
              onChange={e => setCv(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handlePDFUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('uploadPDF')}
                </Button>
              </div>
              <Button onClick={() => { setError(null); setStep(2) }} disabled={!cv.trim()}>
                {t('next')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <textarea
              className="w-full h-64 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('jdPlaceholder')}
              value={jd}
              onChange={e => setJd(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => { setError(null); setStep(1) }}
                disabled={loading}
              >
                {t('back')}
              </Button>
              <Button onClick={handleSubmit} disabled={!jd.trim() || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('analyzing')}
                  </>
                ) : (
                  t('analyze')
                )}
              </Button>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
