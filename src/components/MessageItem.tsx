import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseAssistantContent } from "../lib/parseAssistantContent";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function MessageItem({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const parsed = !isUser ? parseAssistantContent(message.content) : null;

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} px-3 sm:px-6 mb-4`}>
      <div className={`w-full sm:max-w-[85%] lg:max-w-[75%] rounded-lg p-4 prose prose-sm max-w-none ${isUser ? "bg-green-600 text-white prose-invert" : "bg-gray-100 text-gray-900"}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {parsed ? parsed.content : message.content}
        </ReactMarkdown>

        {parsed && parsed.documents.length > 0 && (
          <div className="mt-4 border-t pt-2">
            <div className="text-xs font-semibold mb-1">Documents</div>
            <ul className="text-xs">
              {parsed.documents.map((d, i) => (
                <li key={i}>{d.filename} — <span className="font-mono">{d.dmsId}</span></li>
              ))}
            </ul>
          </div>
        )}

        {parsed && parsed.relatedQuestions.length > 0 && (
          <div className="mt-4 border-t pt-2">
            <div className="text-xs font-semibold mb-1">Related questions</div>
            <ul className="text-xs list-disc pl-4">
              {parsed.relatedQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
