import { MessageItem } from "./MessageItem";
import type { Message } from "./MessageItem";
export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="h-full overflow-y-auto py-4">
      {messages.map(m => <MessageItem key={m.id} message={m} />)}
    </div>
  );
}
