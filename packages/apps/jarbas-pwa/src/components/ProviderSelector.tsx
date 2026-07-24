import type { AIProviderName } from '../types';
import { X, Check, Cpu, Zap, Globe, Brain } from 'lucide-react';

interface ProviderSelectorProps {
  selectedProvider: AIProviderName;
  selectedModel: string;
  onSelect: (provider: AIProviderName, model: string) => void;
  onClose: () => void;
}

const PROVIDERS: { name: AIProviderName; label: string; icon: typeof Cpu; color: string; models: string[] }[] = [
  {
    name: 'deepseek',
    label: 'DeepSeek',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    name: 'openrouter',
    label: 'OpenRouter',
    icon: Globe,
    color: 'from-purple-500 to-pink-500',
    models: [
      'anthropic/claude-sonnet-4-20250514',
      'anthropic/claude-3.5-haiku',
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.1-405b-instruct',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
    ],
  },
  {
    name: 'nvidia',
    label: 'NVIDIA NIM',
    icon: Cpu,
    color: 'from-green-500 to-emerald-500',
    models: [
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'nvidia/llama-3.3-70b-instruct',
      'meta/llama-3.1-405b-instruct',
    ],
  },
  {
    name: 'hermes',
    label: 'Hermes (Nous)',
    icon: Zap,
    color: 'from-violet-500 to-purple-500',
    models: ['Hermes-3-Llama-3.1-405B-FP8', 'Hermes-3-Llama-3.1-70B-FP8'],
  },
  {
    name: 'zhipuai',
    label: 'ZhipuAI (GLM)',
    icon: Brain,
    color: 'from-teal-500 to-cyan-500',
    models: ['glm-4-flash', 'glm-4-plus', 'glm-4'],
  },
  {
    name: 'qwen',
    label: 'Qwen (Alibaba Cloud)',
    icon: Cpu,
    color: 'from-orange-500 to-red-500',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
  },
];

export function ProviderSelector({ selectedProvider, selectedModel, onSelect, onClose }: ProviderSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-dark-900 border-t md:border border-dark-700/50 rounded-t-3xl md:rounded-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
          <h3 className="font-semibold text-lg">Provider & Modelo</h3>
          <button onClick={onClose} className="p-1 btn-ghost">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {PROVIDERS.map(provider => {
            const Icon = provider.icon;
            return (
              <div key={provider.name} className="glass rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{provider.label}</p>
                    <p className="text-xs text-dark-400">{provider.models.length} modelos</p>
                  </div>
                  {selectedProvider === provider.name && (
                    <div className="w-6 h-6 rounded-full bg-jarbas-600 flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </div>

                <div className="px-3 pb-3 space-y-1">
                  {provider.models.map(model => (
                    <button
                      key={model}
                      onClick={() => onSelect(provider.name, model)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between
                        ${selectedProvider === provider.name && selectedModel === model
                          ? 'bg-jarbas-600/20 text-jarbas-300 border border-jarbas-500/30'
                          : 'text-dark-300 hover:bg-dark-800'}
                      `}
                    >
                      <span className="truncate font-mono">{model.split('/').pop()}</span>
                      {selectedProvider === provider.name && selectedModel === model && (
                        <Check size={12} className="text-jarbas-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
