import Anthropic from '@anthropic-ai/sdk'
import { MatchAnalysis, InterviewPrep } from './types'
import { buildMatchPrompt, buildInterviewPrompt } from './prompts'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1500

function parseJSON<T>(text: string, context: string): T {
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`Failed to parse Claude response as JSON (${context}): ${text.slice(0, 200)}`)
  }
}

export async function analyzeMatch(cv: string, jd: string): Promise<MatchAnalysis> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: buildMatchPrompt(cv, jd),
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return parseJSON<MatchAnalysis>(content.text, 'analyzeMatch')
}

export async function generateInterviewPrep(
  cv: string,
  jd: string,
  matchSummary: string
): Promise<InterviewPrep> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: buildInterviewPrompt(cv, jd, matchSummary),
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return parseJSON<InterviewPrep>(content.text, 'generateInterviewPrep')
}
