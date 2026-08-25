import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Share2, 
  FileCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Clock, 
  Terminal, 
  ArrowDown, 
  User, 
  Bot, 
  Sparkles,
  Play,
  Zap,
  ArrowRight,
  Code2,
  Boxes,
  CheckCircle,
  Eye,
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  UserPlus,
  Lock,
  Quote
} from 'lucide-react';
import { 
  McpSkill, 
  ActionLedgerEntry, 
  HandoffPacket, 
  HandoffTimelineNode 
} from '../types/dealpulse';
import { MCP_SKILL_REGISTRY } from '../mcp/registry';

interface PlatformRightPanelProps {
  ledgerEntries: ActionLedgerEntry[];
  handoffPacket: HandoffPacket | null;
  handoffTimeline: HandoffTimelineNode[];
  onTestSkill: (skill: McpSkill) => void;
  onEscalateToHuman?: () => void;
  isRunning: boolean;
}

export const PlatformRightPanel: React.FC<PlatformRightPanelProps> = ({
  ledgerEntries,
  handoffPacket,
  handoffTimeline,
  onTestSkill,
  onEscalateToHuman,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'handoffs' | 'ledger'>('skills');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);
  const [expandedLedgerId, setExpandedLedgerId] = useState<string | null>(null);
  const [copiedPacket, setCopiedPacket] = useState(false);
  const [packetViewMode, setPacketViewMode] = useState<'incident_note' | 'raw_json'>('incident_note');

  const handleCopyPacket = () => {
    if (!handoffPacket) return;
    navigator.clipboard.writeText(JSON.stringify(handoffPacket, null, 2));
    setCopiedPacket(true);
    setTimeout(() => setCopiedPacket(false), 2000);
  };

  const filteredSkills = MCP_SKILL_REGISTRY.filter((skill) => {
    if (skillFilter === 'all') return true;
    return skill.category === skillFilter;
  });

  // Find the most recent ledger entry for a given skill name
  const getLastInvocation = (skillName: string): ActionLedgerEntry | undefined => {
    return ledgerEntries.find((entry) => entry.skillName === skillName);
  };

  const selectedSkill = MCP_SKILL_REGISTRY.find((s) => s.name === selectedSkillName);
  const selectedSkillInvocation = selectedSkillName ? getLastInvocation(selectedSkillName) : undefined;
  const isFrozen = !!handoffPacket?.isFrozen;

  return (
    <div className="flex flex-col h-full bg-[#0d131f] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Panel Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/90">
        <button
          id="tab-mcp-skills"
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'skills'
              ? 'border-teal-400 text-teal-300 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>MCP Skills ({MCP_SKILL_REGISTRY.length})</span>
        </button>

        <button
          id="tab-handoffs-os"
          onClick={() => setActiveTab('handoffs')}
          className={`flex-1 py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'handoffs'
              ? 'border-teal-400 text-teal-300 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Handoffs OS</span>
          {handoffPacket && (
            <span className={`w-2 h-2 rounded-full ${isFrozen ? 'bg-amber-400' : 'bg-teal-400'} animate-pulse`} />
          )}
        </button>

        <button
          id="tab-action-ledger"
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-teal-400 text-teal-300 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Action Ledger ({ledgerEntries.length})</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-3.5 overflow-y-auto">
        {/* ================= TAB 1: MCP SKILLS REGISTRY ================= */}
        {activeTab === 'skills' && (
          <div className="space-y-3">
            {/* Track 2 Core Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-teal-300 font-bold text-xs">
                  <Boxes className="w-4 h-4 text-teal-400" />
                  <span>Track 2 · Platform Agent Skills & Knowledge</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Reusable across any agent client
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                <strong className="text-white">"Build skills once. Any agent can call them."</strong> Modular MCP tools decoupled from agent business logic. Click any card to inspect its runtime payload.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex flex-wrap gap-1">
                {[
                  { key: 'all', label: 'All (9)' },
                  { key: 'crm', label: 'CRM' },
                  { key: 'analysis', label: 'Analysis' },
                  { key: 'comms', label: 'Comms' },
                  { key: 'compliance', label: 'Compliance' },
                  { key: 'orchestration', label: 'Handoff' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSkillFilter(f.key)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      skillFilter === f.key
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {ledgerEntries.length} Invocations Logged
              </span>
            </div>

            {/* Grid of Skill Cards (2 Columns on MD/LG) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkillName === skill.name;
                const lastInvocation = getLastInvocation(skill.name);

                return (
                  <div
                    key={skill.name}
                    id={`skill-card-${skill.name.replace('.', '-')}`}
                    onClick={() => setSelectedSkillName(isSelected ? null : skill.name)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-400 ring-1 ring-teal-400/40 shadow-lg'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-mono text-xs font-bold text-teal-300 group-hover:text-teal-200 truncate">
                          {skill.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 flex-shrink-0">
                          v{skill.version}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1">
                        {lastInvocation ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>{lastInvocation.executionTimeMs}ms (Logged)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[9px] font-mono">
                            Standby
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTestSkill(skill);
                          }}
                          disabled={isRunning}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 font-medium transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                          title="Execute Skill in Isolated Test Runner"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Run</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Skill Detail & Last Invocations Inspector */}
            {selectedSkill && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-teal-500/40 shadow-xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-teal-400" />
                      <h4 className="font-mono text-xs font-bold text-white">
                        {selectedSkill.name}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                        {selectedSkill.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedSkill.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSkillName(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Last Invocation I/O from Action Ledger */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-teal-400" />
                      <span>Last Invocation I/O (Action Ledger Audit)</span>
                    </span>
                    {selectedSkillInvocation ? (
                      <span className="text-[9px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                        {selectedSkillInvocation.correlationId} · {selectedSkillInvocation.timestamp} ({selectedSkillInvocation.executionTimeMs}ms)
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                        No runtime calls recorded yet
                      </span>
                    )}
                  </div>

                  {selectedSkillInvocation ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[10px]">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Inputs Payload:</div>
                        <pre className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto max-h-40">
                          {JSON.stringify(selectedSkillInvocation.inputs, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-teal-400 uppercase mb-0.5">Outputs Payload:</div>
                        <pre className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-teal-300 overflow-x-auto max-h-40">
                          {JSON.stringify(selectedSkillInvocation.outputs, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-900 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                      Click <strong>"Run"</strong> on this card or click <strong>"Run Demo"</strong> at the top to invoke this skill live and record inputs/outputs to the ledger.
                    </div>
                  )}
                </div>

                {/* Formal MCP Schema Definitions */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-1">
                      Input Schema Spec
                    </div>
                    <pre className="text-slate-300 text-[9px] overflow-x-auto max-h-24">
                      {JSON.stringify(selectedSkill.inputSchema, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-1">
                      Output Schema Spec
                    </div>
                    <pre className="text-teal-300 text-[9px] overflow-x-auto max-h-24">
                      {JSON.stringify(selectedSkill.outputSchema, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: HANDOFFS OS (PRODUCTION INCIDENT TRANSFER NOTES) ================= */}
        {activeTab === 'handoffs' && (
          <div className="space-y-4">
            {/* Frozen Notice Banner if Escalated */}
            {isFrozen && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/40 border border-amber-500/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 uppercase tracking-wide">
                        🛑 Deal Escalated to Human Authority
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.2 rounded border border-amber-500/30 font-bold">
                        AUTO-ACTIONS FROZEN
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {handoffPacket?.frozenReason || 'This deal has been escalated to human Deal Desk authority. All autonomous agent skill executions are suspended.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="flex-shrink-0 px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-semibold border border-teal-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Terminal className="w-3 h-3" />
                  <span>View Action Ledger →</span>
                </button>
              </div>
            )}

            {/* Top Incident Transfer Header & Escalate CTA */}
            <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Incident Transfer Note</span>
                </span>
                {handoffPacket && (
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: <strong className="text-white">{handoffPacket.packetId}</strong>
                  </span>
                )}
              </div>

              {/* Escalate to Human Button */}
              {onEscalateToHuman && (
                <button
                  id="btn-escalate-to-human"
                  onClick={onEscalateToHuman}
                  disabled={isFrozen || isRunning || !handoffPacket}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isFrozen
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 active:scale-95'
                  }`}
                  title={isFrozen ? 'Already escalated to human authority' : 'Append human handoff event and freeze autonomous actions'}
                >
                  {isFrozen ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Human Escalated</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Escalate to Human</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Timeline Flow */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Agent-to-Specialist-to-Human Timeline</span>
                <span className="text-[10px] text-slate-500 font-mono">{handoffTimeline.length} Nodes</span>
              </div>

              <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
                {handoffTimeline.map((node, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 ${
                        node.isHuman
                          ? 'bg-rose-500 text-white ring-4 ring-rose-500/20'
                          : node.status === 'completed'
                          ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-500/20'
                          : node.status === 'active'
                          ? 'bg-teal-400 text-slate-950 animate-pulse ring-2 ring-teal-400/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {node.isHuman ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className={`flex-1 p-2.5 rounded-xl border ${
                      node.isHuman
                        ? 'bg-rose-950/30 border-rose-500/40 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {node.agentName}
                          {node.isHuman && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono uppercase">
                              HUMAN SIGN-OFF
                            </span>
                          )}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          node.status === 'active' 
                            ? 'bg-teal-500/20 text-teal-300' 
                            : node.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {node.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-teal-400 font-mono mb-1">{node.role}</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{node.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Incident Transfer Note Card */}
            {handoffPacket && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                {/* Switch view between Incident Note Spec and Raw JSON */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-white">
                      Verifiable Incident Handoff Packet
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex text-[10px] font-mono">
                      <button
                        onClick={() => setPacketViewMode('incident_note')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          packetViewMode === 'incident_note'
                            ? 'bg-teal-500/20 text-teal-300 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Note View
                      </button>
                      <button
                        onClick={() => setPacketViewMode('raw_json')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          packetViewMode === 'raw_json'
                            ? 'bg-teal-500/20 text-teal-300 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Raw JSON
                      </button>
                    </div>

                    <button
                      onClick={handleCopyPacket}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors cursor-pointer"
                      title="Copy Full JSON Payload"
                    >
                      {copiedPacket ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPacket ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Packet Checksum Banner */}
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">SHA-256 Checksum:</span>
                    <span className="text-teal-400 font-semibold truncate max-w-[200px] sm:max-w-[260px]">
                      {handoffPacket.checksum}
                    </span>
                  </div>
                  <span className="text-emerald-400 text-[9px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>

                {/* 1. Production Incident Note View */}
                {packetViewMode === 'incident_note' ? (
                  <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                    {/* Top Meta Grid: Risk Score, Recommended Owner, Severity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-3 border-b border-slate-800">
                      {/* Risk Score */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                          Risk Score
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-xl font-black font-mono ${
                            handoffPacket.riskScore >= 70
                              ? 'text-rose-400'
                              : handoffPacket.riskScore >= 40
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}>
                            {handoffPacket.riskScore}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                          <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            handoffPacket.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {handoffPacket.severity}
                          </span>
                        </div>
                      </div>

                      {/* Recommended Owner */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 sm:col-span-2">
                        <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                          <span>Recommended Owner</span>
                          <span className="text-[9px] text-teal-400 font-mono">Assigned Deal Lead</span>
                        </div>
                        <div className="font-semibold text-white truncate text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                          <span>{handoffPacket.recommendedOwner || 'VP RevOps & Deal Desk'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Reason */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Incident Escalation Reason
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                        {handoffPacket.reason}
                      </p>
                    </div>

                    {/* Section 1: MEDDPICC Gaps */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>MEDDPICC Gaps ({handoffPacket.meddpiccGaps.length})</span>
                      </div>
                      <div className="space-y-1">
                        {handoffPacket.meddpiccGaps.map((gap, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                            <span>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Evidence Quotes */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                        <Quote className="w-3 h-3 text-teal-400" />
                        <span>Evidence Quotes ({handoffPacket.evidenceQuotes.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {handoffPacket.evidenceQuotes.map((eq, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1"
                          >
                            <div className="text-[10px] font-mono text-teal-300 font-semibold flex items-center justify-between">
                              <span>Speaker: {eq.speaker}</span>
                            </div>
                            <blockquote className="text-slate-200 italic font-mono text-[10.5px]">
                              "{eq.quote}"
                            </blockquote>
                            {eq.context && (
                              <div className="text-[10px] text-slate-400 font-sans">
                                Context: {eq.context}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Decisions So Far */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        <span>Decisions So Far ({handoffPacket.decisionsSoFar.length})</span>
                      </div>
                      <div className="space-y-1">
                        {handoffPacket.decisionsSoFar.map((dec, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{dec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Open Questions */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-amber-400" />
                        <span>Open Questions ({handoffPacket.openQuestions.length})</span>
                      </div>
                      <div className="space-y-1">
                        {handoffPacket.openQuestions.map((q, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-200/90 flex items-start gap-2"
                          >
                            <span className="font-mono text-amber-400 font-bold">Q{i + 1}:</span>
                            <span>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. Raw JSON View */
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-teal-300/90 max-h-96">
                    <pre>{JSON.stringify(handoffPacket, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ACTION LEDGER ================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400">
              Immutable audit ledger recording every MCP skill call, parameters, correlation ID, and execution latency:
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No tool executions logged yet. Click "Run Demo" to initiate orchestration.
              </div>
            ) : (
              <div className="space-y-2.5">
                {ledgerEntries.map((entry) => {
                  const isExpanded = expandedLedgerId === entry.id;
                  const isEscalation = entry.skillName === 'handoff.to_human' || entry.category === 'HANDOFF';

                  return (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isEscalation
                          ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/20 border-rose-500/50 ring-1 ring-rose-500/20'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono font-bold ${isEscalation ? 'text-rose-300' : 'text-teal-400'}`}>
                              {entry.skillName}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                              isEscalation
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {isEscalation ? 'HUMAN ESCALATED' : entry.status}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {entry.correlationId} · {entry.agentOwner}
                          </div>
                        </div>

                        <div className="text-right font-mono text-[10px] text-slate-400">
                          <div>{entry.timestamp}</div>
                          <div className={`${isEscalation ? 'text-rose-400' : 'text-teal-400'} font-semibold`}>{entry.executionTimeMs}ms</div>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className={`text-[11px] mb-2 leading-relaxed ${isEscalation ? 'text-rose-200 font-medium' : 'text-slate-300'}`}>
                          {entry.notes}
                        </p>
                      )}

                      {/* Expandable JSON Inputs/Outputs */}
                      <button
                        onClick={() => setExpandedLedgerId(isExpanded ? null : entry.id)}
                        className="text-[10px] font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Payload Inspector' : 'Inspect Inputs & Outputs'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-800 space-y-2 font-mono text-[10px]">
                          <div>
                            <div className="text-slate-500 uppercase font-bold mb-0.5">Inputs:</div>
                            <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 overflow-x-auto">
                              {JSON.stringify(entry.inputs, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div className="text-slate-500 uppercase font-bold mb-0.5">Outputs:</div>
                            <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-teal-300 overflow-x-auto">
                              {JSON.stringify(entry.outputs, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

