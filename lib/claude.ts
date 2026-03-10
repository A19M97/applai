import Anthropic from '@anthropic-ai/sdk'
import { MatchAnalysis, InterviewPrep } from './types'
import { buildMatchPrompt, buildInterviewPrompt } from './prompts'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS_ANALYZE = parseInt(process.env.MAX_TOKENS_ANALYZE ?? '1500', 10)
const MAX_TOKENS_INTERVIEW = parseInt(process.env.MAX_TOKENS_INTERVIEW ?? '2500', 10)

export function streamAnalyzeMatch(cv: string, jd: string, locale: string = 'en') {
  return client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS_ANALYZE,
    messages: [
      {
        role: 'user',
        content: buildMatchPrompt(cv, jd, locale),
      },
    ],
  })
}

export function streamInterviewPrep(cv: string, jd: string, locale: string = 'en') {
  return client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS_INTERVIEW,
    messages: [
      {
        role: 'user',
        content: buildInterviewPrompt(cv, jd, locale),
      },
    ],
  })
}
