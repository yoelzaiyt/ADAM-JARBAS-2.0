import { useMemo, useState } from 'react';
import { X, Search, MessageSquare, Folder } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface LibraryPageProps {
  onClose: () => void;
  onOpenConversation: (id: string) => void;
}

export function LibraryPage({ onClose, onOpenConversation }: LibraryPageProps) {
  const { conversations, projects } = useChatStore();
  const [query, setQuery] = useState('');

  const projectById = useMemo(
    () => new Map(projects.map(p => [p.id, p.name])),
    [projects]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(conv => {
      if (conv.title.toLowerCase().includes(q)) return true;
      return conv.messages.some(m => m.content.toLowerCase().includes(q));
    });
  }, [conversations, query]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const snippet = (content: string) => {
    const trimmed = content.replace(/\s+/g, ' ').trim();
    return trimmed.length > 90 ? trimmed.slice(0, 90) + '...' : trimmed;
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950 flex flex-col safe-top safe-bottom">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-dark-700/50 shrink-0">
        <h1 className="text-lg font-bold flex-1">Biblioteca</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <X size={20} />
        </button>
      </header>

      <div className="px-4 py-3 shrink-0">
        <div className="glass rounded-xl flex items-center gap-2 px-3 py-2.5">
          <Search size={16} className="text-dark-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar em suas conversas..."
            className="flex-1 bg-transparent text-sm text-white placeholder-dark-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-2">
        {results.map(conv => {
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <button
              key={conv.id}
              onClick={() => onOpenConversation(conv.id)}
              className="w-full text-left glass rounded-xl p-4 hover:border-jarbas-500/30 transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare size={16} className="text-dark-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white truncate">{conv.title}</p>
                  {conv.projectId && projectById.has(conv.projectId) && (
                    <span className="flex items-center gap-1 text-xs text-jarbas-300 bg-jarbas-600/15 border border-jarbas-500/20 rounded-full px-2 py-0.5 shrink-0">
                      <Folder size={10} /> {projectById.get(conv.projectId)}
                    </span>
                  )}
                </div>
                {lastMsg && (
                  <p className="text-xs text-dark-400 mt-1 truncate">{snippet(lastMsg.content)}</p>
                )}
                <p className="text-xs text-dark-600 mt-1">{formatDate(conv.updatedAt)} · {conv.messages.length} mensagens</p>
              </div>
            </button>
          );
        })}

        {results.length === 0 && (
          <div className="text-center text-dark-600 text-sm py-16">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p>{query ? 'Nenhum resultado encontrado' : 'Sua biblioteca está vazia'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
