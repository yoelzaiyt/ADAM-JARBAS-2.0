import { create } from 'zustand';
import type { ChatMessage, Conversation, AIProviderName } from '../types';
import { api } from '../services/api';

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  isLoading: boolean;
  streamingMessageId: string | null;
  selectedProvider: AIProviderName;
  selectedModel: string;

  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  setProvider: (provider: AIProviderName, model: string) => void;
  getActiveMessages: () => ChatMessage[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function generateTitle(content: string): string {
  return content.slice(0, 40) + (content.length > 40 ? '...' : '');
}

const DEFAULT_MODELS: Record<AIProviderName, string> = {
  openrouter: 'anthropic/claude-sonnet-4-20250514',
  deepseek: 'deepseek-chat',
  nvidia: 'nvidia/llama-3.1-nemotron-70b-instruct',
  ollama: 'llama3.2',
  opencode: 'opencode-default',
  zhipuai: 'glm-4-flash',
  hermes: 'Hermes-3-Llama-3.1-405B-FP8',
};

const CONVERSATIONS_KEY = 'jarbas_conversations';

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs.slice(0, 50)));
  } catch { /* quota exceeded */ }
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: loadConversations(),
  activeConversation: null,
  isLoading: false,
  streamingMessageId: null,
  selectedProvider: 'deepseek',
  selectedModel: DEFAULT_MODELS.deepseek,

  createConversation: () => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: 'Nova conversa',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: get().selectedProvider,
    };
    const updated = [conv, ...get().conversations];
    set({ conversations: updated, activeConversation: id });
    saveConversations(updated);
    return id;
  },

  setActiveConversation: (id) => set({ activeConversation: id }),

  deleteConversation: (id) => {
    const updated = get().conversations.filter(c => c.id !== id);
    set({
      conversations: updated,
      activeConversation: get().activeConversation === id ? null : get().activeConversation,
    });
    saveConversations(updated);
  },

  setProvider: (provider, model) => set({ selectedProvider: provider, selectedModel: model || DEFAULT_MODELS[provider] }),

  getActiveMessages: () => {
    const { conversations, activeConversation } = get();
    if (!activeConversation) return [];
    return conversations.find(c => c.id === activeConversation)?.messages || [];
  },

  sendMessage: async (content: string) => {
    const state = get();
    let convId = state.activeConversation;

    if (!convId) {
      convId = get().createConversation();
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMsgId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      provider: state.selectedProvider,
      model: state.selectedModel,
      isStreaming: true,
    };

    const updateConvMessages = (updater: (msgs: ChatMessage[]) => ChatMessage[]) => {
      const convs = get().conversations.map(c => {
        if (c.id !== convId) return c;
        const newMsgs = updater(c.messages);
        return {
          ...c,
          messages: newMsgs,
          title: c.messages.length === 0 ? generateTitle(content) : c.title,
          updatedAt: Date.now(),
        };
      });
      set({ conversations: convs });
      saveConversations(convs);
    };

    updateConvMessages(msgs => [...msgs, userMsg, assistantMsg]);
    set({ isLoading: true, streamingMessageId: assistantMsgId });

    const conv = get().conversations.find(c => c.id === convId);
    const apiMessages = (conv?.messages || [])
      .filter(m => !m.isStreaming)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      await api.streamChat(apiMessages, {
        provider: state.selectedProvider,
        model: state.selectedModel,
        onChunk: (delta) => {
          updateConvMessages(msgs =>
            msgs.map(m => m.id === assistantMsgId ? { ...m, content: m.content + delta } : m)
          );
        },
        onDone: () => {
          updateConvMessages(msgs =>
            msgs.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m)
          );
          set({ isLoading: false, streamingMessageId: null });
        },
        onError: (err) => {
          updateConvMessages(msgs =>
            msgs.map(m => m.id === assistantMsgId
              ? { ...m, content: `Erro: ${err.message}`, isStreaming: false }
              : m)
          );
          set({ isLoading: false, streamingMessageId: null });
        },
      });
    } catch (err: any) {
      updateConvMessages(msgs =>
        msgs.map(m => m.id === assistantMsgId
          ? { ...m, content: `Erro: ${err.message}`, isStreaming: false }
          : m)
      );
      set({ isLoading: false, streamingMessageId: null });
    }
  },
}));
