import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '@/lib/store';
import type { Message } from '@/types';

const MessageList: React.FC = () => {
  const messages = useChatStore((s) => s.messages);

  return (
  <div className="flex flex-col flex-1 px-4 py-6">
    <div className="w-full flex flex-col gap-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  </div>
);

};

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
     <div
  className={`w-fit max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
    isUser
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted text-foreground'
  }`}
>

        <div className="prose prose-sm max-w-none dark:prose-invert">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {message.content || ''}
  </ReactMarkdown>
</div>

        {message.isStreaming && (
          <span className="ml-1 animate-pulse opacity-60">▍</span>
        )}
      </div>
    </div>
  );
};

export { MessageList };
