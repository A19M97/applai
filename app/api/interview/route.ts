import { NextRequest } from 'next/server'
import { streamInterviewPrep } from '@/lib/claude'

const encoder = new TextEncoder()

function sseData(line: string): Uint8Array {
  return encoder.encode(`data: ${line}\n\n`)
}

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

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = ''
      try {
        const claudeStream = streamInterviewPrep(cv, jobDescription, resolvedLocale)
        for await (const event of claudeStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            buffer += event.delta.text
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              if (line.trim()) controller.enqueue(sseData(line.trim()))
            }
          }
        }
        if (buffer.trim()) controller.enqueue(sseData(buffer.trim()))
        controller.enqueue(sseData('[DONE]'))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error'
        controller.enqueue(sseData(JSON.stringify({ error: message })))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
