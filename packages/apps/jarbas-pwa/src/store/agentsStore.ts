import { create } from 'zustand';
import type { AgentDefinition } from '../types';
import { useAuthStore } from './authStore';
import { supabase } from '../services/supabaseClient';

function generateId(): string {
  return crypto.randomUUID();
}

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

export const BUILT_IN_AGENTS: AgentDefinition[] = [
  {
    id: 'builtin-researcher',
    name: 'Pesquisador',
    description: 'Investiga tópicos a fundo, cita fontes e organiza as descobertas em tópicos claros.',
    systemPrompt: 'Você é o Jarbas em modo Pesquisador. Investigue o tema com profundidade, ' +
      'estruture a resposta em tópicos, aponte incertezas e, quando possível, cite fontes ou referências conhecidas. ' +
      'Prefira precisão a agilidade.',
    skills: ['pesquisa', 'análise', 'síntese'],
    memoryEnabled: false,
    maxIterations: 1,
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.4,
  },
  {
    id: 'builtin-writer',
    name: 'Redator',
    description: 'Escreve e revisa textos com tom claro, natural e adaptado ao público.',
    systemPrompt: 'Você é o Jarbas em modo Redator. Escreva textos claros, bem estruturados e com tom natural. ' +
      'Adapte o registro ao público pedido, revise clareza e coesão, e evite repetições e clichês.',
    skills: ['redação', 'revisão', 'copywriting'],
    memoryEnabled: false,
    maxIterations: 1,
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.8,
  },
  {
    id: 'builtin-analyst',
    name: 'Analista de Dados',
    description: 'Interpreta dados, números e planilhas, destacando padrões e riscos.',
    systemPrompt: 'Você é o Jarbas em modo Analista de Dados. Interprete números, tabelas e métricas com rigor, ' +
      'destaque padrões, tendências, outliers e riscos, e traduza os resultados em recomendações práticas.',
    skills: ['dados', 'estatística', 'negócios'],
    memoryEnabled: false,
    maxIterations: 1,
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.3,
  },
];

interface AgentsState {
  customAgents: AgentDefinition[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  createAgent: (input: {
    name: string;
    description: string;
    systemPrompt: string;
    skills: string[];
  }) => string;
  updateAgent: (id: string, updates: Partial<Pick<AgentDefinition, 'name' | 'description' | 'systemPrompt' | 'skills'>>) => void;
  deleteAgent: (id: string) => void;
  getAgent: (id: string) => AgentDefinition | undefined;
}

function rowToAgent(row: any): AgentDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    systemPrompt: row.system_prompt,
    skills: row.skills ?? [],
    memoryEnabled: false,
    maxIterations: 1,
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.7,
  };
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  customAgents: [],
  isHydrated: false,

  hydrate: async () => {
    const userId = currentUserId();
    if (!userId) return;
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('[supabase] falha ao carregar skills:', error.message);
      return;
    }
    set({ customAgents: (data || []).map(rowToAgent), isHydrated: true });
  },

  createAgent: ({ name, description, systemPrompt, skills }) => {
    const id = generateId();
    const agent: AgentDefinition = {
      id,
      name: name.trim() || 'Nova skill',
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      skills,
      memoryEnabled: false,
      maxIterations: 1,
      provider: 'deepseek',
      model: 'deepseek-chat',
      temperature: 0.7,
    };
    const updated = [...get().customAgents, agent];
    set({ customAgents: updated });

    const userId = currentUserId();
    if (userId) {
      supabase.from('agents').insert({
        id,
        user_id: userId,
        name: agent.name,
        description: agent.description,
        system_prompt: agent.systemPrompt,
        skills: agent.skills,
      }).then(({ error }) => {
        if (error) console.error('[supabase] falha ao criar skill:', error.message);
      });
    }
    return id;
  },

  updateAgent: (id, updates) => {
    const updated = get().customAgents.map(a => a.id === id ? { ...a, ...updates } : a);
    set({ customAgents: updated });

    supabase.from('agents').update({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.systemPrompt !== undefined ? { system_prompt: updates.systemPrompt } : {}),
      ...(updates.skills !== undefined ? { skills: updates.skills } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', id).then(({ error }) => {
      if (error) console.error('[supabase] falha ao atualizar skill:', error.message);
    });
  },

  deleteAgent: (id) => {
    const updated = get().customAgents.filter(a => a.id !== id);
    set({ customAgents: updated });
    supabase.from('agents').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('[supabase] falha ao excluir skill:', error.message);
    });
  },

  getAgent: (id) => {
    return BUILT_IN_AGENTS.find(a => a.id === id) ?? get().customAgents.find(a => a.id === id);
  },
}));
