import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkGfm from 'remark-gfm';
import { useChatStore } from '@/lib/store';
import type { Message } from '@/types';

interface VirtualizedMessageListProps {
  className?: string;
}

// Message item component that renders individual messages
const MessageItem: React.FC<{ message: Message; isStreaming?: boolean }> = ({ 
  message, 
  isStreaming = false 
}) => {
  const markdownComponents = {
    h1: ({ children }: any) => <h1 className="text-2xl font-bold my-3 mt-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold my-2 mt-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-bold my-2 mt-2">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-base font-bold my-2">{children}</h4>,
    h5: ({ children }: any) => <h5 className="text-sm font-bold my-1">{children}</h5>,
    h6: ({ children }: any) => <h6 className="text-xs font-bold my-1">{children}</h6>,
    p: ({ children }: any) => <p className="my-2 leading-6">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="ml-2">{children}</li>,
    code: ({ inline, children }: any) =>
      inline ? (
        <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{children}</code>
      ) : (
        <code className="block bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto my-2 whitespace-pre-wrap break-words">
          {children}
        </code>
      ),
    pre: ({ children }: any) => <pre className="my-2">{children}</pre>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-2">
        <table className="border-collapse border-border w-full">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="border-b border-border">{children}</tr>,
    th: ({ children }: any) => (
      <th className="border border-border px-3 py-2 text-left font-semibold">{children}</th>
    ),
    td: ({ children }: any) => <td className="border border-border px-3 py-2">{children}</td>,
    a: ({ href, children }: any) => (
      <a href={href} className="text-primary underline hover:opacity-80">
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    hr: () => <hr className="my-3 border-border" />,
  };

  return (
    <div className={`w-full flex ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}>
      <div
        className={`px-4 py-3 rounded-lg w-full sm:max-w-[80%] ${
          message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-inherit">
          {(() => {
            // Parse special blocks from assistant messages
            const raw = message.content || '';

            // Helper to extract and remove a block
            const extractBlock = (str: string, tag: string) => {
              const re = new RegExp(`<${tag}>\\s*([\\s\\S]*?)\\s*</${tag}>`, 'i');
              const match = str.match(re);
              if (!match) return { content: '', rest: str };
              const content = match[1];
              const rest = str.replace(re, '').trim();
              return { content, rest };
            };

            // Documents
            const docsBlock = extractBlock(raw, 'documents');
            const docsLines = docsBlock.content
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean);

            const documents: { filename: string; dmsId: string }[] = docsLines
              .map((line) => {
                const parts = line.split('|').map((p) => p.trim());
                if (parts.length < 2) return null;
                const filename = parts[0];
                const dmsId = parts[1];
                if (!filename || !dmsId) return null;
                if (!filename.toLowerCase().endsWith('.pdf')) return null;
                return { filename: filename.replace(/\.pdf$/i, ''), dmsId };
              })
              .filter((v): v is { filename: string; dmsId: string } => v !== null);

            // Related questions
            const rqBlock = extractBlock(raw, 'related_questions');
            const relatedQuestions = rqBlock.content
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean);

            // Use the content with both blocks removed for markdown rendering
            let contentWithoutBlocks = raw;
            if (docsBlock.content) contentWithoutBlocks = docsBlock.rest;
            if (rqBlock.content) contentWithoutBlocks = extractBlock(contentWithoutBlocks, 'related_questions').rest;

            return (
              <>
                <ReactMarkdown remarkPlugins={[RemarkGfm]} components={markdownComponents}>
                  {contentWithoutBlocks}
                </ReactMarkdown>

                {documents.length > 0 && (
                  <div className="mt-3 border border-border rounded-md bg-card p-3 text-sm text-muted-foreground">
                      <div className="font-semibold text-foreground mb-2">Documents</div>
                      <ul className="space-y-1">
                        {documents.map((d, i) => (
                          <li key={i} className="flex justify-between items-center">
                            <span className="font-medium text-foreground">{d.filename}</span>
                            <span className="text-xs text-muted-foreground
