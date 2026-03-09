import { NextRequest } from 'next/server'
import { streamInterviewPrep } from '@/lib/claude'
import { streamClaudeToSSE } from '@/lib/sse'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { cv, jobDescription, locale } = body as Record<string, unknown>

  if (!cv || typeof cv !== 'string' || cv.trim() === '') {
    return new Response(JSON.stringify({ error: 'cv is required' }), { status: 400 })
  }
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
    return new Response(JSON.stringify({ error: 'jobDescription is required' }), { status: 400 })
  }

  const resolvedLocale = typeof locale === 'string' ? locale : 'en'

  return streamClaudeToSSE(streamInterviewPrep(cv, jobDescription, resolvedLocale))
}
