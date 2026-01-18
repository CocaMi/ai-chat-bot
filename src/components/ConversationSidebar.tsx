import { useState } from 'react';
import { useChatStore } from '@/lib/store';

export default function ConversationSidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const currentConversationId = useChatStore(
    (s) => s.currentConversationId
  );
  const createConversation = useChatStore((s) => s.createConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const updateConversationTitle = useChatStore(
    (s) => s.updateConversationTitle
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setDraftTitle(title);
  };

  const saveTitle = (id: string) => {
    if (draftTitle.trim()) {
      updateConversationTitle(id, draftTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
      {/* New chat */}
      <div className="p-3 border-b border-border">
        <button
          onClick={() => createConversation('New chat')}
          className="w-full rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          + New chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 && (
          <div className="px-2 text-sm text-muted-foreground">
            No conversations yet
          </div>
        )}

        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm mb-1 ${
              c.id === currentConversationId
                ? 'bg-muted font-medium'
                : 'hover:bg-muted'
            }`}
          >
            {/* Title */}
            {editingId === c.id ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => saveTitle(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle(c.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="flex-1 rounded border border-border bg-background px-1 text-sm"
              />
            ) : (
              <button
                onClick={() => selectConversation(c.id)}
                onDoubleClick={() => startEditing(c.id, c.title)}
                className="flex-1 text-left truncate"
                title="Double-click to rename"
              >
                {c.title}
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => deleteConversation(c.id)}
              className="text-xs text-muted-foreground hover:text-red-500"
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
