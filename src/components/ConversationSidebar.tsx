import { useChatStore } from '@/lib/store';
import { Plus } from 'lucide-react';

export default function ConversationSidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const currentConversationId = useChatStore((s) => s.currentConversationId);

  const createConversation = useChatStore((s) => s.createConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={() => createConversation('New chat')}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 && (
          <div className="px-2 text-sm text-muted-foreground">
            No conversations yet
          </div>
        )}

        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm mb-1 ${
              c.id === currentConversationId
                ? 'bg-muted font-medium'
                : 'hover:bg-muted'
            }`}
          >
            <button
              onClick={() => selectConversation(c.id)}
              className="flex-1 text-left truncate"
            >
              {c.title}
            </button>

            <button
              onClick={() => deleteConversation(c.id)}
              className="ml-2 text-xs text-muted-foreground hover:text-red-500"
              title="Delete conversation"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
