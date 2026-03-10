export async function readSSEStream(
  url: string,
  body: object,
  onEvent: (data: string) => void,
  onError: (msg: string) => void,
  setStreaming: (v: boolean) => void,
): Promise<void> {
  const decoder = new TextDecoder()
  setStreaming(true)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok || !res.body) { onError('fetch_failed'); return }
    const reader = res.body.getReader()
    let sseBuffer = ''
    outer: while (true) {
      const { done, value } = await reader.read()
      if (done) break
      sseBuffer += decoder.decode(value, { stream: true })
      const events = sseBuffer.split('\n\n')
      sseBuffer = events.pop() ?? ''
      for (const event of events) {
        const data = event.replace(/^data: /, '').trim()
        if (data === '[DONE]') break outer
        if (!data) continue
        onEvent(data)
      }
    }
  } catch {
    onError('network_error')
  } finally {
    setStreaming(false)
  }
}
