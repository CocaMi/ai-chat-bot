import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { MessageList } from '@/components/MessageList';

interface VirtualizedMessageListProps {
  className?: string;
}

export function VirtualizedMessageList({
  className,
}: VirtualizedMessageListProps) {
  const messages = useChatStore((s) => s.messages);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  /* ---------- Track user scroll ---------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      setAutoScrollEnabled(distanceFromBottom < 120);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------- Auto-scroll (sentinel based) ---------- */
  useEffect(() => {
    if (!autoScrollEnabled) return;
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, autoScrollEnabled]);

  const scrollToBottom = () => {
    setAutoScrollEnabled(true);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`relative flex-1 overflow-hidden ${className ?? ''}`}>
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden"
      >
        <div className="mx-auto w-full max-w-3xl px-4">
          <MessageList />
          {/* 👇 Scroll target */}
          <div ref={bottomRef} />
        </div>
      </div>

      {!autoScrollEnabled && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 rounded-full bg-primary px-3 py-2 text-xs text-primary-foreground shadow-lg hover:opacity-90"
        >
          ↓ Scroll to bottom
        </button>
      )}
    </div>
  );
}
