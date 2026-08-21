import React from 'react';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  ChevronDown 
} from 'lucide-react';
import { DemoScenario } from '../types/dealpulse';

interface HeaderProps {
  currentScenario: DemoScenario;
  onSelectScenario: (scenarioId: 'scenario_a' | 'scenario_b') => void;
  onRunDemo: () => void;
  onReset: () => void;
  onOpenTranscript: () => void;
  onOpenArchitecture: () => void;
  isRunning: boolean;
  activeSkill?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  onRunDemo,
  onReset,
  onOpenTranscript,
  onOpenArchitecture,
  isRunning,
  activeSkill,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm shadow-teal-500/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DealPulse
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Track 2 · MCP Fabric
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Enterprise Deal-Risk Agent · MEDDPICC Gaps · Verifiable Handoffs
            </p>
          </div>
        </div>

        {/* Center: Live execution indicator if active */}
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono shadow-inner animate-pulse">
            <Cpu className="w-4 h-4 text-teal-400 animate-spin" />
            <span className="font-semibold text-teal-200">
              {activeSkill ? `Executing: ${activeSkill}` : 'Orchestrating Sequence (20-30s)…'}
            </span>
          </div>
        )}

        {/* Right: Controls & Scenario Selector */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Scenario Selector Dropdown */}
          <div className="relative inline-block">
            <label htmlFor="scenario-selector" className="sr-only">Select Demo Scenario</label>
            <select
              id="scenario-selector"
              value={currentScenario.id}
              onChange={(e) => onSelectScenario(e.target.value as 'scenario_a' | 'scenario_b')}
              disabled={isRunning}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-teal-500 cursor-pointer disabled:opacity-50 appearance-none font-medium hover:border-slate-600 transition-colors"
            >
              <option value="scenario_b">Scenario B: Late-stage legal block (High Risk - $350k)</option>
              <option value="scenario_a">Scenario A: Expanding enterprise — champion weak (Med Risk - $185k)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Transcript Viewer Button */}
          <button
            id="view-transcript-header-btn"
            onClick={onOpenTranscript}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            title="View raw multi-speaker sales call transcript"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Call Transcript</span>
          </button>

          {/* Architecture Drawer Button */}
          <button
            id="open-architecture-btn"
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            title="Track 2 Architecture & Stage 2 Roadmap"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          {/* Reset Button */}
          <button
            id="reset-demo-btn"
            onClick={onReset}
            disabled={isRunning}
            className="p-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Reset Demo State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Main "Run Demo" Action Button */}
          <button
            id="run-demo-main-btn"
            onClick={onRunDemo}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Sequence…</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Run Demo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progressive Top Loading Bar */}
      {isRunning && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
        </div>
      )}
    </header>
  );
};
