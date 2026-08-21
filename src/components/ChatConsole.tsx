import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Quote, 
  Sparkles, 
  Cpu, 
  FileCheck, 
  Scale, 
  Mail, 
  ArrowRight, 
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Ticket,
  CheckSquare,
  UserCheck
} from 'lucide-react';
import { ChatMessage } from '../types/dealpulse';

interface ChatConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isRunning: boolean;
  activeSkill?: string;
  onSelectPrompt: (prompt: string) => void;
  onOpenArtifact: (artifact: { type: string; title: string; content: string }) => void;
  onExecuteCta?: (cta: { id: string; label: string; actionType: string; skillName?: string; artifact?: any }) => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  messages,
  onSendMessage,
  isRunning,
  activeSkill,
  onSelectPrompt,
  onOpenArtifact,
  onExecuteCta,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Why is Economic Buyer weak?',
    'Draft the AE brief',
    'Hand off to compliance',
    'Escalate to human deal desk',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeSkill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isRunning) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
  };

  const getCtaIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ticket':
        return <Scale className="w-3.5 h-3.5 text-amber-400" />;
      case 'mail':
        return <Mail className="w-3.5 h-3.5 text-teal-400" />;
      case 'tasks':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'user':
        return <UserCheck className="w-3.5 h-3.5 text-rose-400" />;
      case 'shield':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const getCtaVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'warning':
        return 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-200 border-amber-500/40 hover:border-amber-400';
      case 'danger':
        return 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-200 border-rose-500/40 hover:border-rose-400';
      case 'secondary':
        return 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600';
      case 'primary':
      default:
        return 'bg-teal-950/50 hover:bg-teal-900/60 text-teal-200 border-teal-500/40 hover:border-teal-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d131f] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Console Header */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-teal-400 animate-ping' : 'bg-teal-400'}`} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Agent Console & Dialogue
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
            {isRunning ? 'Orchestrating Live' : 'MCP Ready'}
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-normal">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 text-[10px] font-bold shadow-sm">
                  {msg.avatar || 'DP'}
                </div>
              )}

              <div className={`max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && msg.agentName && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-teal-400">
                      {msg.agentName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl border leading-relaxed ${
                    isUser
                      ? 'bg-teal-600/20 text-teal-100 border-teal-500/30 rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-200 border-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Message formatted content */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>
                        {paragraph.split('**').map((part, pIdx) => {
                          if (pIdx % 2 === 1) {
                            return <strong key={pIdx} className="text-white font-semibold">{part}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    ))}
                  </div>

                  {/* Transcript Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                        <Quote className="w-3 h-3" />
                        <span>Verbatim Transcript Evidence</span>
                      </div>
                      {msg.citations.map((c, i) => (
                        <div
                          key={i}
                          className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px] text-slate-300 font-mono italic"
                        >
                          "{c.quote}"
                          <div className="mt-1 text-[10px] text-teal-400/90 not-italic font-sans font-medium flex items-center justify-between">
                            <span>— {c.speaker}</span>
                            {c.category && (
                              <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                                {c.category}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generated Artifact Button */}
                  {msg.generatedArtifact && (
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => msg.generatedArtifact && onOpenArtifact(msg.generatedArtifact)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-teal-950/40 hover:bg-teal-900/40 border border-teal-500/30 text-teal-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {msg.generatedArtifact.type === 'email' ? (
                            <Mail className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="truncate">{msg.generatedArtifact.title}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      </button>
                    </div>
                  )}

                  {/* Interactive CTA Buttons */}
                  {msg.ctaButtons && msg.ctaButtons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/90 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-400" />
                        <span>Actionable Execution CTAs</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.ctaButtons.map((cta) => (
                          <button
                            key={cta.id}
                            id={`cta-btn-${cta.id}`}
                            onClick={() => {
                              if (cta.actionType === 'open_artifact' && cta.artifact) {
                                onOpenArtifact(cta.artifact);
                              } else if (onExecuteCta) {
                                onExecuteCta(cta);
                              } else if (cta.skillName) {
                                onSelectPrompt(cta.label);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${getCtaVariantStyles(cta.variant)}`}
                          >
                            <div className="flex items-center gap-2 text-left">
                              {getCtaIcon(cta.iconName)}
                              <span>{cta.label}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <span className="block text-[10px] text-slate-500 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                )}
              </div>

              {isUser && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Step Status */}
        {activeSkill && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-teal-950/30 border border-teal-500/40 text-teal-300 shadow-md">
            <Cpu className="w-4 h-4 text-teal-400 animate-spin flex-shrink-0" />
            <div className="text-[11px] font-mono leading-tight">
              <span className="text-slate-400">DealPulse executing: </span>
              <span className="font-bold text-teal-300">{activeSkill}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Fast Prompts */}
      <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80">
        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>Quick Agent Questions</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              id={`quick-prompt-${i}`}
              onClick={() => onSelectPrompt(prompt)}
              disabled={isRunning}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 hover:text-teal-300 text-slate-300 border border-slate-700/80 transition-colors disabled:opacity-50 text-left cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          id="chat-console-input"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask DealPulse or give instructions (e.g. 'Draft AE brief')..."
          disabled={isRunning}
          className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 disabled:opacity-50"
        />
        <button
          id="chat-console-send-btn"
          type="submit"
          disabled={!inputQuery.trim() || isRunning}
          className="p-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Send Query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
