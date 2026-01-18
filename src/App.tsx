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
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Main chat area */}
      <main className="flex flex-1 flex-col min-w-0">
        <section className="flex-1 overflow-y-auto overflow-x-hidden">
          <VirtualizedMessageList />
        </section>

        <ChatInput />
      </main>
    </div>
  );
}

export default App;
