import { create } from 'zustand';
import type { ChatMessage, Conversation, AIProviderName, Project } from '../types';
import { api } from '../services/api';
import { useAgentsStore } from './agentsStore';
import { useAuthStore } from './authStore';
import { supabase } from '../services/supabaseClient';

interface ChatState {
  conversations: Conversation[];
  projects: Project[];
  activeConversation: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  streamingMessageId: string | null;
  selectedProvider: AIProviderName;
  selectedModel: string;

  hydrate: () => Promise<void>;
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
  return crypto.randomUUID();
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

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

async function persistNewConversation(conv: Conversation, userId: string) {
  const { error } = await supabase.from('conversations').insert({
    id: conv.id,
    user_id: userId,
    project_id: conv.projectId ?? null,
    title: conv.title,
    provider: conv.provider,
    mode: conv.mode,
    agent_id: conv.agentId ?? null,
  });
  if (error) console.error('[supabase] falha ao criar conversa:', error.message);
}

async function persistConversationUpdate(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('conversations').update(updates).eq('id', id);
  if (error) console.error('[supabase] falha ao atualizar conversa:', error.message);
}

async function persistMessage(msg: ChatMessage, conversationId: string, userId: string) {
  const { error } = await supabase.from('messages').insert({
    id: msg.id,
    conversation_id: conversationId,
    user_id: userId,
    role: msg.role,
    content: msg.content,
    provider: msg.provider ?? null,
    model: msg.model ?? null,
  });
  if (error) console.error('[supabase] falha ao salvar mensagem:', error.message);
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  projects: [],
  activeConversation: null,
  isLoading: false,
  isHydrated: false,
  streamingMessageId: null,
  selectedProvider: 'deepseek',
  selectedModel: DEFAULT_MODELS.deepseek,

  hydrate: async () => {
    const userId = currentUserId();
    if (!userId) return;

    const [{ data: projectRows }, { data: convRows }, { data: msgRows }] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('conversations').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    ]);

    const messagesByConv = new Map<string, ChatMessage[]>();
    for (const m of msgRows || []) {
      const msg: ChatMessage = {
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at).getTime(),
        provider: m.provider ?? undefined,
        model: m.model ?? undefined,
      };
      const list = messagesByConv.get(m.conversation_id) ?? [];
      list.push(msg);
      messagesByConv.set(m.conversation_id, list);
    }

    const conversations: Conversation[] = (convRows || []).map(c => ({
      id: c.id,
      title: c.title,
      messages: messagesByConv.get(c.id) ?? [],
      createdAt: new Date(c.created_at).getTime(),
      updatedAt: new Date(c.updated_at).getTime(),
      agentId: c.agent_id ?? undefined,
      provider: c.provider ?? undefined,
      projectId: c.project_id ?? null,
      mode: (c.mode as 'chat' | 'codex') ?? 'chat',
    }));

    const projects: Project[] = (projectRows || []).map(p => ({
      id: p.id,
      name: p.name,
      createdAt: new Date(p.created_at).getTime(),
    }));

    set({ conversations, projects, isHydrated: true });
  },

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

    const userId = currentUserId();
    if (userId) persistNewConversation(conv, userId);
    return id;
  },

  setActiveConversation: (id) => set({ activeConversation: id }),

  deleteConversation: (id) => {
    const updated = get().conversations.filter(c => c.id !== id);
    set({
      conversations: updated,
      activeConversation: get().activeConversation === id ? null : get().activeConversation,
    });
    supabase.from('conversations').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('[supabase] falha ao excluir conversa:', error.message);
    });
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

    const userId = currentUserId();
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

    const isFirstMessage = (existingConv?.messages.length ?? 0) === 0;

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
    };

    updateConvMessages(msgs => [...msgs, userMsg, assistantMsg]);
    set({ isLoading: true, streamingMessageId: assistantMsgId });

    if (userId) {
      persistMessage(userMsg, convId, userId);
      if (isFirstMessage) {
        persistConversationUpdate(convId, { title: generateTitle(content), updated_at: new Date().toISOString() });
      }
    }

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

    const finalizeAssistantMessage = () => {
      const finalContent = get().conversations.find(c => c.id === convId)?.messages
        .find(m => m.id === assistantMsgId)?.content ?? '';
      if (userId && finalContent) {
        persistMessage({ ...assistantMsg, content: finalContent }, convId!, userId);
        persistConversationUpdate(convId!, { updated_at: new Date().toISOString() });
      }
    };

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
          finalizeAssistantMessage();
        },
        onError: (err) => {
          updateConvMessages(msgs =>
            msgs.map(m => m.id === assistantMsgId
              ? { ...m, content: `Erro: ${err.message}`, isStreaming: false }
              : m)
          );
          set({ isLoading: false, streamingMessageId: null });
          finalizeAssistantMessage();
        },
      });
    } catch (err: any) {
      updateConvMessages(msgs =>
        msgs.map(m => m.id === assistantMsgId
          ? { ...m, content: `Erro: ${err.message}`, isStreaming: false }
          : m)
      );
      set({ isLoading: false, streamingMessageId: null });
      finalizeAssistantMessage();
    }
  },

  createProject: (name: string) => {
    const id = generateId();
    const project: Project = { id, name: name.trim() || 'Novo projeto', createdAt: Date.now() };
    const updated = [...get().projects, project];
    set({ projects: updated });

    const userId = currentUserId();
    if (userId) {
      supabase.from('projects').insert({ id, user_id: userId, name: project.name }).then(({ error }) => {
        if (error) console.error('[supabase] falha ao criar projeto:', error.message);
      });
    }
    return id;
  },

  deleteProject: (id: string) => {
    const updatedProjects = get().projects.filter(p => p.id !== id);
    const updatedConvs = get().conversations.map(c =>
      c.projectId === id ? { ...c, projectId: null } : c
    );
    set({ projects: updatedProjects, conversations: updatedConvs });
    supabase.from('projects').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('[supabase] falha ao excluir projeto:', error.message);
    });
  },

  setConversationProject: (convId: string, projectId: string | null) => {
    const updated = get().conversations.map(c =>
      c.id === convId ? { ...c, projectId } : c
    );
    set({ conversations: updated });
    persistConversationUpdate(convId, { project_id: projectId });
  },
}));
