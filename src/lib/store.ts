import { create, type StateCreator } from 'zustand';
import type {
  ChatState,
  ChatActions,
  Message,
  Conversation,
  DocumentReference,
  RelatedQuestion,
} from '@/types/chat';

type Store = ChatState & ChatActions;

const generateId = () => Math.random().toString(36).slice(2);

const storeCreator: StateCreator<Store> = (set, get) => ({
  /* -------------------- State -------------------- */

  conversations: [],
  currentConversationId: null,
  messages: [],
  isLoading: false,
  streamingEvent: null,

  /* -------------------- Conversations -------------------- */

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

    return id;
  },

  selectConversation: (id: string) => {
    const conversation = get().conversations.find(
      (c: Conversation) => c.id === id
    );
    if (!conversation) return;

    set({
      currentConversationId: id,
      messages: conversation.messages ?? [],
    });
  },

  deleteConversation: (id: string) => {
    set((state) => {
      const conversations = state.conversations.filter(
        (c) => c.id !== id
      );

      const newCurrent =
        state.currentConversationId === id
          ? conversations[0]?.id ?? null
          : state.currentConversationId;

      const messages = newCurrent
        ? conversations.find((c) => c.id === newCurrent)?.messages ?? []
        : [];

      return {
        conversations,
        currentConversationId: newCurrent,
        messages,
      };
    });
  },

  updateConversationTitle: (id: string, title: string) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id
          ? { ...c, title, updatedAt: new Date() }
          : c
      ),
    }));
  },

  /* -------------------- Messages -------------------- */

  addMessage: (conversationId: string, message: Omit<Message, 'id'>) => {
    const msg: Message = {
      ...message,
      id: generateId(),
      timestamp: message.timestamp ?? new Date(),
    };

    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, msg],
              updatedAt: new Date(),
            }
          : c
      );

      const messages =
        state.currentConversationId === conversationId
          ? [...state.messages, msg]
          : state.messages;

      return { conversations, messages };
    });
  },

  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => {
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

      const messages =
        state.currentConversationId === conversationId
          ? conversations.find((c) => c.id === conversationId)?.messages ??
            state.messages
          : state.messages;

      return { conversations, messages };
    });
  },

  deleteMessage: (conversationId: string, messageId: string) => {
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.filter((m) => m.id !== messageId),
              updatedAt: new Date(),
            }
          : c
      );

      const messages =
        state.currentConversationId === conversationId
          ? conversations.find((c) => c.id === conversationId)?.messages ?? []
          : state.messages;

      return { conversations, messages };
    });
  },

  /* -------------------- Streaming (REQUIRED BY ChatActions) -------------------- */
startStreaming: () => {
  set({ isLoading: true });
},
  startAgentMessage: (conversationId: string) => {
  const id = generateId();

  const msg: Message = {
    id,
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    isStreaming: true,
    isComplete: false,
  };

  set((state) => {
    const conversations = state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, msg], updatedAt: new Date() }
        : c
    );

    const messages =
      state.currentConversationId === conversationId
        ? [...state.messages, msg]
        : state.messages;

    return {
      conversations,
      messages,
      isLoading: true,
    };
  });

  return id;
},


  appendStreamingChunk: (chunk: string) => {
    set((state) => {
      if (!state.messages.length) return state;

      const messages = [...state.messages];
      const last = messages[messages.length - 1];

      if (last.role !== 'assistant' || !last.isStreaming) return state;

      last.content += chunk;

      const conversations = state.conversations.map((c) =>
        c.id === state.currentConversationId ? { ...c, messages } : c
      );

      return { messages, conversations };
    });
  },

  endStreaming: () => {
    set((state) => {
      if (!state.messages.length) {
        return { isLoading: false };
      }

      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      last.isStreaming = false;
      last.isComplete = true;

      const conversations = state.conversations.map((c) =>
        c.id === state.currentConversationId ? { ...c, messages } : c
      );

      return {
        messages,
        conversations,
        isLoading: false,
      };
    });
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

  /* -------------------- Documents / Related Questions -------------------- */

  addDocumentReference: (
    conversationId: string,
    document: DocumentReference
  ) => {
    set((state) => {
      if (
        state.currentConversationId !== conversationId ||
        !state.messages.length
      )
        return state;

      const messages = state.messages.map((m, i) =>
        i === state.messages.length - 1
          ? {
              ...m,
              documentReferences: [
                ...(m.documentReferences ?? []),
                document,
              ],
            }
          : m
      );

      const conversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages } : c
      );

      return { conversations, messages };
    });
  },

  addRelatedQuestion: (
    conversationId: string,
    question: RelatedQuestion
  ) => {
    set((state) => {
      if (
        state.currentConversationId !== conversationId ||
        !state.messages.length
      )
        return state;

      const messages = state.messages.map((m, i) =>
        i === state.messages.length - 1
          ? {
              ...m,
              relatedQuestions: [
                ...(m.relatedQuestions ?? []),
                question,
              ],
            }
          : m
      );

      const conversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages } : c
      );

      return { conversations, messages };
    });
  },
});

export const useChatStore = create(storeCreator);
