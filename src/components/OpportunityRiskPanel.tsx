import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Check, 
  DollarSign, 
  Building2, 
  UserCheck, 
  Flame, 
  Quote, 
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  CrmOpportunity, 
  MeddpiccItem, 
  DealGap, 
  NextBestAction, 
  RiskSeverity, 
  AnalysisState 
} from '../types/dealpulse';

interface OpportunityRiskPanelProps {
  opportunity: CrmOpportunity;
  analysisState: AnalysisState;
  onExecuteAction: (action: NextBestAction) => void;
  onOpenTranscript: () => void;
  onEscalateToHuman?: () => void;
  isRunning: boolean;
}

export const OpportunityRiskPanel: React.FC<OpportunityRiskPanelProps> = ({
  opportunity,
  analysisState,
  onExecuteAction,
  onOpenTranscript,
  onEscalateToHuman,
  isRunning,
}) => {
  const [expandedMeddpicc, setExpandedMeddpicc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'meddpicc' | 'gaps' | 'actions'>('overview');

  const { riskScore, severity, meddpiccItems, gaps, actions, handoffPacket } = analysisState;
  const isFrozen = !!handoffPacket?.isFrozen;

  // Severity color mapping
  const getSeverityBadge = (sev: RiskSeverity) => {
    switch (sev) {
      case 'critical':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          label: 'CRITICAL RISK',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-500',
          label: 'HIGH RISK',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
          label: 'MEDIUM RISK',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-500',
          label: 'HEALTHY / LOW RISK',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return {
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          text: 'Validated',
        };
      case 'weak':
        return {
          bg: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
          icon: AlertTriangle,
          text: 'Weak Coverage',
        };
      case 'missing':
        return {
          bg: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
          icon: XCircle,
          text: 'Missing',
        };
      case 'blocker':
        return {
          bg: 'bg-red-950/90 text-red-300 border-red-500/50',
          icon: ShieldAlert,
          text: 'Deal Blocker',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: Clock,
          text: 'Unchecked',
        };
    }
  };

  const currentSev = getSeverityBadge(severity);

  return (
    <div className="flex flex-col h-full bg-[#0d131f] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Deal Context Top Strip */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {opportunity.accountName}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {opportunity.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {opportunity.industry} · AE: {opportunity.assignedAe}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-extrabold text-white font-mono">
                ${(opportunity.arr / 1000).toLocaleString()}k ARR
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                <span>Close: {opportunity.closeDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Deal Meta Pills */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-teal-300 font-medium border border-slate-700">
              {opportunity.stage}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
              Competitor: {opportunity.competitors[0] || 'None'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
              Champion: {opportunity.primaryContact.name}
            </span>
          </div>

          <button
            onClick={onOpenTranscript}
            className="text-[11px] font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Read 8-15 Turn Transcript</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 px-4">
        {[
          { key: 'overview', label: 'Risk Overview' },
          { key: 'meddpicc', label: `MEDDPICC Grid (${meddpiccItems.length})` },
          { key: 'gaps', label: `Identified Gaps (${gaps.length})` },
          { key: 'actions', label: `Next-Best Actions (${actions.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Risk Meter Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Score Number + Badge */}
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950 shadow-inner">
                      <span className="text-2xl font-black font-mono text-white tracking-tighter">
                        {riskScore}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentSev.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${currentSev.dot} animate-pulse`} />
                        {currentSev.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                      {severity === 'critical'
                        ? 'High probability of deal slip or failure without specialist intervention on Paper Process.'
                        : 'Manageable deal risk. Requires direct engagement with Economic Buyer to secure budget.'}
                    </p>
                  </div>
                </div>

                {/* Score Decomposition */}
                <div className="w-full md:w-56 space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Risk Decomposition Factors
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                      <span>MEDDPICC Gaps</span>
                      <span className="font-mono text-teal-400 font-bold">{analysisState.scoreBreakdown.meddpiccWeight}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${(analysisState.scoreBreakdown.meddpiccWeight / 60) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                      <span>Sentiment / Objection Penalty</span>
                      <span className="font-mono text-amber-400 font-bold">+{analysisState.scoreBreakdown.sentimentPenalty}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(analysisState.scoreBreakdown.sentimentPenalty / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                      <span>Timeline Compression</span>
                      <span className="font-mono text-rose-400 font-bold">+{analysisState.scoreBreakdown.timelineRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${(analysisState.scoreBreakdown.timelineRisk / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Risk Analysis Summary</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysisState.summary}
              </p>
            </div>

            {/* Top Gaps Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Critical Deal Gaps ({gaps.length})</span>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className="text-teal-400 hover:text-teal-300 text-[11px] font-medium"
                >
                  View All Gaps →
                </button>
              </div>

              <div className="space-y-2">
                {gaps.slice(0, 2).map((gap) => (
                  <div
                    key={gap.id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          gap.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {gap.severity}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-100">{gap.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">{gap.description}</p>
                      {gap.evidenceQuote && (
                        <div className="text-[10px] text-slate-400 italic bg-slate-950 p-1.5 rounded font-mono border border-slate-800/80">
                          "{gap.evidenceQuote}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Action Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Top Next-Best Actions ({actions.length})</span>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="text-teal-400 hover:text-teal-300 text-[11px] font-medium"
                >
                  View Action Plan →
                </button>
              </div>

              {actions.slice(0, 2).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-500/30">
                        {act.owner}
                      </span>
                      <h4 className="text-xs font-semibold text-white">{act.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{act.description}</p>
                  </div>

                  <button
                    onClick={() => onExecuteAction(act)}
                    disabled={act.status === 'executed' || isRunning}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      act.status === 'executed'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold cursor-pointer active:scale-95'
                    }`}
                  >
                    {act.status === 'executed' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Executed</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Execute Action</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MEDDPICC GRID */}
        {activeTab === 'meddpicc' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              8-Dimension Sales Methodology analysis computed from call audio transcript & CRM graphs.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {meddpiccItems.map((item) => {
                const badge = getStatusBadge(item.status);
                const Icon = badge.icon;
                const isExpanded = expandedMeddpicc === item.key;

                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-black text-xs text-teal-400 font-mono">
                            {item.shortCode}
                          </div>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {badge.text}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Progress Bar & Toggle */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                        <span>Confidence Score</span>
                        <span className="font-mono font-bold text-teal-400">{item.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full ${
                            item.score > 70 ? 'bg-emerald-500' : item.score > 40 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      <button
                        onClick={() => setExpandedMeddpicc(isExpanded ? null : item.key)}
                        className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        {isExpanded ? 'Hide Evidence & Recommendation' : 'View Quote & Recommendation'}
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>

                      {/* Expandable Evidence */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-2 text-[11px]">
                          {item.evidenceQuotes.length > 0 && (
                            <div className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-[10px] text-slate-300 italic">
                              <span className="not-italic text-teal-400 font-sans font-semibold block mb-0.5">
                                Verbatim Call Evidence:
                              </span>
                              {item.evidenceQuotes.join('\n')}
                            </div>
                          )}
                          <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-500/20">
                            <strong className="text-amber-200">Recommendation:</strong> {item.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GAPS LIST */}
        {activeTab === 'gaps' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Specific risk vulnerabilities extracted from conversational turns requiring tactical mitigation.
            </div>

            <div className="space-y-3">
              {gaps.map((gap) => (
                <div
                  key={gap.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        gap.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {gap.severity} severity
                      </span>
                      <h4 className="text-xs font-bold text-white">{gap.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Impact Weight: -{gap.impactScore} pts
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gap.description}
                  </p>

                  {gap.evidenceQuote && (
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                      <div className="flex items-center gap-1 text-[10px] text-teal-400 font-sans font-semibold mb-1">
                        <Quote className="w-3 h-3" />
                        <span>Transcript Citation ({gap.speaker}):</span>
                      </div>
                      "{gap.evidenceQuote}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NEXT-BEST ACTIONS */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            {isFrozen ? (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">Autonomous Actions Frozen:</span>{' '}
                  <span className="text-slate-300">{handoffPacket?.frozenReason || 'Escalated to human Deal Desk authority. Automatic skill dispatches are paused pending sign-off.'}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Executable actions proposed by DealPulse agent. Click to dispatch reusable MCP skills in real-time.</span>
                {onEscalateToHuman && (
                  <button
                    onClick={onEscalateToHuman}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    Escalate to Human
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {actions.map((act) => {
                const isExecuted = act.status === 'executed';
                return (
                  <div
                    key={act.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isExecuted
                        ? 'bg-slate-900/60 border-emerald-500/40'
                        : isFrozen
                        ? 'bg-slate-900/40 border-slate-800 opacity-70'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30 font-semibold">
                            {act.owner}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            act.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {act.priority}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {act.dueTimeframe}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white">{act.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>

                        {act.skillToTrigger && (
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 pt-1">
                            <span>MCP Skill:</span>
                            <span className="text-teal-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                              {act.skillToTrigger}
                            </span>
                          </div>
                        )}

                        {isExecuted && act.resultSummary && (
                          <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-500/30 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{act.resultSummary}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          id={`execute-action-${act.id}`}
                          onClick={() => onExecuteAction(act)}
                          disabled={isExecuted || isRunning || isFrozen}
                          className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isExecuted
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : isFrozen
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 cursor-pointer active:scale-95'
                          }`}
                          title={isFrozen ? 'Autonomous actions frozen by human escalation' : undefined}
                        >
                          {isExecuted ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Skill Executed</span>
                            </>
                          ) : isFrozen ? (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                              <span>Frozen (Human Review)</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Execute Skill</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
