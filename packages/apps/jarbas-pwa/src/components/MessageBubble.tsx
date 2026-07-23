import type { ChatMessage } from '../types';
import { User, Copy, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { StarAvatar } from './StarAvatar';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [message.timestamp]);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-jarbas-600">
          <User size={16} />
        </div>
      ) : (
        <StarAvatar state={message.isStreaming ? 'responding' : 'idle'} size={32} className="mt-0.5" />
      )}

      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`
          inline-block max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-jarbas-600 text-white rounded-br-md'
            : 'bg-dark-800/80 text-dark-100 rounded-bl-md'}
          ${message.isStreaming ? 'animate-pulse-slow' : ''}
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none break-words">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match) {
                      return (
                        <div className="my-2 rounded-xl overflow-hidden border border-dark-700">
                          <div className="flex items-center justify-between bg-dark-900 px-3 py-1.5 text-xs text-dark-400">
                            <span>{match[1]}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                              }}
                              className="hover:text-white transition-colors"
                            >
                              Copiar
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-dark-900 px-1.5 py-0.5 rounded text-jarbas-300 text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>;
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-jarbas-400 hover:text-jarbas-300 underline">
                        {children}
                      </a>
                    );
                  },
                  h1({ children }) {
                    return <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-base font-bold mb-2 text-white">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-jarbas-500 pl-3 my-2 text-dark-300 italic">
                        {children}
                      </blockquote>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-2">
                        <table className="w-full text-xs border-collapse">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="border border-dark-700 px-2 py-1 bg-dark-900 text-left">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="border border-dark-700 px-2 py-1">{children}</td>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-dark-600">{formattedTime}</span>
          {!isUser && message.content && !message.isStreaming && (
            <button
              onClick={handleCopy}
              className="text-dark-600 hover:text-dark-300 transition-colors p-0.5"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
