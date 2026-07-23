import { create } from 'zustand';
import type { ChatMessage, Conversation, AIProviderName, Project } from '../types';
import { api } from '../services/api';
import { useAgentsStore } from './agentsStore';

interface ChatState {
  conversations: Conversation[];
  projects: Project[];
  activeConversation: string | null;
  isLoading: boolean;
  streamingMessageId: string | null;
  selectedProvider: AIProviderName;
  selectedModel: string;

  createConversation: (overrides?: { provider?: AIProviderName; mode?: 'chat' | 'codex'; agentId?: string; title?: string }) => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  setProvider: (provider: AIProviderName, model: string) => void;
  getActiveMessages: () => ChatMessage[];
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  setConversationProject: (convId: string, projectId: string | null) => void;
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

const CODEX_SYSTEM_PROMPT = 'Você é o Jarbas em modo Codex: um assistente de programação. ' +
  'Priorize respostas técnicas e diretas, com blocos de código completos e corretos. ' +
  'Explique decisões de arquitetura quando relevante, aponte edge cases e não invente APIs que não existem.';

const CONVERSATIONS_KEY = 'jarbas_conversations';
const PROJECTS_KEY = 'jarbas_projects';

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

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch { /* quota exceeded */ }
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: loadConversations(),
  projects: loadProjects(),
  activeConversation: null,
  isLoading: false,
  streamingMessageId: null,
  selectedProvider: 'deepseek',
  selectedModel: DEFAULT_MODELS.deepseek,

  createConversation: (overrides) => {
    const id = generateId();
    const defaultTitle = overrides?.mode === 'codex'
      ? 'Novo código'
      : overrides?.agentId
        ? `Nova conversa · ${useAgentsStore.getState().getAgent(overrides.agentId)?.name ?? 'Skill'}`
        : 'Nova conversa';
    const conv: Conversation = {
      id,
      title: overrides?.title ?? defaultTitle,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: overrides?.provider ?? get().selectedProvider,
      mode: overrides?.mode ?? 'chat',
      agentId: overrides?.agentId,
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

    const existingConv = get().conversations.find(c => c.id === convId);
    const activeProvider = existingConv?.provider ?? state.selectedProvider;
    const activeModel = activeProvider === state.selectedProvider ? state.selectedModel : DEFAULT_MODELS[activeProvider];
    const isCodex = existingConv?.mode === 'codex';

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
      provider: activeProvider,
      model: activeModel,
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

    if (isCodex) {
      apiMessages.unshift({ role: 'system', content: CODEX_SYSTEM_PROMPT });
    } else if (existingConv?.agentId) {
      const agent = useAgentsStore.getState().getAgent(existingConv.agentId);
      if (agent) apiMessages.unshift({ role: 'system', content: agent.systemPrompt });
    }

    try {
      await api.streamChat(apiMessages, {
        provider: activeProvider,
        model: activeModel,
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

  createProject: (name: string) => {
    const id = generateId();
    const project: Project = { id, name: name.trim() || 'Novo projeto', createdAt: Date.now() };
    const updated = [...get().projects, project];
    set({ projects: updated });
    saveProjects(updated);
    return id;
  },

  deleteProject: (id: string) => {
    const updatedProjects = get().projects.filter(p => p.id !== id);
    const updatedConvs = get().conversations.map(c =>
      c.projectId === id ? { ...c, projectId: null } : c
    );
    set({ projects: updatedProjects, conversations: updatedConvs });
    saveProjects(updatedProjects);
    saveConversations(updatedConvs);
  },

  setConversationProject: (convId: string, projectId: string | null) => {
    const updated = get().conversations.map(c =>
      c.id === convId ? { ...c, projectId } : c
    );
    set({ conversations: updated });
    saveConversations(updated);
  },
}));
