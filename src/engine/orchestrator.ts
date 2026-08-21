import { 
  DemoScenario, 
  AnalysisState, 
  ActionLedgerEntry, 
  ChatMessage, 
  NextBestAction,
  HandoffPacket,
  HandoffTimelineNode,
  MeddpiccItem
} from '../types/dealpulse';
import { executeMcpSkill } from '../mcp/registry';
import { runDeterministicAnalysis } from './heuristicAnalyzer';
import { generateDynamicInsight, isGeminiConfigured } from './geminiService';

export interface OrchestrationCallbacks {
  onStatusUpdate?: (status: string, activeSkill?: string) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onLedgerEntry?: (entry: ActionLedgerEntry) => void;
  onStateUpdate?: (state: AnalysisState) => void;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DealPulseOrchestrator {
  private scenario: DemoScenario;
  private callbacks: OrchestrationCallbacks;
  private isRunning: boolean = false;
  private abortController: AbortController | null = null;

  constructor(scenario: DemoScenario, callbacks: OrchestrationCallbacks) {
    this.scenario = scenario;
    this.callbacks = callbacks;
  }

  public setScenario(scenario: DemoScenario) {
    this.scenario = scenario;
  }

  public stop() {
    this.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public async runFullDealAnalysis(): Promise<AnalysisState> {
    if (this.isRunning) {
      return runDeterministicAnalysis(this.scenario.opportunity, this.scenario.transcript);
    }
    this.isRunning = true;
    this.abortController = new AbortController();

    const isScenarioB = this.scenario.id === 'scenario_b';
    const opp = this.scenario.opportunity;
    const transcript = this.scenario.transcript;
    const correlationId = `corr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Helper for ledger logging
    const logLedger = (
      skillName: string,
      category: string,
      inputs: Record<string, any>,
      outputs: Record<string, any>,
      executionTimeMs: number,
      agentOwner: string = 'DealPulse Orchestrator',
      notes?: string
    ) => {
      const entry: ActionLedgerEntry = {
        id: `LEDGER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        correlationId,
        timestamp: new Date().toLocaleTimeString(),
        skillName,
        category,
        inputs,
        outputs,
        status: 'success',
        executionTimeMs,
        agentOwner,
        notes,
      };
      this.callbacks.onLedgerEntry?.(entry);
    };

    if (isScenarioB) {
      // =========================================================================
      // SCENARIO B: CINEMATIC 20-30 SECOND MULTI-SKILL ORCHESTRATION SEQUENCE
      // =========================================================================

      // ACT 0: Greeting / Initialization
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-init`,
        sender: 'agent',
        agentName: 'DealPulse Primary Orchestrator',
        avatar: 'DP',
        text: `🎬 **Initiating Track 2 MCP Deal-Risk Orchestration**\n\n- **Target Opportunity**: **${opp.accountName}** ($${(opp.arr / 1000).toFixed(0)}k ARR, Stage: ${opp.stage})\n- **Assigned AE**: ${opp.assignedAe}\n- **Context**: Evaluating 12 multi-speaker transcript turns against CRM pipeline intelligence.\n- **MCP Fabric Dispatch**: Triggering modular skill pipeline across Audio NLP, CRM Fabric, Sales Intel, Handoffs, and Compliance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Initial scanning state (Risk: 18 - Scanning)
      const scanningState: AnalysisState = {
        analyzed: false,
        analyzing: true,
        riskScore: 18,
        severity: 'low',
        scoreBreakdown: {
          meddpiccWeight: 10,
          sentimentPenalty: 5,
          timelineRisk: 3,
        },
        summary: 'Ingesting multi-speaker audio transcript and querying CRM opportunity topology...',
        meddpiccItems: [],
        gaps: [],
        actions: [],
        handoffPacket: null,
        handoffTimeline: [
          {
            agentName: 'DealPulse Primary Agent',
            role: 'Deal-Risk Evaluation & MEDDPICC Extraction',
            status: 'active',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            summary: 'Parsing conversation turns and checking CRM milestones.',
          },
          {
            agentName: 'Compliance Specialist Agent',
            role: 'BaFin EU Residency & DPA Redline Remediation',
            status: 'queued',
            timestamp: 'Pending handoff trigger',
            summary: 'Awaiting legal exception classification.',
          },
          {
            agentName: 'Human Deal Desk (VP RevOps)',
            role: 'Final Executive Approval & Exception Sign-off',
            status: 'queued',
            timestamp: 'Standby for P1 escalation',
            summary: 'Standby for unresolvable commercial blockers.',
            isHuman: true,
          },
        ],
      };
      this.callbacks.onStateUpdate?.(scanningState);

      // -----------------------------------------------------------------------
      // STEP 1: transcript.analyze (0s -> ~3.5s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('[Step 1/6] Calling MCP Skill: transcript.analyze (12 turns, 4 speakers)…', 'transcript.analyze');
      await delay(3500);
      if (!this.isRunning) return scanningState;

      const resTranscript = await executeMcpSkill('transcript.analyze', {
        deal_id: opp.id,
        turn_count: transcript.length,
        speakers: ['Rachel Thorne (Lead Counsel)', 'Vikram Mehta (Head of InfoSec)', 'Sarah Jenkins (AE)', 'Solution Architect'],
      }, { transcript, opportunity: opp });

      logLedger('transcript.analyze', 'Audio & NLP', {
        turns: transcript.length,
        deal_id: opp.id,
        speakers_detected: 4
      }, resTranscript.output, resTranscript.executionTimeMs, 'DealPulse Primary Agent', 'Parsed 12 turns, acoustic stress analysis flagged severe legal friction in turns 4, 7, and 9');

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-step1`,
        sender: 'agent',
        agentName: 'Audio NLP Engine',
        avatar: 'NLP',
        text: `🔍 **[Step 1/6] Transcript Audio Analysis Complete** (${resTranscript.executionTimeMs}ms):\n- **Speakers Identified**: Rachel Thorne (Lead Counsel), Vikram Mehta (Head of InfoSec), Sarah Jenkins (AE), Solution Architect\n- **Acoustic Sentiment**: Elevated friction detected in turns 4 & 9 (Keyword markers: *"BaFin", "Section 7.2", "Frankfurt AWS", "Thursday 5 PM cutoff"*).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // -----------------------------------------------------------------------
      // STEP 2: crm.get_opportunity (3.5s -> ~7.5s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('[Step 2/6] Calling MCP Skill: crm.get_opportunity (Graph & competitors)…', 'crm.get_opportunity');
      
      // Update intermediate state (Risk score: 42, initial items)
      const step2State: AnalysisState = {
        ...scanningState,
        riskScore: 42,
        severity: 'medium',
        scoreBreakdown: { meddpiccWeight: 22, sentimentPenalty: 12, timelineRisk: 8 },
        summary: 'Identified strong technical champion (Vikram Mehta), checking stakeholder approval gates...',
      };
      this.callbacks.onStateUpdate?.(step2State);

      await delay(3800);
      if (!this.isRunning) return step2State;

      const resCrm = await executeMcpSkill('crm.get_opportunity', {
        opportunity_id: opp.id,
        include_stakeholders: true,
        include_audit_trail: true,
      }, { transcript, opportunity: opp });

      logLedger('crm.get_opportunity', 'CRM Fabric', {
        opportunity_id: opp.id,
        fields_requested: ['arr', 'stage', 'close_date', 'stakeholder_map', 'competitor_intel']
      }, resCrm.output, resCrm.executionTimeMs, 'DealPulse Primary Agent', 'Retrieved Salesforce opportunity graph: $350k ARR, Stage 4 Proposal, Close Date End of Month');

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-step2`,
        sender: 'agent',
        agentName: 'CRM Fabric Agent',
        avatar: 'CRM',
        text: `📊 **[Step 2/6] CRM Topology Synced** (${resCrm.executionTimeMs}ms):\n- **ARR**: $350,000 | **Stage**: Proposal/Price Quote\n- **Champion**: Vikram Mehta (Head of InfoSec, 92% engagement)\n- **Primary Competitors**: Datadog & Splunk legacy migration\n- **Target Close**: End of current month.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // -----------------------------------------------------------------------
      // STEP 3: meddpicc.extract (7.5s -> ~13.0s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('[Step 3/6] Calling MCP Skill: meddpicc.extract (8 dimensions + quote citations)…', 'meddpicc.extract');
      await delay(4800);
      if (!this.isRunning) return step2State;

      const computedFullState = runDeterministicAnalysis(opp, transcript);

      const resMeddpicc = await executeMcpSkill('meddpicc.extract', {
        opportunity_id: opp.id,
        transcript_turns: transcript.length,
        scoring_model: 'MEDDPICC_ENTERPRISE_V2',
      }, { transcript, opportunity: opp });

      logLedger('meddpicc.extract', 'Sales Intelligence', {
        opportunity_id: opp.id,
        dimensions: ['Metrics', 'EB', 'DC', 'DP', 'Paper Process', 'Pain', 'Champion', 'Competition']
      }, resMeddpicc.output, resMeddpicc.executionTimeMs, 'DealPulse Primary Agent', 'Identified critical blockers: Paper Process (BaFin DPA Section 7.2) and Decision Process (Thursday 5 PM CET board cutoff)');

      // Update state to full 84 / 100 critical risk with all 8 MEDDPICC cards & Gaps
      this.callbacks.onStateUpdate?.(computedFullState);

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-step3`,
        sender: 'agent',
        agentName: 'MEDDPICC Analyzer',
        avatar: 'MED',
        text: `🚨 **[Step 3/6] Critical MEDDPICC Gaps Detected** (Risk Score: **84 / 100**):\n- 💥 **Paper Process [CRITICAL BLOCKER]**: Rachel Thorne (Lead Counsel) rejected standard DPA Section 7.2 over BaFin German banking telemetry rules and requested a 5x liability cap.\n- ⚠️ **Decision Process [HARD CUTOFF]**: Signed addendum must be delivered before **Thursday 5:00 PM CET** or deal is postponed to next quarter.\n- ✅ **Champion / Pain [STRONG]**: Vikram Mehta is fully aligned on technical capabilities.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          { quote: "GlobalFin cannot accept any cross-border telemetry routing outside the Frankfurt AWS availability zone.", speaker: "Rachel Thorne (Lead Counsel)", category: "Paper Process" },
          { quote: "If we don't submit the signed SOC2 Type II addendum and custom DPA by this Thursday 5 PM CET, this deal cannot close until late September.", speaker: "Rachel Thorne (Lead Counsel)", category: "Decision Process" },
        ],
      });

      // -----------------------------------------------------------------------
      // STEP 4: crm.update_stage (13.0s -> ~17.5s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('[Step 4/6] Calling MCP Skill: crm.update_stage (Flagging At Risk & locking forecast)…', 'crm.update_stage');
      await delay(4200);
      if (!this.isRunning) return computedFullState;

      const resStageUpdate = await executeMcpSkill('crm.update_stage', {
        opportunity_id: opp.id,
        previous_stage: opp.stage,
        new_stage: 'At Risk / Legal Review',
        risk_flag: 'P1_LEGAL_BLOCKER_BAFIN',
        confidence: 0.35,
      }, { transcript, opportunity: opp });

      logLedger('crm.update_stage', 'CRM Fabric', {
        opportunity_id: opp.id,
        previous_stage: opp.stage,
        new_stage: 'At Risk / Legal Review',
        risk_flag: 'P1_LEGAL_BLOCKER_BAFIN'
      }, resStageUpdate.output, resStageUpdate.executionTimeMs, 'CRM Sync Agent', 'Updated Salesforce stage to "At Risk / Legal Review" with P1 risk flag');

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-step4`,
        sender: 'agent',
        agentName: 'CRM Sync Agent',
        avatar: 'CRM',
        text: `🔄 **[Step 4/6] Salesforce Pipeline Stage Updated** (${resStageUpdate.executionTimeMs}ms):\n- **Opportunity**: ${opp.id} (${opp.accountName})\n- **Previous Stage**: ${opp.stage} ➔ **New Stage**: **At Risk / Legal Review**\n- **Risk Tag Applied**: \`P1_LEGAL_BLOCKER_BAFIN\`\n- **Forecast Category**: Moved from Commit to Under Review.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // -----------------------------------------------------------------------
      // STEP 5: handoff.route_specialist to Compliance Agent (17.5s -> ~22.0s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('[Step 5/6] Risk Score 84 > 70. Dispatching handoff.route_specialist (Compliance Agent)…', 'handoff.route_specialist');
      await delay(4500);
      if (!this.isRunning) return computedFullState;

      const resHandoff = await executeMcpSkill('handoff.route_specialist', {
        from_agent: 'DealPulse Primary Agent',
        target_specialist: 'Compliance Specialist Agent',
        risk_score: 84,
        packet_id: computedFullState.handoffPacket?.packetId || 'HPK-882194',
        checksum: 'sha256:b4e98f029a174cd3a17e0892c90e1f32a0c44298fc1c149afbf4c8996fb92427',
      }, { transcript, opportunity: opp });

      logLedger('handoff.route_specialist', 'Orchestration & Handoff', {
        target: 'Compliance Specialist Agent',
        reason: 'BaFin EU data residency redlines and Thursday 5 PM board cutoff',
        risk_score: 84,
        packet_id: computedFullState.handoffPacket?.packetId || 'HPK-882194',
      }, resHandoff.output, resHandoff.executionTimeMs, 'Handoff Router', 'Cryptographically sealed verifiable handoff packet #PKG-8821-B and transferred live execution to Compliance Specialist Agent');

      // Update timeline in state so Compliance Agent is active
      const updatedTimeline: HandoffTimelineNode[] = [
        {
          agentName: 'DealPulse Primary Agent',
          role: 'Deal-Risk Evaluation & MEDDPICC Extraction',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          summary: 'Extracted 84/100 risk score, flagged Rachel Thorne DPA Section 7.2 redline.',
        },
        {
          agentName: 'Compliance Specialist Agent',
          role: 'BaFin EU Residency & DPA Redline Remediation',
          status: 'active',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          summary: 'Actively formulating 2.5x indemnity compromise and Frankfurt AWS dedicated tenant addendum.',
        },
        {
          agentName: 'Human Deal Desk (VP RevOps)',
          role: 'Final Executive Approval & Exception Sign-off',
          status: 'queued',
          timestamp: 'Standby for Thursday 5 PM cutoff',
          summary: 'Standby for final commercial signing approval.',
          isHuman: true,
        },
      ];

      const stateWithHandoff: AnalysisState = {
        ...computedFullState,
        handoffTimeline: updatedTimeline,
      };
      this.callbacks.onStateUpdate?.(stateWithHandoff);

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-step5`,
        sender: 'agent',
        agentName: 'Handoff Router',
        avatar: 'HR',
        text: `🤝 **[Step 5/6] Verifiable Handoff Routed to Compliance Specialist** (${resHandoff.output.packet_id}):\n- **Target Agent**: Compliance Specialist Agent (Live)\n- **Cryptographic Checksum**: \`sha256:b4e98f029a174cd3...\`\n- **Open Legal Mandates**: 1. BaFin Section 7.2 Frankfurt clause | 2. 2.5x indemnity compromise | 3. Thursday 5 PM CET board cutoff.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // -----------------------------------------------------------------------
      // STEP 6: ticket.create_legal_review & crm.add_next_steps (22.0s -> ~25.5s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('[Step 6/6] Invoking ticket.create_legal_review & crm.add_next_steps…', 'ticket.create_legal_review');
      await delay(3800);
      if (!this.isRunning) return stateWithHandoff;

      const resTicket = await executeMcpSkill('ticket.create_legal_review', {
        account_name: opp.accountName,
        deal_arr: opp.arr,
        board_meeting_deadline: 'Thursday 5:00 PM CET',
        priority: 'P1_EXPEDITED_24H',
      }, { transcript, opportunity: opp });

      logLedger('ticket.create_legal_review', 'Compliance & RevOps', {
        account_name: opp.accountName,
        deal_arr: opp.arr,
        assigned_counsel: 'Elena Vance (General Counsel & FinTech Lead)',
        sla: '24 Hours'
      }, resTicket.output, resTicket.executionTimeMs, 'Compliance Specialist Agent', 'Dispatched expedited Legal Review ticket #LEG-9941 to General Counsel Elena Vance');

      const resTasks = await executeMcpSkill('crm.add_next_steps', {
        opportunity_id: opp.id,
        actions: [
          { title: 'Deliver custom BaFin DPA addendum with Frankfurt AWS clause', owner: 'Elena Vance (Legal)', due: 'Thursday 12:00 PM CET' },
          { title: 'Send executive briefing email to Vikram Mehta', owner: 'Sarah Jenkins (AE)', due: 'Wednesday 4:00 PM CET' },
          { title: 'Schedule emergency Deal Desk sync if legal review exceeds 24h', owner: 'Alex Rivera (RevOps)', due: 'Thursday 2:00 PM CET' }
        ]
      }, { transcript, opportunity: opp });

      logLedger('crm.add_next_steps', 'CRM Fabric', {
        opportunity_id: opp.id,
        items_count: 3
      }, resTasks.output, resTasks.executionTimeMs, 'CRM Sync Agent', 'Created 3 milestone CRM tasks with assigned owners and cutoff deadlines');

      // Final Artifacts
      const legalArtifact = {
        type: 'ticket',
        title: 'Ticket #LEG-9941: Expedited BaFin Compliance Review',
        content: `EXPEDITED LEGAL REVIEW TICKET\n=================================\nTicket ID: LEG-9941\nAccount: GlobalFin Core Systems ($350,000 ARR)\nAssigned Counsel: Elena Vance (General Counsel & Lead FinTech)\nSLA Target: 24 Hours (Cutoff: Thursday 5:00 PM CET)\n\nTRIGGER REASON:\nRachel Thorne (Lead Counsel, GlobalFin) rejected standard DPA Section 7.2 and requested 5x liability cap citing BaFin German banking residency rules.\n\nRECOMMENDED REMEDIATION:\n1. Provide standard Frankfurt AWS Availability Zone dedicated cluster data-routing addendum.\n2. Propose 2.5x annual contract value liability cap as middle ground compromise.\n3. Authorize AE Sarah Jenkins to submit final execution copy before Thursday 12:00 PM CET.`,
      };

      const aeBriefArtifact = {
        type: 'email',
        title: 'Executive Outreach: Vikram Mehta (Head of InfoSec)',
        content: `SUBJECT: Strategic Update: Dedicated Frankfurt AWS Architecture & BaFin Compliance Addendum for GlobalFin\n\nHi Vikram,\n\nFollowing our review with Rachel Thorne this morning, I immediately engaged our General Counsel and Cloud Architecture leads to address Rachel's notes regarding BaFin telemetry residency and DPA Section 7.2.\n\nHere is our updated action plan for Thursday's compliance cutoff:\n1. Dedicated Tenant: All telemetry and audit logs remain strictly within the Frankfurt AWS availability zone (zero cross-border data transfer).\n2. DPA Addendum: We have pre-drafted an approved BaFin-compliant security addendum with a 2.5x indemnity compromise.\n\nLet's connect for 15 minutes Wednesday at 2 PM CET so we can ensure Rachel has the final execution document well ahead of the 5 PM board cutoff.\n\nBest regards,\nSarah Jenkins | Enterprise AE\nDealPulse Enterprise Sales Lead`,
      };

      // -----------------------------------------------------------------------
      // STEP 7: FINAL COMPREHENSIVE ASSISTANT SYNTHESIS (25.5s -> 26.5s)
      // -----------------------------------------------------------------------
      this.callbacks.onStatusUpdate?.('DealPulse Orchestration Complete.', undefined);
      this.isRunning = false;

      const finalState: AnalysisState = {
        ...stateWithHandoff,
        analyzed: true,
        analyzing: false,
        actions: stateWithHandoff.actions.map(a => 
          a.skillToTrigger === 'ticket.create_legal_review' || a.skillToTrigger === 'crm.add_next_steps'
            ? { ...a, status: 'executed' as const }
            : a
        ),
      };
      this.callbacks.onStateUpdate?.(finalState);

      // Post final assistant message with Risk Summary + Top 3 Actions + Interactive CTA Buttons
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-final-synthesis`,
        sender: 'agent',
        agentName: 'DealPulse Primary Orchestrator',
        avatar: 'DP',
        text: `🚨 **DealPulse Risk Assessment & Executive Action Plan**\n\n### 1. Risk Summary: **84 / 100 (Critical Blocker)**\n- **Opportunity**: **${opp.accountName}** ($350k ARR · Stage: At Risk / Legal Review)\n- **Primary Blocker**: Lead Counsel Rachel Thorne rejected standard DPA Section 7.2 over BaFin German banking residency rules and requested a 5x liability cap.\n- **Hard Deadline**: Addendum must be submitted by **Thursday 5:00 PM CET** or deal slips 30+ days.\n\n### 2. Top 3 Prioritized Next-Best Actions:\n1. ⚖️ **Legal Review Ticket (#LEG-9941)**: Dispatched to General Counsel Elena Vance (24h SLA) with 2.5x indemnity compromise proposal and Frankfurt AWS cluster addendum.\n2. ✉️ **AE Executive Brief**: Outreach email drafted for AE Sarah Jenkins to Vikram Mehta (Head of InfoSec) locking in Frankfurt data-routing terms.\n3. 📋 **Salesforce Milestone Sync**: 3 emergency tasks logged with assigned owners and cutoff deadlines.\n\n⚡ **Interactive Execution CTAs** (Click below to inspect or run):`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          { quote: "GlobalFin cannot accept any cross-border telemetry routing outside the Frankfurt AWS availability zone.", speaker: "Rachel Thorne (Lead Counsel)", category: "Paper Process" },
          { quote: "If we don't submit the signed SOC2 Type II addendum and custom DPA by this Thursday 5 PM CET, this deal cannot close until late September.", speaker: "Rachel Thorne (Lead Counsel)", category: "Decision Process" },
        ],
        ctaButtons: [
          {
            id: 'cta-view-ticket',
            label: 'View Legal Review Ticket (#LEG-9941)',
            actionType: 'open_artifact',
            artifact: legalArtifact,
            variant: 'warning',
            iconName: 'ticket',
          },
          {
            id: 'cta-view-brief',
            label: 'View AE Brief Email to Vikram Mehta',
            actionType: 'open_artifact',
            artifact: aeBriefArtifact,
            variant: 'primary',
            iconName: 'mail',
          },
          {
            id: 'cta-sync-crm',
            label: 'Inspect 3 Synced Salesforce Tasks',
            actionType: 'execute_skill',
            skillName: 'crm.add_next_steps',
            variant: 'secondary',
            iconName: 'tasks',
          },
          {
            id: 'cta-escalate-human',
            label: 'Escalate to VP RevOps & Human Deal Desk',
            actionType: 'execute_skill',
            skillName: 'handoff.to_human',
            variant: 'danger',
            iconName: 'user',
          },
        ],
      });

      return finalState;

    } else {
      // =========================================================================
      // SCENARIO A: EXPANDING ENTERPRISE (CHAMPION WEAK / 18-20s SEQUENCE)
      // =========================================================================

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-init-a`,
        sender: 'agent',
        agentName: 'DealPulse Primary Orchestrator',
        avatar: 'DP',
        text: `🎬 **Initiating Track 2 MCP Deal-Risk Orchestration**\n\n- **Target Opportunity**: **${opp.accountName}** ($${(opp.arr / 1000).toFixed(0)}k ARR, Stage: ${opp.stage})\n- **Assigned AE**: ${opp.assignedAe}\n- **Context**: Evaluating 10 transcript turns against CRM pipeline intelligence.\n- **MCP Fabric Dispatch**: Invoking 5 modular skills for sales call audio, CRM topology, and MEDDPICC risk grading.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Step 1: transcript.analyze
      this.callbacks.onStatusUpdate?.('[Step 1/5] Calling MCP Skill: transcript.analyze…', 'transcript.analyze');
      await delay(3200);
      if (!this.isRunning) return runDeterministicAnalysis(opp, transcript);

      const resTranscript = await executeMcpSkill('transcript.analyze', {
        deal_id: opp.id,
        turn_count: transcript.length,
      }, { transcript, opportunity: opp });
      logLedger('transcript.analyze', 'Audio & NLP', { turns: transcript.length, deal_id: opp.id }, resTranscript.output, resTranscript.executionTimeMs, 'DealPulse Primary Agent', 'Parsed 10 turns, detected budget lock pressure and competitor renewal discount');

      // Step 2: crm.get_opportunity
      this.callbacks.onStatusUpdate?.('[Step 2/5] Calling MCP Skill: crm.get_opportunity…', 'crm.get_opportunity');
      await delay(3500);
      if (!this.isRunning) return runDeterministicAnalysis(opp, transcript);

      const resCrm = await executeMcpSkill('crm.get_opportunity', {
        opportunity_id: opp.id,
        include_stakeholders: true,
      }, { transcript, opportunity: opp });
      logLedger('crm.get_opportunity', 'CRM Fabric', { opportunity_id: opp.id }, resCrm.output, resCrm.executionTimeMs, 'DealPulse Primary Agent', 'Retrieved CRM data: $185k ARR, Datadog competitor pressure, unengaged CFO Marcus Vance');

      // Step 3: meddpicc.extract
      this.callbacks.onStatusUpdate?.('[Step 3/5] Calling MCP Skill: meddpicc.extract…', 'meddpicc.extract');
      await delay(4000);
      if (!this.isRunning) return runDeterministicAnalysis(opp, transcript);

      const computedStateA = runDeterministicAnalysis(opp, transcript);
      const resMeddpicc = await executeMcpSkill('meddpicc.extract', {
        opportunity_id: opp.id,
        transcript_turns: transcript.length,
      }, { transcript, opportunity: opp });
      logLedger('meddpicc.extract', 'Sales Intelligence', { opportunity_id: opp.id }, resMeddpicc.output, resMeddpicc.executionTimeMs, 'DealPulse Primary Agent', 'Identified unengaged Economic Buyer Marcus Vance and Datadog 25% discount');

      this.callbacks.onStateUpdate?.(computedStateA);

      // Step 4: email.draft_ae_brief
      this.callbacks.onStatusUpdate?.('[Step 4/5] Calling MCP Skill: email.draft_ae_brief…', 'email.draft_ae_brief');
      await delay(3500);
      if (!this.isRunning) return computedStateA;

      const resEmail = await executeMcpSkill('email.draft_ae_brief', {
        champion_name: 'Dan Henderson',
        recipient_role: 'VP Engineering',
        opportunity_id: opp.id,
      }, { transcript, opportunity: opp });
      logLedger('email.draft_ae_brief', 'Comms Fabric', { recipient: 'Dan Henderson', topic: 'Executive ROI Model' }, resEmail.output, resEmail.executionTimeMs, 'AE Copilot Agent', 'Drafted 1-page financial ROI briefing for CFO Marcus Vance');

      // Step 5: crm.add_next_steps
      this.callbacks.onStatusUpdate?.('[Step 5/5] Calling MCP Skill: crm.add_next_steps…', 'crm.add_next_steps');
      await delay(3000);
      if (!this.isRunning) return computedStateA;

      const resTasks = await executeMcpSkill('crm.add_next_steps', {
        opportunity_id: opp.id,
        actions: [
          { title: 'Send 1-page ROI justification brief to Dan Henderson', owner: 'Sarah Jenkins (AE)', due: 'Wednesday' },
          { title: 'Deliver technical differentiators matrix against Datadog', owner: 'Elena Rostova', due: 'Thursday' }
        ]
      }, { transcript, opportunity: opp });
      logLedger('crm.add_next_steps', 'CRM Fabric', { opportunity_id: opp.id }, resTasks.output, resTasks.executionTimeMs, 'CRM Sync Agent', 'Synchronized 2 follow-up action items to CRM');

      this.callbacks.onStatusUpdate?.('Analysis completed.', undefined);
      this.isRunning = false;

      const aeEmailArtifact = {
        type: 'email',
        title: 'Executive ROI Brief: Dan Henderson (VP Eng)',
        content: `SUBJECT: Executive Justification Model: MTTR Impact & ROI Benchmark for Marcus\n\nHi Dan,\n\nFollowing our discussion today, I prepared the concise 1-page financial justification model you can share directly with Marcus Vance ahead of next Friday's Q3 budget lock.\n\nKey Highlights:\n- MTTR Reduction: Projected 40% reduction in P1 incident triage hours.\n- Cost Efficiency: Outperforms bundled Datadog renewal when accounting for incident telemetry overage fees.\n\nLet's sync for 10 minutes Thursday to review before passing to Marcus.\n\nBest regards,\nSarah Jenkins | Enterprise AE`,
      };

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-final-a`,
        sender: 'agent',
        agentName: 'DealPulse Primary Orchestrator',
        avatar: 'DP',
        text: `⚠️ **Deal Analysis Complete (Risk Score: 54 / 100 — Medium Risk)**\n\n### 1. Risk Summary: **CloudScale Dynamics**\n- **Economic Buyer Gap**: Dan Henderson (VP Eng) is enthusiastic, but CFO Marcus Vance has not been pitched directly and only reviews 1-page financial briefs.\n- **Pricing Pressure**: Datadog offered a 25% bundled renewal discount.\n\n### 2. Top 3 Prioritized Next-Best Actions:\n1. ✉️ **AE Executive Brief**: Ready-to-send 1-page ROI justification email prepared for Dan Henderson.\n2. 📊 **Competitor Battlecard**: Position telemetry cost predictability vs Datadog renewal bundle.\n3. 📋 **CRM Sync**: 2 milestone tasks scheduled before Friday budget lock.\n\n⚡ **Interactive Execution CTAs**:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          { quote: "Marcus usually stays out of vendor demos. He just looks at the final 1-page ROI justification...", speaker: "Dan Henderson (VP Eng)", category: "Economic Buyer" },
          { quote: "Datadog came back with a bundled renewal discount that is about 25% lower than your proposal.", speaker: "Elena Rostova (Director Cloud Ops)", category: "Competition" },
        ],
        ctaButtons: [
          {
            id: 'cta-view-email-a',
            label: 'View AE Brief Email to Dan Henderson',
            actionType: 'open_artifact',
            artifact: aeEmailArtifact,
            variant: 'primary',
            iconName: 'mail',
          },
          {
            id: 'cta-sync-tasks-a',
            label: 'Inspect 2 Synced CRM Next Steps',
            actionType: 'execute_skill',
            skillName: 'crm.add_next_steps',
            variant: 'secondary',
            iconName: 'tasks',
          },
          {
            id: 'cta-escalate-human-a',
            label: 'Escalate to VP RevOps & Human Deal Desk',
            actionType: 'execute_skill',
            skillName: 'handoff.to_human',
            variant: 'danger',
            iconName: 'user',
          },
        ],
      });

      return computedStateA;
    }
  }

  public async executeAction(
    action: NextBestAction,
    currentState: AnalysisState
  ): Promise<{ resultSummary: string; artifact?: any }> {
    const opp = this.scenario.opportunity;
    const transcript = this.scenario.transcript;
    const skillName = action.skillToTrigger || 'crm.add_next_steps';
    const correlationId = `corr-act-${Date.now().toString(36)}`;

    this.callbacks.onStatusUpdate?.(`Executing MCP Skill: ${skillName}…`, skillName);

    const { output, executionTimeMs } = await executeMcpSkill(skillName, action.skillParams || {}, {
      opportunity: opp,
      transcript,
    });

    // Log to ledger
    const entry: ActionLedgerEntry = {
      id: `LEDGER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      correlationId,
      timestamp: new Date().toLocaleTimeString(),
      skillName,
      category: skillName.split('.')[0].toUpperCase(),
      inputs: action.skillParams || {},
      outputs: output,
      status: 'success',
      executionTimeMs,
      agentOwner: action.owner,
      notes: `Executed via Next-Best Action trigger: "${action.title}"`,
    };
    this.callbacks.onLedgerEntry?.(entry);

    let summaryText = '';
    let artifact: any = null;

    if (skillName === 'email.draft_ae_brief') {
      summaryText = `Drafted strategic executive outreach brief to ${action.skillParams?.champion_name || 'Dan Henderson'}.`;
      artifact = {
        type: 'email',
        title: output.subject || 'Executive ROI Brief',
        content: output.body || '',
      };
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: 'AE Copilot Agent',
        avatar: 'AE',
        text: `✅ **Generated AE Outreach Brief for ${action.skillParams?.champion_name || 'Champion'}**:\n\n**Subject**: ${output.subject}\n\n${output.body}\n\n*Attachments: 1-Page_Exec_ROI_Model.pdf, MTTR_Benchmark_Telemetry.xlsx*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        generatedArtifact: artifact,
      });
    } else if (skillName === 'ticket.create_legal_review') {
      summaryText = `Dispatched expedited legal review ticket #${output.ticket_id} to ${output.assigned_counsel}.`;
      artifact = {
        type: 'ticket',
        title: `Ticket ${output.ticket_id}: Expedited Compliance Review`,
        content: `Target SLA: ${output.sla_target}\nAssigned: ${output.assigned_counsel}\nAccount: ${output.account}\nClauses: ${output.key_clauses?.join(', ')}`,
      };
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: 'Compliance Specialist',
        avatar: 'CS',
        text: `⚖️ **Expedited Legal Review Ticket Dispatched**:\n- **Ticket ID**: \`${output.ticket_id}\`\n- **Assigned Counsel**: ${output.assigned_counsel}\n- **SLA**: ${output.sla_target}\n- **Focus**: Frankfurt AWS Dedicated Tenant isolation & 2.5x Indemnity compromise framework.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        generatedArtifact: artifact,
      });
    } else if (skillName === 'crm.update_stage') {
      summaryText = `Updated CRM stage to "${output.new_stage}" with risk flag "${output.risk_flag}".`;
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: 'CRM Sync Agent',
        avatar: 'CRM',
        text: `🔄 **Salesforce Opportunity Stage Updated**:\n- **Opportunity**: ${opp.id} (${opp.accountName})\n- **Previous Stage**: ${output.previous_stage}\n- **New Stage**: ${output.new_stage}\n- **Risk Flag**: \`${output.risk_flag}\`\n- **Synced at**: ${output.sync_timestamp}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (skillName === 'crm.add_next_steps') {
      summaryText = `Synced ${output.items_added} action items to CRM opportunity tasks.`;
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: 'CRM Sync Agent',
        avatar: 'CRM',
        text: `📌 **CRM Next Steps Synchronized**:\n- Added ${output.items_added} milestone tasks with assigned owners and due dates.\n- Task IDs: ${output.crm_task_ids?.join(', ')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (skillName === 'handoff.route_specialist') {
      summaryText = `Routed verifiable packet #${output.packet_id} to ${output.routed_to}.`;
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: 'Handoff Router',
        avatar: 'HR',
        text: `🤝 **Handoff Packet Routed & Acknowledged**:\n- **Packet ID**: \`${output.packet_id}\`\n- **Target Agent**: ${output.routed_to}\n- **Checksum**: \`${output.checksum.substring(0, 24)}...\`\n- **Status**: ${output.status}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (skillName === 'handoff.to_human') {
      summaryText = `Escalated P1 deal risk to VP RevOps & Human Deal Desk.`;
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        agentName: 'Human Deal Desk Router',
        avatar: 'HUM',
        text: `👤 **Deal Risk Escalated to Human Deal Desk**:\n- **Escalation ID**: \`${output.escalation_id}\`\n- **Priority**: \`P1_URGENT_HUMAN_INTERVENTION\`\n- **Channels Notified**: Slack #deal-desk-war-room, Salesforce P1 Flag, Email to VP RevOps\n- **Action**: Deal Desk leadership is reviewing the BaFin data residency variance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    this.callbacks.onStatusUpdate?.(undefined, undefined);

    // Update action status in state
    const updatedActions = currentState.actions.map((a) =>
      a.id === action.id ? { ...a, status: 'executed' as const, resultSummary: summaryText } : a
    );
    this.callbacks.onStateUpdate?.({ ...currentState, actions: updatedActions });

    return { resultSummary: summaryText, artifact };
  }

  public async handleUserChatQuery(query: string, currentState: AnalysisState): Promise<void> {
    const q = query.toLowerCase().trim();
    const isScenarioB = this.scenario.id === 'scenario_b';

    // Log user chat message
    this.callbacks.onChatMessage?.({
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    this.callbacks.onStatusUpdate?.('DealPulse analyzing query context…', 'nlp.query_intent');
    await delay(350);
    this.callbacks.onStatusUpdate?.(undefined, undefined);

    if (q.includes('why') && (q.includes('economic buyer') || q.includes('eb'))) {
      if (isScenarioB) {
        this.callbacks.onChatMessage?.({
          id: `msg-${Date.now()}-agent`,
          sender: 'agent',
          agentName: 'DealPulse Agent',
          avatar: 'DP',
          text: `In **GlobalFin Core Systems**, the Economic Buyer is **CTO Charlotte Dubois**. Charlotte has approved the $350,000 budget allocation, but she signed a mandatory corporate directive requiring **zero-exception Legal & InfoSec approval**.\n\n> *"CTO Charlotte Dubois already authorized the $350k budget, but she signed a corporate directive that no contract passes without Legal & InfoSec zero-exception sign-off."* — **Vikram Mehta (Head of InfoSec)**\n\nTherefore, Economic Buyer commitment is contingent on resolving Rachel Thorne's DPA redlines.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            { quote: "CTO Charlotte Dubois already authorized the $350k budget, but she signed a corporate directive...", speaker: "Vikram Mehta" }
          ],
        });
      } else {
        this.callbacks.onChatMessage?.({
          id: `msg-${Date.now()}-agent`,
          sender: 'agent',
          agentName: 'DealPulse Agent',
          avatar: 'DP',
          text: `In **CloudScale Dynamics**, Economic Buyer **Marcus Vance (CFO)** is unengaged. Dan Henderson (VP Eng) confirmed he has not pitched Marcus yet and that Marcus only reviews 1-page financial ROI justifications:\n\n> *"Marcus usually stays out of vendor demos. He just looks at the final 1-page ROI justification and signs off if our department budget absorbs it. I haven't pitched him on this line item yet."* — **Dan Henderson (VP Eng)**\n\nWith Q3 budget lock next Friday, unengaged EB is the primary deal risk.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            { quote: "Marcus usually stays out of vendor demos. He just looks at the final 1-page ROI justification...", speaker: "Dan Henderson" },
            { quote: "I haven't pitched him on this line item yet.", speaker: "Dan Henderson" }
          ],
        });
      }
    } else if (q.includes('draft') || q.includes('ae brief') || q.includes('email')) {
      const emailAction = currentState.actions.find((a) => a.skillToTrigger === 'email.draft_ae_brief') || {
        id: 'manual-draft',
        title: 'Draft AE Executive Brief',
        owner: 'AE (Sarah Jenkins)',
        priority: 'high',
        dueTimeframe: 'Immediate',
        description: 'Generate AE brief via MCP email.draft_ae_brief',
        skillToTrigger: 'email.draft_ae_brief',
        skillParams: {
          champion_name: isScenarioB ? 'Vikram Mehta' : 'Dan Henderson',
          recipient_role: isScenarioB ? 'Head of InfoSec' : 'VP Engineering',
        },
        status: 'pending',
      };
      await this.executeAction(emailAction, currentState);
    } else if (q.includes('compliance') || q.includes('legal review') || q.includes('ticket')) {
      const legalAction = currentState.actions.find((a) => a.skillToTrigger === 'ticket.create_legal_review') || {
        id: 'manual-legal',
        title: 'Dispatch Legal Review Ticket',
        owner: 'Compliance Specialist',
        priority: 'urgent',
        dueTimeframe: 'Immediate',
        description: 'Trigger ticket.create_legal_review',
        skillToTrigger: 'ticket.create_legal_review',
        skillParams: {
          account_name: this.scenario.opportunity.accountName,
          deal_arr: this.scenario.opportunity.arr,
        },
        status: 'pending',
      };
      await this.executeAction(legalAction, currentState);
    } else if (q.includes('escalate') || q.includes('human') || q.includes('revops') || q.includes('deal desk')) {
      const humanAction: NextBestAction = {
        id: 'manual-human-esc',
        title: 'Escalate Deal Risk to VP RevOps & Human Deal Desk',
        owner: 'Sarah Jenkins (AE) & RevOps Lead',
        priority: 'urgent',
        dueTimeframe: 'Immediate P1',
        description: 'Dispatched emergency Slack alert and Salesforce P1 flag to deal desk leadership.',
        skillToTrigger: 'handoff.to_human',
        skillParams: {
          escalation_reason: `Deal risk score ${currentState.riskScore}/100 exceeds critical operating thresholds.`,
          human_role: 'VP RevOps & Deal Desk Lead',
        },
        status: 'pending',
      };
      await this.executeAction(humanAction, currentState);
    } else if (q.includes('paper process') || q.includes('redline') || q.includes('bafin')) {
      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        agentName: 'DealPulse Agent',
        avatar: 'DP',
        text: `**Paper Process Breakdown**:\n- **Clause 7.2 (Data Residency)**: Customer requires strict in-region telemetry within AWS Frankfurt to satisfy BaFin German banking oversight.\n- **Indemnity Cap**: Customer demands **5x ARR liability cap** for security breach indemnity (vs standard 12 months).\n- **Submission Deadline**: Rachel Thorne confirmed that terms must be delivered by **Thursday 5:00 PM CET** for the monthly board review.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      let responseText: string | null = null;

      if (isGeminiConfigured()) {
        try {
          const prompt = `You are DealPulse, an autonomous enterprise sales deal-risk orchestration agent (Track 2 MCP Fabric).
Account: "${this.scenario.opportunity.accountName}" ($${(this.scenario.opportunity.arr / 1000).toFixed(0)}k ARR, Stage: ${this.scenario.opportunity.stage}).
Deal Risk Score: ${currentState.riskScore}/100 (${currentState.severity.toUpperCase()}).
Identified Gaps: ${currentState.gaps.map(g => `${g.title} (${g.severity}): ${g.description}`).join('; ')}
MEDDPICC Highlights: ${currentState.meddpiccItems.map(m => `${m.name}: ${m.summary}`).join('; ')}

User question: "${query}"

Instructions:
- Provide a concise, highly professional executive answer in 2-3 short paragraphs or bullet points.
- Strictly adhere to the provided deterministic MEDDPICC facts, risk score, and gap signals.
- Do NOT hallucinate external facts.
- Mention relevant next actions or MCP skills (e.g. email.draft_ae_brief, ticket.create_legal_review, handoff.to_human) if applicable.`;

          responseText = await generateDynamicInsight(prompt);
        } catch (err) {
          console.warn('Gemini chat phrasing error, defaulting to deterministic response:', err);
        }
      }

      if (!responseText) {
        responseText = `Based on the deterministic analysis for **${this.scenario.opportunity.accountName}** (Risk Score: **${currentState.riskScore}/100**):\n\nKey MEDDPICC status:\n- **Metrics**: ${currentState.meddpiccItems.find(m => m.key === 'metrics')?.summary || 'Quantified'}\n- **Economic Buyer**: ${currentState.meddpiccItems.find(m => m.key === 'economic_buyer')?.summary || 'Engaged'}\n- **Paper Process**: ${currentState.meddpiccItems.find(m => m.key === 'paper_process')?.summary || 'Standard'}\n\nYou can prompt me with *"Draft AE brief"*, *"Dispatch legal review"*, *"Why is EB weak?"*, or *"Escalate to human deal desk"* to trigger MCP tool execution.`;
      }

      this.callbacks.onChatMessage?.({
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        agentName: 'DealPulse Agent',
        avatar: 'DP',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  }
}
