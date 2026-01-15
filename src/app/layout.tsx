import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex border-r p-4">
        <div className="text-sm text-muted-foreground">Conversations</div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4">
          <h1 className="text-sm font-semibold">AI Chat</h1>
        </header>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        <footer className="h-16 border-t flex items-center px-4">
          <div className="text-sm text-muted-foreground w-full">
            Input placeholder
          </div>
        </footer>
      </div>
    </div>
  );
}
