'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { useSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function StepForm() {
  const t = useTranslations('form')
  const router = useRouter()
  const { session, saveSession, clearSession } = useSession()

  const [step, setStep] = useState<1 | 2>(1)
  const [cv, setCv] = useState('')
  const [jd, setJd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        if (process.env.NODE_ENV === 'development') console.error('[StepForm] PDF upload error:', data.error ?? 'Unknown error')
        setError(t('errorPDF'))
      }
      setCv(data.text)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[StepForm] PDF upload error:', err)
      setError(t('errorPDF'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleSubmit() {
    setSubmitting(true)
    saveSession({ cv, jobDescription: jd })
    router.push('/results')
  }

  // Not yet hydrated — avoid flash of wrong content
  if (!mounted) return null

  // Existing session — show choice only
  if (session?.cv) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('resumeSession')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('resumeHint')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/results"
              className="flex-1 text-center text-sm font-medium px-4 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t('viewResults')}
            </Link>
            <button
              onClick={() => clearSession()}
              className="flex-1 text-sm font-medium px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('startNew')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No session — show form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 1 ? t('cvLabel') : t('jdLabel')}
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
                  disabled={uploading}
                >
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploading ? t('uploading') : t('uploadPdf')}
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
              >
                {t('back')}
              </Button>
              <Button onClick={handleSubmit} disabled={!jd.trim() || submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('analyze')}
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
