import Anthropic from '@anthropic-ai/sdk'
import { MatchAnalysis, InterviewPrep } from './types'
import { buildMatchPrompt, buildInterviewPrompt } from './prompts'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1500

export function streamAnalyzeMatch(cv: string, jd: string, locale: string = 'en') {
  return client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
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
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: buildInterviewPrompt(cv, jd, locale),
      },
    ],
  })
}
