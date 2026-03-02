'use client'
import { useTranslations } from 'next-intl'
import { Question } from '@/lib/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Props {
  title: string
  questions: Question[]
}

export function InterviewQuestions({ title, questions }: Props) {
  const t = useTranslations('ResultsPage')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <Accordion type="multiple">
        {questions.map((q, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-sm text-gray-900 dark:text-white">
              {q.question}
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                  {t('hint')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{q.hint}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
