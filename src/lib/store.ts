import { create } from 'zustand';
import type {
  ChatState,
  ChatActions,
  Message,
  Conversation,
  StreamingEvent,
} from '@/types';

import {
  fetchConversations,
  fetchMessages,
  createConversation as apiCreateConversation,

  sendMessage as apiSendMessage,
} from '@/lib/api';

type Store = ChatState & ChatActions;

const generateId = () => Math.random().toString(36).slice(2);

export const useChatStore = create<Store>((set, get) => ({
  /* -------------------- State -------------------- */

  conversations: [] as Conversation[],
  currentConversationId: null,
  messages: [] as Message[],
  isLoading: false,
  streamingEvent: null,

  /* -------------------- Conversations -------------------- */

  loadConversations: async () => {
    try {
      const conversations = await fetchConversations();
      set({ conversations });
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  },

  createConversation: (title: string) => {
    const id = generateId();

    const conversation: Conversation = {
      id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      conversations: [...state.conversations, conversation],
      currentConversationId: id,
      messages: [],
    }));

    // API call (fire-and-forget to preserve return type)
    apiCreateConversation(title).catch(console.error);

    return id;
  },

  selectConversation: async (id: string) => {
    set({ currentConversationId: id, messages: [] });

    try {
      const messages = await fetchMessages(id);
      set({ messages });
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  },

  deleteConversation: (id: string) => {
  set((state) => ({
    conversations: state.conversations.filter((c) => c.id !== id),
    currentConversationId:
      state.currentConversationId === id ? null : state.currentConversationId,
    messages: [],
  }));
},


  updateConversationTitle: (id: string, title: string) => {
  set((state) => ({
    conversations: state.conversations.map((c) =>
      c.id === id ? { ...c, title, updatedAt: new Date() } : c
    ),
  }));
},

  /* -------------------- Messages -------------------- */

  addMessage: (conversationId, message) => {
    const msg: Message = {
      id: generateId(),
      ...message,
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg] }
          : c
      ),
      messages:
        state.currentConversationId === conversationId
          ? [...state.messages, msg]
          : state.messages,
    }));
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id !== conversationId
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
            }
      ),
      messages:
        state.currentConversationId === conversationId
          ? state.messages.map((m) =>
              m.id === messageId ? { ...m, ...updates } : m
            )
          : state.messages,
    }));
  },

  deleteMessage: (conversationId, messageId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
          : c
      ),
      messages:
        state.currentConversationId === conversationId
          ? state.messages.filter((m) => m.id !== messageId)
          : state.messages,
    }));
  },

  /* -------------------- Send Message (API) -------------------- */

 sendUserMessage: async (content: string) => {
  let conversationId = get().currentConversationId;

  // Ensure a conversation exists
  if (!conversationId) {
    conversationId = get().createConversation('New chat');
  }

  // Add user message immediately
  get().addMessage(conversationId, {
    role: 'user',
    content,
    timestamp: new Date(),
    isComplete: true,
    isStreaming: false,
  });

  // Call API (streaming will be wired later)
  try {
    await apiSendMessage(conversationId, content);
  } catch (err) {
    console.error('Failed to send message', err);
  }
},




  /* -------------------- Streaming (required by ChatActions) -------------------- */

  startAgentMessage: (conversationId: string) => {
    const msg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false,
    };

    set((state) => ({
      messages: [...state.messages, msg],
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg] }
          : c
      ),
    }));

    return msg.id;
  },

  appendStreamingChunk: (_conversationId, messageId, chunk) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + chunk } : m
      ),
    }));
  },

  endStreaming: () => {
    set({ isLoading: false });
  },

  startStreaming: () => {
    set({
      isLoading: true,
      streamingEvent: { type: 'start', timestamp: new Date() } as StreamingEvent,
    });
  },

  addStreamingChunk: (chunk: string) => {
    set({
      streamingEvent: {
        type: 'chunk',
        data: chunk,
        timestamp: new Date(),
      } as StreamingEvent,
    });
  },

  setStreamingError: (error: string) => {
    set({
      isLoading: false,
      streamingEvent: {
        type: 'error',
        data: error,
        timestamp: new Date(),
      } as StreamingEvent,
    });
  },

  /* -------------------- Compatibility (Task 5) -------------------- */

  addDocumentReference: () => {},
  addRelatedQuestion: () => {},
}));
