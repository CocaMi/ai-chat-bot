import { useChatStore } from '@/lib/store';

type StreamClientOptions = {
  conversationId: string;
  message: string;
  signal?: AbortSignal;
};

type SSEEvent =
  | { type: 'content_chunk'; content: string }
  | { type: 'completed' }
  | { type: 'done' }
  | { type: 'thinking' }
  | { type: 'status'; status: string }
  | { type: 'processing_error'; error: string }
  | { type: 'timeout_error'; error: string }
  | { type: 'network_error'; error: string }
  | { type: 'validation_error'; error: string };

const API_BASE_URL = 'https://test-mock-api-opal.vercel.app';

export async function streamAssistantMessage({
  conversationId,
  message,
  signal,
}: StreamClientOptions): Promise<void> {
  const {
    startAgentMessage,
    appendStreamingChunk,
    endStreaming,
    setStreamingError,
  } = useChatStore.getState();

  // Create empty assistant message first
  const agentMessageId = startAgentMessage(conversationId);

  let buffer = '';

  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
        signal,
      }
    );

    if (!response.ok || !response.body) {
      throw new Error('Streaming request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (let rawLine of lines) {
        let line = rawLine.trim();
        if (!line) continue;

        // Handle double prefix: "data: data:{...}"
        if (line.startsWith('data:')) {
          line = line.replace(/^data:\s*/, '');
          if (line.startsWith('data:')) {
            line = line.replace(/^data:\s*/, '');
          }
        }

        let event: SSEEvent;
        try {
          event = JSON.parse(line);
        } catch {
          // Incomplete JSON, keep buffering
          buffer = line + '\n' + buffer;
          continue;
        }

        switch (event.type) {
          case 'content_chunk':
            appendStreamingChunk(conversationId, agentMessageId, event.content);
            break;

          case 'completed':
          case 'done':
            endStreaming(conversationId, agentMessageId);
            return;

          case 'processing_error':
          case 'timeout_error':
          case 'network_error':
          case 'validation_error':
            setStreamingError(event.error);
            return;

          case 'thinking':
          case 'status':
          default:
            // Ignored (UI can handle later)
            break;
        }
      }
    }

    endStreaming(conversationId, agentMessageId);
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return;
    }
    setStreamingError((err as Error).message);
  }
}
