'use client'
import { useTranslations } from 'next-intl'

interface Props {
  commonSkills: string[]
  missingSkills: string[]
}

export function SkillsBreakdown({ commonSkills, missingSkills }: Props) {
  const t = useTranslations('results')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-3">
          ✅ {t('commonSkills')}
        </h3>
        <ul className="space-y-2">
          {commonSkills.map((skill) => (
            <li key={skill} className="text-sm text-gray-700 dark:text-gray-300">
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-3">
          ⚠️ {t('missingSkills')}
        </h3>
        <ul className="space-y-2">
          {missingSkills.map((skill) => (
            <li key={skill} className="text-sm text-gray-700 dark:text-gray-300">
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
