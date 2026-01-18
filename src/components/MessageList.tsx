import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '@/lib/store';
import type { Message } from '@/types';

const MessageList: React.FC = () => {
  const messages = useChatStore((s) => s.messages);

  return (
    <div className="flex flex-col gap-4 py-6">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  const documents =
    message.documentReferences
      ?.map((doc) => {
        if (!doc?.filename || !doc?.dmsId) return null;
        return { filename: doc.filename, dmsId: doc.dmsId };
      })
      .filter(
        (doc): doc is { filename: string; dmsId: string } => doc !== null
      ) ?? [];

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
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

        {documents.length > 0 && (
          <div className="mt-3 border-t border-border pt-2">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Documents
            </p>
            <ul className="space-y-1 text-sm">
              {documents.map((doc, i) => (
                <li key={i} className="flex justify-between">
                  <span>{doc.filename}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.dmsId}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export { MessageList };
