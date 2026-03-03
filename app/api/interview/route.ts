import { NextRequest, NextResponse } from 'next/server'
import { generateInterviewPrep } from '@/lib/claude'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cv, jobDescription, matchSummary, locale } = body as Record<string, unknown>

  if (!cv || typeof cv !== 'string' || cv.trim() === '') {
    return NextResponse.json({ error: 'cv is required' }, { status: 400 })
  }
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
    return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 })
  }
  if (!matchSummary || typeof matchSummary !== 'string' || matchSummary.trim() === '') {
    return NextResponse.json({ error: 'matchSummary is required' }, { status: 400 })
  }

  const resolvedLocale = typeof locale === 'string' ? locale : 'en'

  try {
    const prep = await generateInterviewPrep(cv, jobDescription, matchSummary, resolvedLocale)
    return NextResponse.json(prep)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
