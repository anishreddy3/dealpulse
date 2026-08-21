import React, { useState, useEffect, useRef } from 'react';
import { 
  DemoScenario, 
  AnalysisState, 
  ActionLedgerEntry, 
  ChatMessage, 
  NextBestAction,
  McpSkill,
  HandoffPacket,
  HandoffTimelineNode
} from './types/dealpulse';
import { SCENARIO_A, SCENARIO_B } from './fixtures/scenarios';
import { DealPulseOrchestrator } from './engine/orchestrator';
import { MCP_SKILL_REGISTRY, executeMcpSkill } from './mcp/registry';
import { Header } from './components/Header';
import { ChatConsole } from './components/ChatConsole';
import { OpportunityRiskPanel } from './components/OpportunityRiskPanel';
import { PlatformRightPanel } from './components/PlatformRightPanel';
import { TranscriptModal } from './components/TranscriptModal';
import { ArchitectureDrawer } from './components/ArchitectureDrawer';
import { ArtifactModal } from './components/ArtifactModal';

export function App() {
  // Demo scenario state (default Scenario B as per requirements)
  const [currentScenario, setCurrentScenario] = useState<DemoScenario>(SCENARIO_B);
  
  // Dashboard & Engine State
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    analyzed: false,
    analyzing: false,
    riskScore: 0,
    severity: 'low',
    scoreBreakdown: { meddpiccWeight: 0, sentimentPenalty: 0, timelineRisk: 0 },
    summary: 'Ready for analysis.',
    meddpiccItems: [],
    gaps: [],
    actions: [],
    handoffPacket: null,
    handoffTimeline: [],
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<ActionLedgerEntry[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeSkill, setActiveSkill] = useState<string | undefined>(undefined);

  // Modals / Drawers
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [selectedArtifact, setSelectedArtifact] = useState<{
    type: string;
    title: string;
    content: string;
  } | null>(null);

  // Orchestrator Engine Reference
  const orchestratorRef = useRef<DealPulseOrchestrator | null>(null);

  // Callbacks passed to orchestrator
  const handleStatusUpdate = (status: string, skill?: string) => {
    setActiveSkill(skill);
  };

  const handleChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const handleLedgerEntry = (entry: ActionLedgerEntry) => {
    setLedgerEntries((prev) => [entry, ...prev]);
  };

  const handleStateUpdate = (newState: AnalysisState) => {
    setAnalysisState(newState);
  };

  // Initialize and run on scenario change or startup
  const initializeDemo = async (scenario: DemoScenario) => {
    if (orchestratorRef.current) {
      orchestratorRef.current.stop();
    }
    
    setChatMessages([]);
    setLedgerEntries([]);
    setIsRunning(true);

    const orchestrator = new DealPulseOrchestrator(scenario, {
      onStatusUpdate: handleStatusUpdate,
      onChatMessage: handleChatMessage,
      onLedgerEntry: handleLedgerEntry,
      onStateUpdate: handleStateUpdate,
    });
    orchestratorRef.current = orchestrator;

    const finalState = await orchestrator.runFullDealAnalysis();
    setAnalysisState(finalState);
    setIsRunning(false);
    setActiveSkill(undefined);
  };

  useEffect(() => {
    // Initial run on mount with Scenario B
    initializeDemo(currentScenario);
    return () => {
      if (orchestratorRef.current) {
        orchestratorRef.current.stop();
      }
    };
  }, []);

  // Handle Scenario Switch
  const handleSelectScenario = async (scenarioId: 'scenario_a' | 'scenario_b') => {
    if (isRunning) return;
    const targetScenario = scenarioId === 'scenario_b' ? SCENARIO_B : SCENARIO_A;
    setCurrentScenario(targetScenario);
    await initializeDemo(targetScenario);
  };

  // Handle Manual "Run Demo" button
  const handleRunDemo = async () => {
    if (isRunning) return;
    await initializeDemo(currentScenario);
  };

  // Handle "Escalate to Human" action
  const handleEscalateToHuman = () => {
    if (!analysisState.handoffPacket) return;

    const humanTimelineNode: HandoffTimelineNode = {
      agentName: 'Human Deal Desk Lead (VP RevOps)',
      role: 'Human In The Loop Authority',
      status: 'active',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      summary: 'Automated deal execution frozen. Awaiting manual executive approval & legal sign-off.',
      isHuman: true,
    };

    const updatedHandoffPacket: HandoffPacket = {
      ...analysisState.handoffPacket,
      status: 'escalated_to_human',
      isFrozen: true,
      frozenReason: 'Manual Human Escalation triggered by user. Autonomous skill dispatches frozen pending Deal Desk sign-off.',
    };

    const updatedTimeline = [
      ...analysisState.handoffTimeline.map(t => t.status === 'active' ? { ...t, status: 'completed' as const } : t),
      humanTimelineNode,
    ];

    const updatedState: AnalysisState = {
      ...analysisState,
      handoffPacket: updatedHandoffPacket,
      handoffTimeline: updatedTimeline,
    };

    setAnalysisState(updatedState);

    // Log to Action Ledger
    const escalationLedgerEntry: ActionLedgerEntry = {
      id: `LEDGER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      correlationId: updatedHandoffPacket.correlationId,
      timestamp: new Date().toLocaleTimeString(),
      skillName: 'handoff.to_human',
      category: 'HANDOFF',
      inputs: {
        packet_id: updatedHandoffPacket.packetId,
        recommended_owner: updatedHandoffPacket.recommendedOwner,
        risk_score: updatedHandoffPacket.riskScore,
        freeze_auto_actions: true,
      },
      outputs: {
        escalation_status: 'TRANSFERRED_TO_HUMAN_EXECUTIVE',
        deal_desk_owner: updatedHandoffPacket.recommendedOwner,
        auto_actions_frozen: true,
        notification_channels: ['#deal-desk-war-room', 'Salesforce_P1_Lock', 'VP_RevOps_Pager'],
      },
      status: 'success',
      executionTimeMs: 142,
      agentOwner: 'Deal Desk Supervisor Agent',
      notes: `Escalated to human: ${updatedHandoffPacket.recommendedOwner}. Auto-actions frozen.`,
    };
    setLedgerEntries(prev => [escalationLedgerEntry, ...prev]);

    // Add chat message
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-escalate-${Date.now()}`,
        sender: 'agent',
        agentName: 'Human Deal Desk Router',
        avatar: 'HUM',
        text: `🛑 **Deal Escalated to Human Authority — Auto-Actions Frozen**\n\n- **Assigned Owner**: **${updatedHandoffPacket.recommendedOwner}**\n- **Packet ID**: \`${updatedHandoffPacket.packetId}\` (Checksum: \`${updatedHandoffPacket.checksum.slice(0, 18)}...\`)\n- **Risk Score**: **${updatedHandoffPacket.riskScore} / 100**\n- **Status**: Automated execution is **LOCKED** pending human executive review.\n\n*Incident transfer record logged to Action Ledger and synchronized to Slack #deal-desk-war-room.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Handle Reset
  const handleReset = () => {
    if (orchestratorRef.current) {
      orchestratorRef.current.stop();
    }
    setIsRunning(false);
    setActiveSkill(undefined);
    initializeDemo(currentScenario);
  };

  // Handle Next-Best Action execution
  const handleExecuteAction = async (action: NextBestAction) => {
    if (isRunning || !orchestratorRef.current) return;
    setIsRunning(true);
    const result = await orchestratorRef.current.executeAction(action, analysisState);
    if (result.artifact) {
      setSelectedArtifact(result.artifact);
    }
    setIsRunning(false);
  };

  // Handle Interactive CTA button clicks in chat messages
  const handleExecuteCta = async (cta: {
    id: string;
    label: string;
    actionType: string;
    skillName?: string;
    artifact?: any;
  }) => {
    if (cta.actionType === 'open_artifact' && cta.artifact) {
      setSelectedArtifact(cta.artifact);
      return;
    }
    if (cta.skillName && orchestratorRef.current) {
      if (isRunning) return;
      setIsRunning(true);
      const actionToRun: NextBestAction = {
        id: `cta-${Date.now()}`,
        title: cta.label,
        owner: 'DealPulse Agent',
        priority: 'urgent',
        dueTimeframe: 'Immediate',
        description: `Triggered via CTA button "${cta.label}"`,
        skillToTrigger: cta.skillName,
        status: 'pending',
      };
      const res = await orchestratorRef.current.executeAction(actionToRun, analysisState);
      if (res.artifact) {
        setSelectedArtifact(res.artifact);
      }
      setIsRunning(false);
    }
  };

  // Handle Chat input
  const handleSendMessage = async (query: string) => {
    if (isRunning || !orchestratorRef.current) return;
    setIsRunning(true);
    await orchestratorRef.current.handleUserChatQuery(query, analysisState);
    setIsRunning(false);
  };

  // Handle Quick Prompt Chip click
  const handleSelectPrompt = async (prompt: string) => {
    if (isRunning || !orchestratorRef.current) return;
    setIsRunning(true);
    await orchestratorRef.current.handleUserChatQuery(prompt, analysisState);
    setIsRunning(false);
  };

  // Handle Test Skill from MCP Skills Registry
  const handleTestSkill = async (skill: McpSkill) => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveSkill(skill.name);

    const inputs: Record<string, any> = {
      opportunity_id: currentScenario.opportunity.id,
      account_name: currentScenario.opportunity.accountName,
      test_trigger: 'manual_registry_runner',
    };

    const { output, executionTimeMs } = await executeMcpSkill(
      skill.name,
      inputs,
      {
        opportunity: currentScenario.opportunity,
        transcript: currentScenario.transcript,
      }
    );

    const entry: ActionLedgerEntry = {
      id: `LEDGER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      correlationId: `test-${Date.now().toString(36)}`,
      timestamp: new Date().toLocaleTimeString(),
      skillName: skill.name,
      category: skill.category.toUpperCase(),
      inputs,
      outputs: output,
      status: 'success',
      executionTimeMs,
      agentOwner: 'MCP Registry Test Runner',
      notes: `Manual execution invoked for skill "${skill.name}"`,
    };

    handleLedgerEntry(entry);
    handleChatMessage({
      id: `msg-test-${Date.now()}`,
      sender: 'agent',
      agentName: 'MCP Registry Runner',
      avatar: 'MCP',
      text: `⚡ **Manual Test of MCP Skill \`${skill.name}\` Succeeded** (${executionTimeMs}ms):\n\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\``,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setActiveSkill(undefined);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <Header
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
        onRunDemo={handleRunDemo}
        onReset={handleReset}
        onOpenTranscript={() => setIsTranscriptOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        isRunning={isRunning}
        activeSkill={activeSkill}
      />

      {/* Main 3-Column Enterprise Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: Chat / Agent Console (4 cols on LG) */}
        <section className="lg:col-span-4 h-[540px] sm:h-[600px] lg:h-[calc(100vh-5rem)] flex flex-col">
          <ChatConsole
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isRunning={isRunning}
            activeSkill={activeSkill}
            onSelectPrompt={handleSelectPrompt}
            onOpenArtifact={(artifact) => setSelectedArtifact(artifact)}
            onExecuteCta={handleExecuteCta}
          />
        </section>

        {/* Center Column: Opportunity Risk Panel (4 cols on LG) */}
        <section className="lg:col-span-4 h-[540px] sm:h-[600px] lg:h-[calc(100vh-5rem)] flex flex-col">
          <OpportunityRiskPanel
            opportunity={currentScenario.opportunity}
            analysisState={analysisState}
            onExecuteAction={handleExecuteAction}
            onOpenTranscript={() => setIsTranscriptOpen(true)}
            onEscalateToHuman={handleEscalateToHuman}
            isRunning={isRunning}
          />
        </section>

        {/* Right Column: Platform Panels (4 cols on LG) */}
        <section className="lg:col-span-4 h-[540px] sm:h-[600px] lg:h-[calc(100vh-5rem)] flex flex-col">
          <PlatformRightPanel
            ledgerEntries={ledgerEntries}
            handoffPacket={analysisState.handoffPacket}
            handoffTimeline={analysisState.handoffTimeline}
            onTestSkill={handleTestSkill}
            onEscalateToHuman={handleEscalateToHuman}
            isRunning={isRunning}
          />
        </section>
      </main>

      {/* Modals & Drawers */}
      {isTranscriptOpen && (
        <TranscriptModal
          scenario={currentScenario}
          onClose={() => setIsTranscriptOpen(false)}
        />
      )}

      {isArchitectureOpen && (
        <ArchitectureDrawer
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
      )}

      {selectedArtifact && (
        <ArtifactModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </div>
  );
}

export default App;
