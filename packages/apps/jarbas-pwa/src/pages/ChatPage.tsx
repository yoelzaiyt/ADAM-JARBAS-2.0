import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useAutoScroll } from '../hooks/useUI';
import { ChatMessage } from '../types';
import {
  Send, Plus, Settings, LogOut, Trash2, Menu, X, Bot,
  Sparkles, ChevronDown, MessageSquare, Cpu, Loader2
} from 'lucide-react';
import { ProviderSelector } from '../components/ProviderSelector';
import { MessageBubble } from '../components/MessageBubble';

export function ChatPage() {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { logout } = useAuthStore();
  const {
    conversations, activeConversation, isLoading,
    createConversation, setActiveConversation, deleteConversation,
    sendMessage, getActiveMessages, selectedProvider, selectedModel, setProvider,
  } = useChatStore();

  const messages = getActiveMessages();
  const { ref: scrollRef, onScroll } = useAutoScroll(messages);

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

        <button
          onClick={() => { createConversation(); setShowSidebar(false); }}
          className="mx-4 mt-4 mb-2 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Nova conversa
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`
                group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
                ${activeConversation === conv.id
                  ? 'bg-jarbas-600/20 border border-jarbas-500/30 text-white'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'}
              `}
              onClick={() => { setActiveConversation(conv.id); setShowSidebar(false); }}
            >
              <MessageSquare size={16} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{conv.title}</p>
                <p className="text-xs text-dark-500">{formatDate(conv.updatedAt)}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center text-dark-600 text-sm py-12">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p>Nenhuma conversa ainda</p>
            </div>
          )}
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
            <h2 className="text-sm font-semibold truncate">
              {activeConversation
                ? conversations.find(c => c.id === activeConversation)?.title || 'Conversa'
                : 'JARBAS'}
            </h2>
            <p className="text-xs text-dark-400 flex items-center gap-1">
              <Cpu size={12} />
              {selectedProvider} / {selectedModel.split('/').pop()}
            </p>
          </div>
          {!activeConversation && (
            <button onClick={createConversation} className="btn-ghost p-2">
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
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`
                  p-2.5 rounded-xl transition-all shrink-0
                  ${input.trim() && !isLoading
                    ? 'bg-jarbas-600 hover:bg-jarbas-500 text-white active:scale-90'
                    : 'text-dark-600 cursor-not-allowed'}
                `}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
