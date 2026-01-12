import { useEffect } from 'react'
import { Layout } from '@/app/layout'
import { MessageList } from '@/components/ui/message-list'
import { useChatStore } from '@/lib/store'

function App() {
  const messages = useChatStore((state) => state.messages);

  useEffect(() => {
    // Only add sample messages on first render
    if (messages.length === 0) {
      const {
        createConversation,
        addMessage,
        startStreaming,
        addStreamingChunk,
        endStreaming,
      } = useChatStore.getState();

      const convoId = createConversation('Sample Conversation');

      addMessage(convoId, {
        content: 'Can you explain markdown syntax?',
        role: 'user',
        timestamp: new Date(),
      });

      // start assistant streaming reply
      addMessage(convoId, {
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      });

      startStreaming();

      const sampleMarkdown = `# Markdown Syntax Guide

## Headings
You can create headings with \`#\`, \`##\`, \`###\`, etc.

## Text Formatting
- **Bold text** with \`**text**\`
- *Italic text* with \`*text*\`
- \`Inline code\` with backticks

## Lists

### Unordered List
- Item 1
- Item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Code Blocks
\`\`\`typescript
const greeting = (name: string) => {
  return \`Hello, \${name}!\`;
};
\`\`\`

## Tables
| Feature | Support | Status |
|---------|---------|--------|
| Headings | Yes | ✓ |
| Lists | Yes | ✓ |
| Code | Yes | ✓ |
| Tables | Yes | ✓ |

## Blockquotes
> This is a blockquote. It's useful for highlighting important information.

## Links
[Visit OpenAI](https://openai.com)

---

That's the basic markdown syntax!`;

      addStreamingChunk(sampleMarkdown);
      endStreaming();
    }
  }, [messages.length]);

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList className="w-full" />
        </div>
      </div>
    </Layout>
  )
}

export default App
