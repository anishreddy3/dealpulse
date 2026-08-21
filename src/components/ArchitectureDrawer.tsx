import React from 'react';
import { 
  X, 
  Layers, 
  Cpu, 
  GitBranch, 
  Share2, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Volume2, 
  ShieldCheck 
} from 'lucide-react';

interface ArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDrawer: React.FC<ArchitectureDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border-l border-slate-700 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                DealPulse Architecture & Track 2 Roadmap
              </h3>
              <p className="text-xs text-slate-400">
                MCP Fabric Skills · Agent Orchestrator · Verifiable Handoffs · Stage 2 Vision
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

        {/* Drawer Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Architecture Pipeline Flow */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <GitBranch className="w-4 h-4" />
              <span>Track 2 Orchestration Architecture</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-[10px]">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-teal-300 font-bold">
                  <div>1. Sales Call & CRM</div>
                  <div className="text-[9px] text-slate-500 font-normal">Audio & CRM Graph</div>
                </div>
                <div className="flex items-center justify-center text-slate-600">→</div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-teal-500/40 text-teal-300 font-bold">
                  <div>2. MCP Fabric</div>
                  <div className="text-[9px] text-slate-500 font-normal">9 Reusable Skills</div>
                </div>
                <div className="flex items-center justify-center text-slate-600">→</div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-teal-300 font-bold">
                  <div>3. DealPulse Agent</div>
                  <div className="text-[9px] text-slate-500 font-normal">MEDDPICC + Risk</div>
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-600">↓</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                  <div>4. Next-Best Actions</div>
                  <div className="text-[9px] text-slate-500 font-normal">Direct Skill Triggers</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 font-bold">
                  <div>5. Handoff OS</div>
                  <div className="text-[9px] text-slate-500 font-normal">Agent → Specialist → Human</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-bold">
                  <div>6. Action Ledger</div>
                  <div className="text-[9px] text-slate-500 font-normal">Immutable Audit Trail</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Design Tenets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Core Architectural Tenets</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>Model Context Protocol (MCP) Fabric as First-Class Primitives</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-3">
                  All deal interactions are represented as decoupled, declarative MCP skills (`transcript.analyze`, `crm.get_opportunity`, `meddpicc.extract`, `ticket.create_legal_review`). Tools can be executed by primary orchestrators, specialized subagents, or human RevOps.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>Verifiable Handoff Packets with Checksums</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-3">
                  When risk scores cross operational safety thresholds (e.g. Risk &gt; 70 or BaFin regulatory redlines), execution is not dropped into a generic chat loop. A cryptographic context packet is formulated with verbatim quotes, prior decisions, and open questions to ensure zero loss of context during agent-to-specialist routing.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>Immutable Action Ledger</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-3">
                  Every tool call, input parameter, output payload, latency measurement, and correlation ID is appended to an immutable audit trail for full enterprise explainability and compliance review.
                </p>
              </div>
            </div>
          </div>

          {/* Stage 2 Roadmap */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Stage 2 Hackathon Roadmap & Enterprise Integrations</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-300">
                  <Database className="w-3.5 h-3.5" />
                  <span>Freshworks MCP & Agent Studio</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Native integration with Freshsales CRM and Freshservice deal desk workflows. Automated pipeline hygiene bots and automatic SLA escalation triggers.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-300">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ElevenLabs AE Voice Briefs</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Generate a 60-second synthetic voice briefing for Account Executives prior to customer calls, summarizing critical MEDDPICC gaps and negotiation talking points.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-300">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Live Salesforce & HubSpot Connectors</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bidirectional syncing with Salesforce Opportunity records, custom MEDDPICC custom fields, and Gong/Chorus call recording webhooks.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-300">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Automated Ground Truth Evals</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Continuous benchmark evaluation suite testing LLM MEDDPICC extraction precision, hallucination suppression, and risk scoring accuracy across 500+ enterprise deals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
