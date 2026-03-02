import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from "@/components/language-switcher"
import { Zap } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('appName'),
    description: t('description')
  };
}

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">{t('appName')}</span>
          </div>
          <LanguageSwitcher />
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            {t('description')}
          </p>
        </div>
      </main>

      <footer className="mt-32 border-t">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('footer')}
          </p>
        </div>
      </footer>
    </div>
  )
}
