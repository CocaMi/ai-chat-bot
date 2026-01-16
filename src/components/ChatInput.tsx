import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useChatStore } from '@/lib/store';

export default function ChatInput() {
  const [value, setValue] = useState('');
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const isLoading = useChatStore((s) => s.isLoading);

  const handleSend = async () => {
    const text = value.trim();
    if (!text || isLoading) return;

    setValue('');
    await sendUserMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        rows={1}
        className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        disabled={isLoading}
      />

      <button
        onClick={handleSend}
        disabled={isLoading || !value.trim()}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
