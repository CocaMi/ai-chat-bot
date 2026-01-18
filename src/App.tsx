import { useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import ConversationSidebar from '@/components/ConversationSidebar';
import { VirtualizedMessageList } from '@/components/ui/virtualized-message-list';
import ChatInput from '@/components/ChatInput';

function App() {
  const loadConversations = useChatStore((s) => s.loadConversations);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <VirtualizedMessageList />
        </div>
        <ChatInput />
      </div>
    </div>
  );
}

export default App;
