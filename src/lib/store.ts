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

  conversations: [],
  currentConversationId: null,
  messages: [],
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

    apiCreateConversation(title).catch(console.error);

    return id;
  },

  selectConversation: async (id: string) => {
    const conversation = get().conversations.find((c) => c.id === id);

    set({
      currentConversationId: id,
      messages: conversation ? conversation.messages : [],
    });

    try {
      const messages = await fetchMessages(id);
      if (messages.length > 0) {
        set({ messages });
      }
    } catch {
      /* ignore for now */
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

  /* -------------------- Send Message (STREAMING) -------------------- */

  sendUserMessage: async (content: string) => {
    let conversationId = get().currentConversationId;

    if (!conversationId) {
      conversationId = get().createConversation('New chat');
    }

    // User message
    get().addMessage(conversationId, {
      role: 'user',
      content,
      timestamp: new Date(),
      isComplete: true,
      isStreaming: false,
    });

    // Assistant streaming start
    get().startStreaming();
    const assistantMessageId = get().startAgentMessage(conversationId);

    try {
      // 🔹 TEMP streaming simulation (PDF-compliant)
      const fakeResponse =
        'This is a streamed assistant response coming word by word.';
      const chunks = fakeResponse.split(' ');

      for (let i = 0; i < chunks.length; i++) {
        await new Promise((r) => setTimeout(r, 120));
        get().appendStreamingChunk(
          conversationId,
          assistantMessageId,
          chunks[i] + ' '
        );
      }

      get().updateMessage(conversationId, assistantMessageId, {
        isStreaming: false,
        isComplete: true,
      });

      get().endStreaming(conversationId, assistantMessageId);


      // Real API call (kept for later wiring)
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

  startStreaming: () => {
    set({
      isLoading: true,
      streamingEvent: { type: 'start', timestamp: new Date() },
    });
  },

  endStreaming: (_conversationId: string, _messageId: string) => {
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
