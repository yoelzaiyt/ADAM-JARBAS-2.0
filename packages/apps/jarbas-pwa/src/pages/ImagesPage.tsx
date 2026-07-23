import { useState } from 'react';
import { X, Image as ImageIcon, Loader2, Download, Wand2, RefreshCcw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface ImagesPageProps {
  onClose: () => void;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

const MODELS = [
  { id: 'google/gemini-2.5-flash-image', label: 'Nano Banana (Gemini 2.5 Flash Image)' },
  { id: 'google/gemini-3.1-flash-lite-image', label: 'Nano Banana 2 Lite (mais rápido)' },
];

export function ImagesPage({ onClose }: ImagesPageProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.generateImage(text, {
        model,
        referenceImages: referenceImage ? [referenceImage] : undefined,
      });
      const newImages: GeneratedImage[] = result.images.map((url, i) => ({
        id: `${Date.now()}-${i}`,
        url,
        prompt: text,
      }));
      setImages(prev => [...newImages, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const download = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `jarbas-${img.id}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950 flex flex-col safe-top safe-bottom">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-dark-700/50 shrink-0">
        <h1 className="text-lg font-bold flex-1 flex items-center gap-2">
          <ImageIcon size={18} className="text-jarbas-400" /> Imagens
        </h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <X size={20} />
        </button>
      </header>

      <div className="px-4 py-3 shrink-0 space-y-2">
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="w-full bg-dark-900/80 border border-dark-700 rounded-xl px-3 py-2 text-xs text-dark-300 focus:outline-none focus:border-jarbas-500"
        >
          {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        {referenceImage && (
          <div className="flex items-center gap-2 glass rounded-xl p-2">
            <img src={referenceImage} alt="Referência" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            <span className="text-xs text-dark-400 flex-1">Editando a partir desta imagem</span>
            <button
              onClick={() => setReferenceImage(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="glass-strong rounded-2xl flex items-end gap-2 p-2">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva a imagem que você quer criar..."
            rows={2}
            className="flex-1 bg-transparent text-white placeholder-dark-500 resize-none focus:outline-none px-2 py-2 text-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`
              p-2.5 rounded-xl transition-all shrink-0
              ${!isLoading && prompt.trim()
                ? 'bg-jarbas-600 hover:bg-jarbas-500 text-white active:scale-90'
                : 'text-dark-600 cursor-not-allowed'}
            `}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {images.length === 0 && !isLoading ? (
          <div className="text-center text-dark-600 text-sm py-16">
            <ImageIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p>Suas imagens geradas vão aparecer aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {isLoading && (
              <div className="aspect-square rounded-xl bg-dark-900 border border-dark-700/50 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-jarbas-400" />
              </div>
            )}
            {images.map(img => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-dark-700/50">
                <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-end justify-end gap-1 p-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setReferenceImage(img.url)}
                    className="p-2 rounded-lg bg-dark-900/80 text-white hover:bg-jarbas-600 transition-all"
                    title="Usar como referência"
                  >
                    <RefreshCcw size={14} />
                  </button>
                  <button
                    onClick={() => download(img)}
                    className="p-2 rounded-lg bg-dark-900/80 text-white hover:bg-jarbas-600 transition-all"
                    title="Baixar"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
