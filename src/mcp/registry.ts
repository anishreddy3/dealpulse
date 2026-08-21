import { McpSkill, CrmOpportunity, TranscriptTurn, HandoffPacket } from '../types/dealpulse';

export const MCP_SKILL_REGISTRY: McpSkill[] = [
  {
    name: 'crm.get_opportunity',
    namespace: 'mcp.fabric.crm',
    description: 'Retrieves enriched CRM opportunity object, stakeholder mapping, ARR, close date, and pipeline stage.',
    version: '1.2.0',
    inputSchema: {
      opportunity_id: 'string (e.g., OPP-8921)',
      include_stakeholders: 'boolean',
    },
    outputSchema: {
      account: 'string',
      arr: 'number',
      stage: 'string',
      health_score: 'number',
      stakeholders: 'Array<Stakeholder>',
      competitors: 'Array<string>',
    },
    isMock: true,
    category: 'crm',
  },
  {
    name: 'transcript.analyze',
    namespace: 'mcp.fabric.audio_nlp',
    description: 'Processes multi-speaker sales call transcript, identifies speaker roles, conversation turns, and sentiment velocity.',
    version: '2.0.1',
    inputSchema: {
      transcript_turns: 'Array<TranscriptTurn>',
      deal_context: 'object',
    },
    outputSchema: {
      speaker_count: 'number',
      caution_markers: 'number',
      dominant_topics: 'Array<string>',
      objection_summary: 'string',
    },
    isMock: true,
    category: 'analysis',
  },
  {
    name: 'meddpicc.extract',
    namespace: 'mcp.fabric.sales_intel',
    description: 'Extracts 8 MEDDPICC dimensions, scores coverage, pinpoints specific gaps, and links verbatim quote evidence.',
    version: '1.4.0',
    inputSchema: {
      transcript_analysis: 'object',
      crm_opportunity: 'object',
    },
    outputSchema: {
      overall_risk_score: 'number (0-100)',
      severity: 'string (low | medium | high | critical)',
      meddpicc_scores: 'Record<string, number>',
      critical_gaps: 'Array<Gap>',
    },
    isMock: true,
    category: 'analysis',
  },
  {
    name: 'crm.update_stage',
    namespace: 'mcp.fabric.crm',
    description: 'Updates opportunity stage, close date, risk flags, and probability percentage in the CRM.',
    version: '1.1.0',
    inputSchema: {
      opportunity_id: 'string',
      new_stage: 'string',
      risk_flag: 'string',
      confidence: 'number',
    },
    outputSchema: {
      updated: 'boolean',
      previous_stage: 'string',
      new_stage: 'string',
      sync_timestamp: 'string',
    },
    isMock: true,
    category: 'crm',
  },
  {
    name: 'crm.add_next_steps',
    namespace: 'mcp.fabric.crm',
    description: 'Appends synchronized action items, assigned owners, and milestone deadlines to the CRM opportunity record.',
    version: '1.0.4',
    inputSchema: {
      opportunity_id: 'string',
      actions: 'Array<{ title: string; owner: string; due: string }>',
    },
    outputSchema: {
      items_added: 'number',
      status: 'string',
      crm_task_ids: 'Array<string>',
    },
    isMock: true,
    category: 'crm',
  },
  {
    name: 'email.draft_ae_brief',
    namespace: 'mcp.fabric.comms',
    description: 'Composes a customized executive outreach email or internal AE alignment brief referencing transcript quotes and pain points.',
    version: '1.3.2',
    inputSchema: {
      recipient_role: 'string',
      champion_name: 'string',
      deal_gaps: 'Array<string>',
      call_to_action: 'string',
    },
    outputSchema: {
      subject: 'string',
      body: 'string',
      recommended_attachments: 'Array<string>',
    },
    isMock: true,
    category: 'comms',
  },
  {
    name: 'ticket.create_legal_review',
    namespace: 'mcp.fabric.compliance',
    description: 'Dispatches an expedited legal & compliance ticket with extracted clause redlines, BaFin/SOC2 flags, and approval cutoff date.',
    version: '1.0.0',
    inputSchema: {
      account_name: 'string',
      deal_arr: 'number',
      redline_clauses: 'Array<string>',
      board_meeting_deadline: 'string',
      priority: 'string',
    },
    outputSchema: {
      ticket_id: 'string (e.g. LGL-4491)',
      status: 'dispatched',
      sla_response_time: 'string',
      assigned_team: 'string',
    },
    isMock: true,
    category: 'compliance',
  },
  {
    name: 'handoff.route_specialist',
    namespace: 'mcp.fabric.orchestration',
    description: 'Packages a cryptographic context packet and transfers execution ownership to a specialized downstream agent (e.g. Legal/Compliance Agent).',
    version: '2.1.0',
    inputSchema: {
      from_agent: 'string',
      target_specialist: 'string',
      risk_threshold_breached: 'boolean',
      context_packet: 'object',
    },
    outputSchema: {
      packet_id: 'string',
      checksum: 'string',
      routing_status: 'routed',
      target_agent_ack: 'boolean',
    },
    isMock: true,
    category: 'orchestration',
  },
  {
    name: 'handoff.to_human',
    namespace: 'mcp.fabric.orchestration',
    description: 'Escalates an unresolvable or high-risk deal state directly to human AE / VP RevOps with critical decision prompts and audit trail.',
    version: '1.1.0',
    inputSchema: {
      escalation_reason: 'string',
      human_role: 'string',
      summary_packet: 'object',
    },
    outputSchema: {
      escalation_id: 'string',
      notification_dispatched: 'boolean',
      channels_notified: 'Array<string>',
    },
    isMock: true,
    category: 'orchestration',
  },
];

// Mock execution implementations
export const executeMcpSkill = async (
  skillName: string,
  inputs: Record<string, any>,
  context?: { opportunity?: CrmOpportunity; transcript?: TranscriptTurn[] }
): Promise<{ output: Record<string, any>; executionTimeMs: number }> => {
  const start = performance.now();
  // Simulate lightweight deterministic latency for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 200));

  let output: Record<string, any> = {};

  switch (skillName) {
    case 'crm.get_opportunity':
      output = {
        status: 'synced',
        account: context?.opportunity?.accountName || inputs.opportunity_id,
        arr: context?.opportunity?.arr || 200000,
        stage: context?.opportunity?.stage || 'Stage 3',
        health_score: context?.opportunity?.healthScore || 50,
        assigned_ae: context?.opportunity?.assignedAe || 'Sarah Jenkins',
        competitors: context?.opportunity?.competitors || [],
      };
      break;

    case 'transcript.analyze': {
      const turns = context?.transcript || [];
      const cautionCount = turns.filter((t) => t.sentiment === 'caution' || t.sentiment === 'negative').length;
      output = {
        turns_processed: turns.length,
        speakers_identified: Array.from(new Set(turns.map((t) => t.speaker))),
        caution_markers_detected: cautionCount,
        sentiment_index: cautionCount > 3 ? 'Elevated Friction' : 'Moderate Alignment',
        topics_detected: ['Pricing/Competition', 'Security Compliance', 'Budget Approval', 'Architecture'],
      };
      break;
    }

    case 'meddpicc.extract': {
      const opp = context?.opportunity;
      const isScenarioB = opp?.id === 'OPP-5420' || inputs.opportunity_id === 'OPP-5420';
      output = {
        risk_score: isScenarioB ? 84 : 54,
        severity: isScenarioB ? 'critical' : 'medium',
        gaps_detected: isScenarioB
          ? ['Paper Process (BaFin residency & 5x liability)', 'Decision Process (Monthly compliance board cutoff)']
          : ['Economic Buyer (Marcus Vance not engaged)', 'Metrics (Lack of quantified financial ROI model)'],
        strong_elements: isScenarioB
          ? ['Economic Buyer (CTO Dubois engaged)', 'Identify Pain (Security compliance)']
          : ['Identify Pain (SRE outage burnout)', 'Champion (Dan Henderson loves platform)'],
      };
      break;
    }

    case 'crm.update_stage':
      output = {
        updated: true,
        opportunity_id: inputs.opportunity_id || 'OPP-CURRENT',
        previous_stage: inputs.previous_stage || 'Stage 3 - Evaluation',
        new_stage: inputs.new_stage || 'Stage 4 - Risk Mitigation Active',
        risk_flag: inputs.risk_flag || 'ATTENTION_REQUIRED',
        sync_timestamp: new Date().toISOString(),
      };
      break;

    case 'crm.add_next_steps':
      output = {
        items_added: Array.isArray(inputs.actions) ? inputs.actions.length : 3,
        status: 'synchronized_to_salesforce',
        crm_task_ids: ['TASK-8812', 'TASK-8813', 'TASK-8814'],
        last_sync: new Date().toISOString(),
      };
      break;

    case 'email.draft_ae_brief':
      output = {
        subject: `Strategic Alignment: Executive ROI & Technical Milestone for ${context?.opportunity?.accountName || 'CloudScale'}`,
        recipient: inputs.champion_name || 'Dan Henderson',
        body: `Hi ${inputs.champion_name || 'Dan'},\n\nFollowing our review, I put together the 1-page executive justification benchmark highlighting our unified incident triage impact (targeting a 40% reduction in P1 triage hours).\n\nTo ensure we have alignment ahead of Marcus's budget lock next Friday, let's connect for 15 minutes this Thursday with the financial ROI model ready for his sign-off.\n\nBest regards,\nSarah Jenkins | Enterprise AE`,
        recommended_attachments: ['1-Page_Exec_ROI_Model.pdf', 'MTTR_Benchmark_Telemetry.xlsx'],
      };
      break;

    case 'ticket.create_legal_review':
      output = {
        ticket_id: 'LGL-7749',
        status: 'DISPATCHED_EXPEDITED',
        sla_target: '48 Hours (Cutoff: Thursday 5 PM CET)',
        account: inputs.account_name || 'GlobalFin Core Systems',
        arr: inputs.deal_arr || 350000,
        assigned_counsel: 'David Miller (Lead FinTech Commercial Counsel)',
        key_clauses: [
          'Frankfurt AWS dedicated tenant & in-region telemetry lock',
          'Indemnity liability cap compromise (2.5x compromise framework)',
        ],
      };
      break;

    case 'handoff.route_specialist':
      output = {
        packet_id: `HPK-${Math.floor(100000 + Math.random() * 900000)}`,
        checksum: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
        routed_to: inputs.target_specialist || 'Compliance Specialist Agent',
        status: 'ROUTED_AND_ACKNOWLEDGED',
        auto_escalate_timestamp: new Date(Date.now() + 86400000).toISOString(),
      };
      break;

    case 'handoff.to_human':
      output = {
        escalation_id: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
        notification_dispatched: true,
        channels_notified: ['Slack #deal-desk-war-room', 'Salesforce Alert', 'Email AE Lead'],
        priority: 'P1_DEAL_BLOCKER',
      };
      break;

    default:
      output = {
        status: 'executed',
        message: `MCP Skill ${skillName} executed successfully in mock runtime.`,
      };
  }

  const executionTimeMs = Math.round(performance.now() - start);
  return { output, executionTimeMs };
};
