import { useMemo, useState } from 'react';
import { X, Search, Bot, Sparkles, Plus, Trash2, Pencil, Tag } from 'lucide-react';
import { useAgentsStore, BUILT_IN_AGENTS } from '../store/agentsStore';
import type { AgentDefinition } from '../types';

interface PluginsPageProps {
  onClose: () => void;
  onSelectAgent: (agentId: string) => void;
}

interface SkillFormState {
  name: string;
  description: string;
  systemPrompt: string;
  tags: string;
}

const EMPTY_FORM: SkillFormState = { name: '', description: '', systemPrompt: '', tags: '' };

export function PluginsPage({ onClose, onSelectAgent }: PluginsPageProps) {
  const { customAgents, createAgent, updateAgent, deleteAgent } = useAgentsStore();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SkillFormState>(EMPTY_FORM);

  const all = useMemo(() => [...BUILT_IN_AGENTS, ...customAgents], [customAgents]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [all, query]);

  const isBuiltIn = (a: AgentDefinition) => a.id.startsWith('builtin-');

  const openNewForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (agent: AgentDefinition) => {
    setEditingId(agent.id);
    setForm({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      tags: agent.skills.join(', '),
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.systemPrompt.trim()) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingId) {
      updateAgent(editingId, {
        name: form.name,
        description: form.description,
        systemPrompt: form.systemPrompt,
        skills: tags,
      });
    } else {
      createAgent({
        name: form.name,
        description: form.description,
        systemPrompt: form.systemPrompt,
        skills: tags,
      });
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950 flex flex-col safe-top safe-bottom">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-dark-700/50 shrink-0">
        <h1 className="text-lg font-bold flex-1">Plugins</h1>
        <button
          onClick={openNewForm}
          className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all"
          title="Nova skill"
        >
          <Plus size={20} />
        </button>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <X size={20} />
        </button>
      </header>

      {!showForm && (
        <div className="px-4 py-3 shrink-0">
          <div className="glass rounded-xl flex items-center gap-2 px-3 py-2.5">
            <Search size={16} className="text-dark-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar agentes e skills..."
              className="flex-1 bg-transparent text-sm text-white placeholder-dark-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-3">
          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide pt-2">
            {editingId ? 'Editar skill' : 'Nova skill'}
          </p>
          <input
            autoFocus
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nome (ex: Suporte ao cliente)"
            className="w-full bg-dark-900/80 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-jarbas-500"
          />
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descrição curta"
            className="w-full bg-dark-900/80 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-jarbas-500"
          />
          <textarea
            value={form.systemPrompt}
            onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
            placeholder="Instruções (system prompt) que definem como o Jarbas deve se comportar nessa skill"
            rows={6}
            className="w-full bg-dark-900/80 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-jarbas-500 resize-none"
          />
          <input
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags separadas por vírgula (ex: vendas, suporte)"
            className="w-full bg-dark-900/80 border border-dark-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-jarbas-500"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
              className="flex-1 btn-ghost py-2.5 text-sm border border-dark-700/50"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary py-2.5 text-sm">
              {editingId ? 'Salvar' : 'Criar skill'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-2">
          {results.map(agent => (
            <div
              key={agent.id}
              className="w-full text-left glass rounded-xl p-4 hover:border-jarbas-500/30 transition-all flex items-start gap-3"
            >
              <button
                onClick={() => onSelectAgent(agent.id)}
                className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center shrink-0 mt-0.5"
              >
                {isBuiltIn(agent) ? <Sparkles size={16} className="text-jarbas-400" /> : <Bot size={16} className="text-emerald-400" />}
              </button>
              <button onClick={() => onSelectAgent(agent.id)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                  {isBuiltIn(agent) && (
                    <span className="text-xs text-dark-400 bg-dark-800 border border-dark-700/50 rounded-full px-2 py-0.5 shrink-0">
                      Padrão
                    </span>
                  )}
                </div>
                {agent.description && (
                  <p className="text-xs text-dark-400 mt-1 line-clamp-2">{agent.description}</p>
                )}
                {agent.skills.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-1.5">
                    {agent.skills.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-jarbas-300 bg-jarbas-600/15 border border-jarbas-500/20 rounded-full px-2 py-0.5">
                        <Tag size={9} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
              {!isBuiltIn(agent) && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(agent)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-all"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {results.length === 0 && (
            <div className="text-center text-dark-600 text-sm py-16">
              <Bot size={32} className="mx-auto mb-3 opacity-30" />
              <p>{query ? 'Nenhum resultado encontrado' : 'Nenhuma skill criada ainda'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
