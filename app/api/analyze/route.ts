import { NextRequest, NextResponse } from 'next/server'
import { analyzeMatch } from '@/lib/claude'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cv, jobDescription } = body as Record<string, unknown>

  if (!cv || typeof cv !== 'string' || cv.trim() === '') {
    return NextResponse.json({ error: 'cv is required' }, { status: 400 })
  }
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
    return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 })
  }

  try {
    const analysis = await analyzeMatch(cv, jobDescription)
    return NextResponse.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
