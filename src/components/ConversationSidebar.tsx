import { useChatStore } from '@/lib/store';

export default function ConversationSidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const currentId = useChatStore((s) => s.currentConversationId);
  const createConversation = useChatStore((s) => s.createConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);

  const handleNewChat = () => {
    const id = createConversation('New chat');
    selectConversation(id);
  };

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-background">
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          + New chat
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {conversations.length === 0 && (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            No conversations yet
          </div>
        )}

        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => selectConversation(c.id)}
            className={`w-full truncate rounded-md px-3 py-2 text-left text-sm transition
              ${
                c.id === currentId
                  ? 'bg-muted font-medium'
                  : 'hover:bg-muted/50'
              }`}
          >
            {c.title}
          </button>
        ))}
      </div>
    </aside>
  );
}
