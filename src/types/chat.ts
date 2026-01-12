/**
 * Chat application types
 */

// Message types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  // Streaming-specific fields
  isStreaming?: boolean;
  isComplete?: boolean;
  agentMessageId?: string;
  // Message-scoped document references
  documentReferences?: DocumentReference[];
  // Message-scoped related questions
  relatedQuestions?: RelatedQuestion[];
  metadata?: Record<string, any>;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

// Document reference for context
export interface DocumentReference {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'text' | 'url' | 'image';
  url?: string;
  metadata?: Record<string, any>;
}

// Related question for context
export interface RelatedQuestion {
  id: string;
  question: string;
  answer?: string;
  context?: string[];
}

// Streaming event types
export interface StreamingEvent {
  type: string;
  data?: any;
  timestamp: Date;
}

// Chat state interface
export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  streamingEvent: StreamingEvent | null;
}

// Chat actions
export interface ChatActions {
  // Conversation actions
  createConversation: (title: string) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  
  // Message actions
  addMessage: (conversationId: string, message: Omit<Message, 'id'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  
  // Streaming actions
  startStreaming: () => void;
  addStreamingChunk: (chunk: string) => void;
  endStreaming: () => void;
  setStreamingError: (error: string) => void;
  
  // Document reference actions
  addDocumentReference: (conversationId: string, document: DocumentReference) => void;
  
  // Related question actions
  addRelatedQuestion: (conversationId: string, question: RelatedQuestion) => void;
}
