import { create } from 'zustand';
import type {
  ChatState,
  ChatActions,
  Message,
  Conversation,
  //StreamingEvent,
} from '@/types';

import {
  fetchConversations,
  fetchMessages,
  createConversation as apiCreateConversation,
  sendMessage as apiSendMessage,
} from '@/lib/api';

type Store = ChatState & ChatActions;

const generateId = () => Math.random().toString(36).slice(2);

/* -------------------- LocalStorage helpers -------------------- */

const STORAGE_KEY = 'chat-store-v1';

function saveToStorage(conversations: Conversation[], currentConversationId: string | null) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ conversations, currentConversationId })
  );
}

function loadFromStorage(): {
  conversations: Conversation[];
  currentConversationId: string | null;
} | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* -------------------- Store -------------------- */

export const useChatStore = create<Store>((set, get) => ({
  /* -------------------- State -------------------- */

  conversations: [],
  currentConversationId: null,
  messages: [],
  isLoading: false,
  streamingEvent: null,

  /* -------------------- Conversations -------------------- */

  loadConversations: async () => {
    // 1️⃣ Try localStorage first
    const cached = loadFromStorage();
    if (cached) {
      set({
        conversations: cached.conversations,
        currentConversationId: cached.currentConversationId,
        messages:
          cached.conversations.find(
            (c) => c.id === cached.currentConversationId
          )?.messages ?? [],
      });
      return;
    }

    // 2️⃣ Fallback to API
    try {
      const conversations = await fetchConversations();
      set({ conversations });
      saveToStorage(conversations, null);
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

    set((state) => {
      const conversations = [...state.conversations, conversation];
      saveToStorage(conversations, id);

      return {
        conversations,
        currentConversationId: id,
        messages: [],
      };
    });

    apiCreateConversation(title).catch(console.error);

    return id;
  },

  selectConversation: async (id: string) => {
    const conversation = get().conversations.find((c) => c.id === id);

    set({
      currentConversationId: id,
      messages: conversation ? conversation.messages : [],
    });

    saveToStorage(get().conversations, id);

    // Optional API sync
    try {
      const messages = await fetchMessages(id);
      if (messages.length > 0) {
        set({ messages });
      }
    } catch {
      /* ignore */
    }
  },

  deleteConversation: (id: string) => {
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== id);
      const currentConversationId =
        state.currentConversationId === id ? null : state.currentConversationId;

      saveToStorage(conversations, currentConversationId);

      return {
        conversations,
        currentConversationId,
        messages: [],
      };
    });
  },

  updateConversationTitle: (id: string, title: string) => {
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: new Date() } : c
      );

      saveToStorage(conversations, state.currentConversationId);

      return { conversations };
    });
  },

  /* -------------------- Messages -------------------- */

  addMessage: (conversationId, message) => {
    const msg: Message = {
      id: generateId(),
      ...message,
    };

    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg] }
          : c
      );

      saveToStorage(conversations, state.currentConversationId);

      return {
        conversations,
        messages:
          state.currentConversationId === conversationId
            ? [...state.messages, msg]
            : state.messages,
      };
    });
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id !== conversationId
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
            }
      );

      saveToStorage(conversations, state.currentConversationId);

      return {
        conversations,
        messages:
          state.currentConversationId === conversationId
            ? state.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              )
            : state.messages,
      };
    });
  },

  deleteMessage: (conversationId, messageId) => {
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
          : c
      );

      saveToStorage(conversations, state.currentConversationId);

      return {
        conversations,
        messages:
          state.currentConversationId === conversationId
            ? state.messages.filter((m) => m.id !== messageId)
            : state.messages,
      };
    });
  },

  /* -------------------- Send Message (Streaming) -------------------- */

  sendUserMessage: async (content: string) => {
    let conversationId = get().currentConversationId;

    if (!conversationId) {
      conversationId = get().createConversation('New chat');
    }

    // Auto-title (PDF A)
    const convo = get().conversations.find((c) => c.id === conversationId);
    if (convo && convo.messages.length === 0) {
      get().updateConversationTitle(
        conversationId,
        content.slice(0, 40)
      );
    }

    get().addMessage(conversationId, {
      role: 'user',
      content,
      timestamp: new Date(),
      isComplete: true,
      isStreaming: false,
    });

    get().startStreaming();
    const assistantMessageId = get().startAgentMessage(conversationId);

    try {
      // Fake streaming (PDF-compliant)
      const fake = 'This is a streamed assistant response.';
      for (const word of fake.split(' ')) {
        await new Promise((r) => setTimeout(r, 120));
        get().appendStreamingChunk(conversationId, assistantMessageId, word + ' ');
      }

      get().updateMessage(conversationId, assistantMessageId, {
        isStreaming: false,
        isComplete: true,
      });

      get().endStreaming(conversationId, assistantMessageId);

      await apiSendMessage(conversationId, content);
    } catch (err) {
      console.error('Streaming failed', err);
      get().setStreamingError('Streaming failed');
    }
  },

  /* -------------------- Streaming helpers -------------------- */

  startAgentMessage: (conversationId: string) => {
    const msg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false,
    };

    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg] }
          : c
      );

      saveToStorage(conversations, state.currentConversationId);

      return {
        conversations,
        messages: [...state.messages, msg],
      };
    });

    return msg.id;
  },

  appendStreamingChunk: (_conversationId, messageId, chunk) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + chunk } : m
      ),
    }));
  },

  startStreaming: () => {
    set({
      isLoading: true,
      streamingEvent: { type: 'start', timestamp: new Date() },
    });
  },

  endStreaming: (conversationId?: string, messageId?: string) => {
    set({ isLoading: false });
  },

  setStreamingError: (error: string) => {
    set({
      isLoading: false,
      streamingEvent: {
        type: 'error',
        data: error,
        timestamp: new Date(),
      },
    });
  },

  /* -------------------- Compatibility -------------------- */

  addDocumentReference: () => {},
  addRelatedQuestion: () => {},
}));
