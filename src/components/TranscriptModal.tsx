import React from 'react';
import { X, FileText, User, Quote, Sparkles } from 'lucide-react';
import { TranscriptTurn, DemoScenario } from '../types/dealpulse';

interface TranscriptModalProps {
  scenario: DemoScenario;
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  scenario,
  onClose,
}) => {
  const getSpeakerColor = (role: string) => {
    if (role.includes('(Us)')) return 'text-teal-400 bg-teal-950/60 border-teal-500/30';
    if (role.includes('Counsel') || role.includes('Legal')) return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
    if (role.includes('VP') || role.includes('Director')) return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
    return 'text-sky-400 bg-sky-950/60 border-sky-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Sales Call Transcript: {scenario.opportunity.accountName}
              </h3>
              <p className="text-xs text-slate-400">
                {scenario.transcript.length} turns recorded · Opportunity: {scenario.opportunity.id} (${(scenario.opportunity.arr / 1000).toLocaleString()}k ARR)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Turns List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              <strong>Audio NLP & MEDDPICC Grounding:</strong> Colored badges indicate conversational turns where critical MEDDPICC signals and friction points were identified.
            </span>
          </div>

          {scenario.transcript.map((turn) => {
            const colorClass = getSpeakerColor(turn.role);
            return (
              <div
                key={turn.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${colorClass}`}>
                      {turn.speaker} ({turn.role})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    {turn.meddpiccTag && (
                      <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-500/30 font-bold uppercase">
                        {turn.meddpiccTag.replace('_', ' ')}
                      </span>
                    )}
                    <span>{turn.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs leading-relaxed pl-1">
                  "{turn.text}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close Transcript
          </button>
        </div>
      </div>
    </div>
  );
};
