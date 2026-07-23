import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Mic, AudioLines } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface VoiceModePageProps {
  onClose: () => void;
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'unsupported';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function VoiceModePage({ onClose }: VoiceModePageProps) {
  const { sendMessage, getActiveMessages, isLoading, activeConversation } = useChatStore();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const spokenMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceState('unsupported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk;
        else interimText += chunk;
      }
      setTranscript(interimText || finalText);
      if (finalText.trim()) {
        recognition.stop();
        setTranscript(finalText.trim());
        setVoiceState('thinking');
        sendMessage(finalText.trim());
      }
    };

    recognition.onerror = () => {
      setVoiceState('idle');
    };

    recognition.onend = () => {
      setVoiceState(prev => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || voiceState === 'listening') return;
    window.speechSynthesis?.cancel();
    setTranscript('');
    setVoiceState('listening');
    try {
      recognitionRef.current.start();
    } catch {
      // already started
    }
  }, [voiceState]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setVoiceState('idle');
  }, []);

  const handleMicPress = () => {
    if (voiceState === 'listening') stopListening();
    else if (voiceState === 'idle') startListening();
  };

  // Fala a última resposta do assistente assim que ela terminar de chegar
  useEffect(() => {
    if (isLoading) return;
    const messages = getActiveMessages();
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || last.isStreaming) return;
    if (spokenMessageIdRef.current === last.id) return;
    if (!last.content.trim()) return;
    if (!window.speechSynthesis) {
      setVoiceState('idle');
      return;
    }

    spokenMessageIdRef.current = last.id;
    const utterance = new SpeechSynthesisUtterance(last.content);
    utterance.lang = 'pt-BR';
    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('idle');
    utterance.onerror = () => setVoiceState('idle');
    window.speechSynthesis.speak(utterance);
    setVoiceState('speaking');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, activeConversation]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const orbLabel: Record<VoiceState, string> = {
    idle: 'Toque no microfone para falar',
    listening: 'Ouvindo...',
    thinking: 'Pensando...',
    speaking: 'Respondendo...',
    unsupported: 'Reconhecimento de voz não é suportado neste navegador',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col safe-top safe-bottom">
      <header className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <span className="text-sm font-medium text-dark-400">Modo de voz</span>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <X size={22} className="text-white" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div
          className={`
            w-56 h-56 rounded-full transition-all duration-500 ease-out
            bg-[radial-gradient(circle_at_35%_30%,#e0e7ff_0%,#818cf8_35%,#4f46e5_65%,#1e1b4b_100%)]
            ${voiceState === 'listening' ? 'scale-110 shadow-[0_0_80px_20px_rgba(99,102,241,0.55)]' : ''}
            ${voiceState === 'speaking' ? 'animate-pulse-slow shadow-[0_0_100px_30px_rgba(129,140,248,0.6)]' : ''}
            ${voiceState === 'thinking' ? 'scale-95 opacity-80' : ''}
            ${voiceState === 'idle' ? 'shadow-[0_0_50px_10px_rgba(99,102,241,0.35)]' : ''}
          `}
        />
        <p className="text-dark-300 text-sm text-center max-w-xs">{orbLabel[voiceState]}</p>
        {transcript && voiceState !== 'unsupported' && (
          <p className="text-white text-center text-base max-w-sm px-4">{transcript}</p>
        )}
      </div>

      <div className="shrink-0 px-6 pb-8 pt-2 flex items-center justify-center">
        <button
          onClick={handleMicPress}
          disabled={voiceState === 'unsupported' || voiceState === 'thinking' || voiceState === 'speaking'}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90
            ${voiceState === 'listening' ? 'bg-jarbas-600' : 'bg-white'}
            ${(voiceState === 'unsupported' || voiceState === 'thinking' || voiceState === 'speaking') ? 'opacity-40' : ''}
          `}
        >
          {voiceState === 'listening'
            ? <AudioLines size={26} className="text-white" />
            : <Mic size={26} className="text-black" />}
        </button>
      </div>
    </div>
  );
}
