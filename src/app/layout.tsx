import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Chat Bot</h1>
            <p className="text-muted-foreground">Chat with markdown support</p>
          </div>
          <div>
            <Button variant="default">New Conversation</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-border bg-card p-4">
          <div className="sticky top-0">
            <h2 className="text-lg font-semibold mb-2">Conversations</h2>
            <div className="text-sm text-muted-foreground">Placeholder for conversation list</div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-6">{children}</div>

          <div className="border-t border-border bg-card p-4">
            <div className="max-w-7xl mx-auto flex gap-3 items-center">
              <div className="flex-1">
                <Input placeholder="Type a message... (placeholder)" />
              </div>
              <div>
                <Button variant="default">Send</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground">Ready for chat</p>
        </div>
      </footer>
    </div>
  );
}

