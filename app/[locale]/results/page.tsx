import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ResultsTabs } from '@/components/ResultsTabs'
import { Link } from '@/i18n/routing'
import { Zap } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ResultsPage' })
  return {
    title: `${t('pageTitle')} — Applai`,
  }
}

export default async function ResultsPage() {
  const t = await getTranslations('ResultsPage')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">{t('appName')}</span>
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('pageTitle')}</h1>
        </div>
        <ResultsTabs />
      </main>
    </div>
  )
}
