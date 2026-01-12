import { useChatStore } from '@/lib/store';

let controller: AbortController | null = null;
let readerAbort = false;

export function abortStream() {
  if (controller) {
    controller.abort();
    controller = null;
    readerAbort = true;
  }
}

export async function startStream(url: string, init?: RequestInit) {
  // ensure previous is aborted
  abortStream();

  controller = new AbortController();
  readerAbort = false;

  const signal = controller.signal;
  const state = useChatStore.getState();

  try {
    // signal streaming start
    state.startStreaming();

    const res = await fetch(url, { ...init, signal });
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (readerAbort) break;

      buffer += decoder.decode(value, { stream: true });

      // split by double-newline which separates SSE events
      const parts = buffer.split(/\n\n/);
      // keep last part as it may be incomplete
      buffer = parts.pop() || '';

      for (const part of parts) {
        // remove leading 'data:' from each line
        const lines = part.split(/\n/).map((l) => l.replace(/^data:\s*/i, '').trim()).filter(Boolean);
        if (lines.length === 0) continue;
        // join lines in case of multi-line data
        const payload = lines.join('\n');

        // Some servers prefix with `data: data: {...}` — guard against double prefix
        const normalized = payload.replace(/^data:\s*/i, '').trim();

        // Attempt to parse JSON; if fails, skip
        let obj: any = null;
        try {
          obj = JSON.parse(normalized);
        } catch (e) {
          // If JSON not complete, append back to buffer and continue
          // put back to front of buffer for later parsing
          buffer = normalized + '\n' + buffer;
          continue;
        }

        if (!obj || !obj.type) continue;

        switch (obj.type) {
          case 'content_chunk':
            if (typeof obj.data === 'string') {
              state.addStreamingChunk(obj.data);
            }
            break;
          case 'thinking':
            // show thinking status non-destructively
            useChatStore.setState({ streamingEvent: { type: 'thinking', data: obj.data, timestamp: new Date() } });
            break;
          case 'completed':
            state.endStreaming();
            break;
          case 'done':
            state.endStreaming();
            // fully stop
            abortStream();
            break;
          case 'processing_error':
          case 'timeout_error':
          case 'network_error':
          case 'validation_error':
            state.setStreamingError(`${obj.type}: ${obj.data ?? 'error'}`);
            abortStream();
            break;
          default:
            // treat other types as status
            useChatStore.setState({ streamingEvent: { type: obj.type, data: obj.data, timestamp: new Date() } });
        }
      }
    }

    // when stream ends, ensure endStreaming called
    state.endStreaming();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // aborted by user — set a clean state
      useChatStore.setState({ streamingEvent: null, isLoading: false });
    } else {
      useChatStore.getState().setStreamingError(String(err?.message ?? err));
    }
  } finally {
    controller = null;
  }
}
