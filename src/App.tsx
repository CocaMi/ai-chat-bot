import { VirtualizedMessageList } from '@/components/ui/virtualized-message-list';
import ChatInput from '@/components/ChatInput';

function App() {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-3xl">
          <VirtualizedMessageList />
        </div>
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}

export default App;
