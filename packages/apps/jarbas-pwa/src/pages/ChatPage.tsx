import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useAutoScroll } from '../hooks/useUI';
import type { Conversation, Project } from '../types';
import {
  Send, Plus, Settings, LogOut, Trash2, Menu, X, Bot,
  Sparkles, MessageSquare, Cpu, Loader2, Mic,
  Folder, FolderPlus, ChevronRight, ChevronDown, Library, Code2, Puzzle, Image as ImageIcon,
} from 'lucide-react';
import { ProviderSelector } from '../components/ProviderSelector';
import { MessageBubble } from '../components/MessageBubble';
import { VoiceModePage } from './VoiceModePage';
import { LibraryPage } from './LibraryPage';
import { PluginsPage } from './PluginsPage';
import { ImagesPage } from './ImagesPage';
import { useAgentsStore } from '../store/agentsStore';

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  projects: Project[];
  onSelect: () => void;
  onDelete: () => void;
  onMove: (projectId: string | null) => void;
  formatDate: (ts: number) => string;
}

function ConversationItem({ conv, isActive, projects, onSelect, onDelete, onMove, formatDate }: ConversationItemProps) {
  return (
    <div
      className={`
        group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
        ${isActive
          ? 'bg-jarbas-600/20 border border-jarbas-500/30 text-white'
          : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'}
      `}
      onClick={onSelect}
    >
      {conv.mode === 'codex'
        ? <Code2 size={16} className="shrink-0 text-emerald-400" />
        : conv.agentId
          ? <Bot size={16} className="shrink-0 text-jarbas-400" />
          : <MessageSquare size={16} className="shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{conv.title}</p>
        <p className="text-xs text-dark-500">{formatDate(conv.updatedAt)}</p>
      </div>
      {projects.length > 0 && (
        <select
          value={conv.projectId ?? ''}
          onClick={e => e.stopPropagation()}
          onChange={e => onMove(e.target.value || null)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 bg-dark-800 text-dark-300 text-xs rounded-lg px-1 py-1 max-w-[92px] shrink-0 transition-opacity"
          title="Mover para projeto"
        >
          <option value="">Sem projeto</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function ChatPage() {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { logout } = useAuthStore();
  const {
    conversations, projects, activeConversation, isLoading,
    createConversation, setActiveConversation, deleteConversation,
    sendMessage, getActiveMessages, selectedProvider, selectedModel, setProvider,
    createProject, setConversationProject,
  } = useChatStore();
  const { getAgent } = useAgentsStore();

  const messages = getActiveMessages();
  const { ref: scrollRef, onScroll } = useAutoScroll(messages);
  const activeConv = conversations.find(c => c.id === activeConversation);
  const activeAgent = activeConv?.agentId ? getAgent(activeConv.agentId) : undefined;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus();
    }
  }, [activeConversation]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-dark-950 overflow-hidden">
      {showSidebar && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
      )}

      <aside className={`
        fixed md:relative z-50 md:z-auto
        w-72 md:w-80 h-full
        bg-dark-900 border-r border-dark-700/50
        flex flex-col
        transition-transform duration-300 ease-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-dark-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jarbas-500 to-purple-600 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <span className="font-bold text-gradient text-lg">JARBAS</span>
            </div>
            <button onClick={() => setShowSidebar(false)} className="md:hidden p-1 btn-ghost">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="mx-4 mt-4 mb-2 flex gap-2">
          <button
            onClick={() => { createConversation(); setShowSidebar(false); }}
            className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Nova conversa
          </button>
          <button
            onClick={() => setShowNewProject(v => !v)}
            className={`btn-ghost px-3 border border-dark-700/50 ${showNewProject ? 'bg-white/10 text-white' : ''}`}
            title="Novo projeto"
          >
            <FolderPlus size={18} />
          </button>
        </div>

        {showNewProject && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (newProjectName.trim()) {
                createProject(newProjectName);
                setNewProjectName('');
                setShowNewProject(false);
              }
            }}
            className="mx-4 mb-2 flex gap-2"
          >
            <input
              autoFocus
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') { setShowNewProject(false); setNewProjectName(''); } }}
              placeholder="Nome do projeto"
              className="flex-1 bg-dark-900/80 border border-dark-700 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-jarbas-500"
            />
            <button type="submit" className="btn-primary px-3 py-2 text-sm">Criar</button>
          </form>
        )}

        <div className="mx-2 mb-1 space-y-0.5">
          <button
            onClick={() => { setShowLibrary(true); setShowSidebar(false); }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all text-sm"
          >
            <Library size={16} /> Biblioteca
          </button>
          <button
            onClick={() => { createConversation({ provider: 'opencode', mode: 'codex' }); setShowSidebar(false); }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all text-sm"
          >
            <Code2 size={16} /> Codex
          </button>
          <button
            onClick={() => { setShowPlugins(true); setShowSidebar(false); }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all text-sm"
          >
            <Puzzle size={16} /> Plugins
          </button>
          <button
            onClick={() => { setShowImages(true); setShowSidebar(false); }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all text-sm"
          >
            <ImageIcon size={16} /> Imagens
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-4">
          {projects.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-xs font-semibold text-dark-500 uppercase tracking-wide">Projetos</p>
              {projects.map(project => {
                const projectConvs = conversations.filter(c => c.projectId === project.id);
                const isExpanded = expandedProjects[project.id] ?? true;
                return (
                  <div key={project.id}>
                    <button
                      onClick={() => setExpandedProjects(prev => ({ ...prev, [project.id]: !isExpanded }))}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Folder size={16} className="shrink-0" />
                      <span className="flex-1 min-w-0 text-sm text-left truncate">{project.name}</span>
                      <span className="text-xs text-dark-500">{projectConvs.length}</span>
                    </button>
                    {isExpanded && (
                      <div className="pl-6 space-y-1">
                        {projectConvs.map(conv => (
                          <ConversationItem
                            key={conv.id}
                            conv={conv}
                            isActive={activeConversation === conv.id}
                            projects={projects}
                            onSelect={() => { setActiveConversation(conv.id); setShowSidebar(false); }}
                            onDelete={() => deleteConversation(conv.id)}
                            onMove={(projectId) => setConversationProject(conv.id, projectId)}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-1">
            {projects.length > 0 && (
              <p className="px-2 text-xs font-semibold text-dark-500 uppercase tracking-wide">Conversas</p>
            )}
            {conversations.filter(c => !c.projectId).map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConversation === conv.id}
                projects={projects}
                onSelect={() => { setActiveConversation(conv.id); setShowSidebar(false); }}
                onDelete={() => deleteConversation(conv.id)}
                onMove={(projectId) => setConversationProject(conv.id, projectId)}
                formatDate={formatDate}
              />
            ))}

            {conversations.length === 0 && (
              <div className="text-center text-dark-600 text-sm py-12">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p>Nenhuma conversa ainda</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-dark-700/50 space-y-1">
          <button
            onClick={() => { setShowSettings(true); setShowSidebar(false); }}
            className="w-full btn-ghost text-sm py-2.5 flex items-center gap-2 px-3"
          >
            <Settings size={16} /> Configurações
          </button>
          <button
            onClick={logout}
            className="w-full btn-ghost text-sm py-2.5 flex items-center gap-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="glass-strong px-4 py-3 flex items-center gap-3 shrink-0 safe-top">
          <button onClick={() => setShowSidebar(true)} className="md:hidden p-1 btn-ghost">
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate flex items-center gap-1.5">
              {activeConv?.mode === 'codex' && <Code2 size={14} className="text-emerald-400 shrink-0" />}
              {!activeConv?.mode || activeConv.mode === 'chat' ? activeAgent && <Bot size={14} className="text-jarbas-400 shrink-0" /> : null}
              {activeConversation ? activeConv?.title || 'Conversa' : 'JARBAS'}
            </h2>
            <p className="text-xs text-dark-400 flex items-center gap-1">
              <Cpu size={12} />
              {activeConv?.mode === 'codex'
                ? 'Codex · opencode'
                : activeAgent
                  ? `${activeAgent.name} · skill`
                  : `${selectedProvider} / ${selectedModel.split('/').pop()}`}
            </p>
          </div>
          {!activeConversation && (
            <button onClick={() => createConversation()} className="btn-ghost p-2">
              <Plus size={20} />
            </button>
          )}
        </header>

        {showSettings && (
          <ProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelect={(p, m) => { setProvider(p, m); setShowSettings(false); }}
            onClose={() => setShowSettings(false)}
          />
        )}

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto no-scrollbar"
        >
          {!activeConversation || messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-jarbas-500/20 to-purple-600/20 flex items-center justify-center mb-6 border border-jarbas-500/20">
                <Sparkles size={40} className="text-jarbas-400" />
              </div>
              <h2 className="text-xl font-bold text-gradient mb-2">Olá! 👋</h2>
              <p className="text-dark-400 max-w-xs text-sm">
                Sou o JARBAS, seu assistente de IA. Como posso ajudar hoje?
              </p>
              <div className="grid grid-cols-2 gap-2 mt-8 max-w-sm w-full">
                {[
                  'Explique quantum computing',
                  'Escreva um haiku',
                  'Analise esses dados',
                  'Resuma este texto',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="glass text-left p-3 rounded-xl text-xs text-dark-300 hover:text-white hover:border-jarbas-500/30 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.isStreaming === false && (
                <div className="flex items-center gap-2 text-dark-400 text-sm py-2">
                  <Loader2 size={16} className="animate-spin text-jarbas-400" />
                  Pensando...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 safe-bottom">
          <div className="max-w-3xl mx-auto px-4 pb-3 pt-2">
            <div className="glass-strong rounded-2xl flex items-end gap-2 p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Mensagem..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-dark-500 resize-none focus:outline-none px-2 py-2 text-sm max-h-[120px]"
                style={{ minHeight: '40px' }}
              />
              {input.trim() ? (
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`
                    p-2.5 rounded-xl transition-all shrink-0
                    ${!isLoading
                      ? 'bg-jarbas-600 hover:bg-jarbas-500 text-white active:scale-90'
                      : 'text-dark-600 cursor-not-allowed'}
                  `}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              ) : (
                <button
                  onClick={() => setShowVoiceMode(true)}
                  className="p-2.5 rounded-xl bg-jarbas-600 hover:bg-jarbas-500 text-white active:scale-90 transition-all shrink-0"
                  title="Modo de voz"
                >
                  <Mic size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {showVoiceMode && <VoiceModePage onClose={() => setShowVoiceMode(false)} />}
      {showLibrary && (
        <LibraryPage
          onClose={() => setShowLibrary(false)}
          onOpenConversation={(id) => { setActiveConversation(id); setShowLibrary(false); }}
        />
      )}
      {showPlugins && (
        <PluginsPage
          onClose={() => setShowPlugins(false)}
          onSelectAgent={(agentId) => {
            createConversation({ agentId });
            setShowPlugins(false);
          }}
        />
      )}
      {showImages && <ImagesPage onClose={() => setShowImages(false)} />}
    </div>
  );
}
