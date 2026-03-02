'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  score: number
}

export function MatchScore({ score }: Props) {
  const t = useTranslations('ResultsPage')
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFilled(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const barColor =
    score >= 70
      ? 'bg-green-500'
      : score >= 40
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        {t('score')}
      </p>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-5xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-xl text-gray-400 mb-1">/ 100</span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: filled ? `${score}%` : '0%' }}
        />
      </div>
    </div>
  )
}
