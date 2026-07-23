import { create } from 'zustand';
import type { AgentDefinition } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
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

const AGENTS_KEY = 'jarbas_custom_agents';

function loadAgents(): AgentDefinition[] {
  try {
    const raw = localStorage.getItem(AGENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAgents(agents: AgentDefinition[]) {
  try {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  } catch { /* quota exceeded */ }
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  customAgents: loadAgents(),

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
    saveAgents(updated);
    return id;
  },

  updateAgent: (id, updates) => {
    const updated = get().customAgents.map(a => a.id === id ? { ...a, ...updates } : a);
    set({ customAgents: updated });
    saveAgents(updated);
  },

  deleteAgent: (id) => {
    const updated = get().customAgents.filter(a => a.id !== id);
    set({ customAgents: updated });
    saveAgents(updated);
  },

  getAgent: (id) => {
    return BUILT_IN_AGENTS.find(a => a.id === id) ?? get().customAgents.find(a => a.id === id);
  },
}));
