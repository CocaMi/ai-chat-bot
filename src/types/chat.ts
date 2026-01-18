export type Role = 'user' | 'assistant' | 'system';

export interface DocumentReference {
  filename: string;
  dmsId: string;
}

export interface RelatedQuestion {
  question: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isComplete?: boolean;
  agentMessageId?: string;
  documentReferences?: DocumentReference[];
  relatedQuestions?: RelatedQuestion[];
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type StreamingEvent =
  | { type: 'start'; timestamp: Date }
  | { type: 'chunk'; data: string; timestamp: Date }
  | { type: 'end'; timestamp: Date }
  | { type: 'error'; data: string; timestamp: Date };

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  streamingEvent: StreamingEvent | null;
}

export interface ChatActions {
  /* Conversations */
  loadConversations(): Promise<void>;
  createConversation(title: string): string;
  selectConversation(id: string): void;
  deleteConversation(id: string): void;
  updateConversationTitle(id: string, title: string): void;

  /* Messages */
  addMessage(conversationId: string, message: Omit<Message, 'id'>): void;
  updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): void;
  deleteMessage(conversationId: string, messageId: string): void;
  sendUserMessage: (content: string) => Promise<void>;

  /* Streaming lifecycle */
  startStreaming(): void;
  startAgentMessage(conversationId: string): string;
  appendStreamingChunk(conversationId: string, messageId: string, chunk: string): void;
  endStreaming(conversationId: string, messageId: string): void;
  setStreamingError(error: string): void;

  /* Documents & related questions */
  addDocumentReference(conversationId: string, document: DocumentReference): void;
  addRelatedQuestion(conversationId: string, question: RelatedQuestion): void;
}
