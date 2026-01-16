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
  const [showScrollButton, setShowScrollButton] = useState(false);

  /* ---------- Auto-scroll on new messages ---------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  /* ---------- Scroll listener ---------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollButton(!atBottom);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className={`relative flex-1 ${className ?? ''}`}>
      <div ref={containerRef} className="h-full overflow-y-auto">
        <MessageList />
      </div>

      {showScrollButton && (
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
