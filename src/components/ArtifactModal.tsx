import React, { useState } from 'react';
import { X, Mail, Scale, Check, Copy, FileText, CheckCircle2 } from 'lucide-react';

interface ArtifactModalProps {
  artifact: {
    type: string;
    title: string;
    content: string;
  } | null;
  onClose: () => void;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({
  artifact,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEmail = artifact.type === 'email';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isEmail ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {isEmail ? <Mail className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {artifact.title}
              </h3>
              <p className="text-xs text-slate-400">
                Generated via DealPulse MCP Skill Execution
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

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
              Artifact Type: {artifact.type.toUpperCase()}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Content' : 'Copy Content'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 whitespace-pre-wrap font-sans leading-relaxed text-xs">
            {artifact.content}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
