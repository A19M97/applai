import type { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream'

const encoder = new TextEncoder()

function sseData(line: string): Uint8Array {
  return encoder.encode(`data: ${line}\n\n`)
}

export function streamClaudeToSSE(claudeStream: MessageStream): Response {
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = ''
      try {
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
