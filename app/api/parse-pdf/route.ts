import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromPDF } from '@/lib/parsers'

export async function POST(req: NextRequest) {
  let file: File | null = null
  try {
    const formData = await req.formData()
    file = formData.get('file') as File | null
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const maxBytes = parseInt(process.env.MAX_PDF_SIZE_BYTES ?? '5242880', 10) // default 5 MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  try {
    const text = await extractTextFromPDF(file)
    return NextResponse.json({ text })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
