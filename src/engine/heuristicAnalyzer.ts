import { 
  CrmOpportunity, 
  TranscriptTurn, 
  MeddpiccItem, 
  DealGap, 
  NextBestAction, 
  AnalysisState, 
  HandoffPacket, 
  RiskSeverity,
  HandoffTimelineNode 
} from '../types/dealpulse';

export function runDeterministicAnalysis(
  opportunity: CrmOpportunity,
  transcript: TranscriptTurn[]
): AnalysisState {
  const isScenarioB = opportunity.id === 'OPP-5420' || opportunity.accountName.includes('GlobalFin');

  // MEDDPICC items evaluation
  let meddpiccItems: MeddpiccItem[] = [];
  let gaps: DealGap[] = [];
  let actions: NextBestAction[] = [];
  let riskScore = 0;
  let severity: RiskSeverity = 'low';
  let summary = '';

  if (isScenarioB) {
    // Scenario B: Late-stage legal block — paper process stalled (High/Critical risk)
    riskScore = 84;
    severity = 'critical';
    summary = 'Critical paper process & compliance blocker: GlobalFin Lead Counsel Rachel Thorne cited non-negotiable BaFin EU data residency redlines and a 5x liability indemnity requirement. The deal risks slipping past the monthly Compliance Review Board deadline this Thursday 5 PM CET without an emergency addendum.';

    meddpiccItems = [
      {
        key: 'metrics',
        name: 'Metrics',
        shortCode: 'M',
        status: 'validated',
        score: 85,
        summary: 'CTO authorized $350k budget justification based on multi-cloud security consolidation.',
        evidenceQuotes: ['"CTO Charlotte Dubois already authorized the $350k budget..."'],
        recommendation: 'Metrics confirmed; keep ROI sheet attached to legal review packet.',
      },
      {
        key: 'economic_buyer',
        name: 'Economic Buyer',
        shortCode: 'E',
        status: 'validated',
        score: 80,
        summary: 'CTO Charlotte Dubois is identified and committed, though subject to corporate governance rules.',
        evidenceQuotes: ['"...she signed a corporate directive that no contract passes without Legal & InfoSec zero-exception sign-off."'],
        recommendation: 'Engage Charlotte if legal escalation needs executive sponsor override.',
      },
      {
        key: 'decision_criteria',
        name: 'Decision Criteria',
        shortCode: 'Dc',
        status: 'weak',
        score: 45,
        summary: 'Strict EU residency / BaFin banking regulations prohibit US metadata aggregation.',
        evidenceQuotes: ['"BaFin banking regulations mandate that all audit logs stay strictly in-region."'],
        recommendation: 'Activate solutions architect to certify Frankfurt AWS isolated tenant configuration.',
      },
      {
        key: 'decision_process',
        name: 'Decision Process',
        shortCode: 'Dp',
        status: 'blocker',
        score: 25,
        summary: 'Strict monthly Compliance Board meeting cutoff: Must submit approved terms by Thursday 5 PM CET.',
        evidenceQuotes: ['"If we don\'t submit the signed SOC2 Type II addendum and custom DPA by this Thursday 5 PM CET, this deal cannot close until late September."'],
        recommendation: 'Establish deal desk war-room SLA to meet Thursday 5 PM CET submission cutoff.',
      },
      {
        key: 'paper_process',
        name: 'Paper Process',
        shortCode: 'P',
        status: 'blocker',
        score: 15,
        summary: 'Major DPA Section 7.2 redlines on telemetry routing and 5x breach indemnity liability cap.',
        evidenceQuotes: [
          '"GlobalFin cannot accept any cross-border telemetry routing outside the Frankfurt AWS availability zone."',
          '"...our legal policy requires a 5x liability cap for data breach indemnity, whereas your standard agreement caps at 12 months fees paid."'
        ],
        recommendation: 'Execute ticket.create_legal_review immediately with commercial counsel.',
      },
      {
        key: 'identify_pain',
        name: 'Identify Pain',
        shortCode: 'I',
        status: 'validated',
        score: 90,
        summary: 'High compliance exposure and legacy Splunk cluster maintenance overhead.',
        evidenceQuotes: ['"Your current cloud architecture appears to route metadata through US-East..."'],
        recommendation: 'Highlight in-region architectural security guarantees.',
      },
      {
        key: 'champion',
        name: 'Champion',
        shortCode: 'C',
        status: 'weak',
        score: 50,
        summary: 'Head of InfoSec Vikram is supportive of capabilities but strictly adheres to compliance governance.',
        evidenceQuotes: ['"CTO Charlotte Dubois already authorized the $350k budget..."'],
        recommendation: 'Equip Vikram with pre-approved BaFin compliance certification sheets.',
      },
      {
        key: 'competition',
        name: 'Competition',
        shortCode: 'Co',
        status: 'validated',
        score: 75,
        summary: 'Palo Alto Cortex & in-house Splunk cluster; technical superiority established.',
        evidenceQuotes: ['"Our EU dedicated tenant isolates customer payload data."'],
        recommendation: 'Emphasize lower latency of local Frankfurt cluster.',
      },
    ];

    gaps = [
      {
        id: 'gap-1',
        elementKey: 'paper_process',
        title: 'Severe DPA Redline on Cross-Border Telemetry (BaFin)',
        severity: 'critical',
        description: 'Customer counsel rejected Section 7.2 standard terms. Cross-border telemetry transfer into US-East violates German banking regulatory mandates.',
        evidenceQuote: 'GlobalFin cannot accept any cross-border telemetry routing outside the Frankfurt AWS availability zone.',
        speaker: 'Rachel Thorne (Lead Counsel)',
        impactScore: 35,
      },
      {
        id: 'gap-2',
        elementKey: 'paper_process',
        title: '5x Indemnity Liability Cap Demand',
        severity: 'high',
        description: 'GlobalFin legal mandates a 5x total contract value liability cap for data breach indemnity, exceeding standard 12-month policy.',
        evidenceQuote: '...our legal policy requires a 5x liability cap for data breach indemnity, whereas your standard agreement caps at 12 months fees paid.',
        speaker: 'Rachel Thorne (Lead Counsel)',
        impactScore: 25,
      },
      {
        id: 'gap-3',
        elementKey: 'decision_process',
        title: 'Hard Thursday 5 PM CET Compliance Board Deadline',
        severity: 'critical',
        description: 'Failure to submit approved DPA and SOC2 addendum before the monthly board cutoff pushes closing by 30+ days into late September.',
        evidenceQuote: 'If we don\'t submit the signed SOC2 Type II addendum and custom DPA by this Thursday 5 PM CET, this deal cannot close until late September.',
        speaker: 'Rachel Thorne (Lead Counsel)',
        impactScore: 24,
      },
    ];

    actions = [
      {
        id: 'act-1',
        title: 'Dispatch Expedited Legal & Compliance Review',
        owner: 'Compliance Specialist Agent',
        priority: 'urgent',
        dueTimeframe: 'Today by 4:00 PM',
        description: 'Trigger MCP skill ticket.create_legal_review with Frankfurt AWS isolation addendum and 2.5x indemnity compromise proposal.',
        skillToTrigger: 'ticket.create_legal_review',
        skillParams: {
          account_name: opportunity.accountName,
          deal_arr: opportunity.arr,
          redline_clauses: ['Frankfurt AWS tenant isolation', 'Indemnity cap compromise (2.5x)'],
          board_meeting_deadline: 'Thursday 5:00 PM CET',
          priority: 'URGENT_DEAL_BLOCKER',
        },
        status: 'pending',
      },
      {
        id: 'act-2',
        title: 'Update CRM Opportunity Risk Flag & Close Date',
        owner: 'DealPulse Agent / AE',
        priority: 'high',
        dueTimeframe: 'Immediate',
        description: 'Update Salesforce stage to "Stage 4 - Legal Redline Mitigation" and flag $350k pipeline at risk.',
        skillToTrigger: 'crm.update_stage',
        skillParams: {
          opportunity_id: opportunity.id,
          new_stage: 'Stage 4 - Legal Redline Mitigation',
          risk_flag: 'CRITICAL_LEGAL_BLOCKER',
          confidence: 45,
        },
        status: 'pending',
      },
      {
        id: 'act-3',
        title: 'Route to Compliance Specialist Agent (Verifiable Handoff)',
        owner: 'Handoff Router',
        priority: 'urgent',
        dueTimeframe: 'Automatic upon Risk > 70',
        description: 'Formulate cryptographic handoff packet with transcript evidence quotes and route to Compliance Specialist.',
        skillToTrigger: 'handoff.route_specialist',
        skillParams: {
          from_agent: 'DealPulse Orchestrator',
          target_specialist: 'Compliance Specialist Agent',
          risk_threshold_breached: true,
        },
        status: 'pending',
      },
      {
        id: 'act-4',
        title: 'Sync RevOps Action Milestones to CRM',
        owner: 'RevOps (Alex)',
        priority: 'medium',
        dueTimeframe: 'By tomorrow 9:00 AM',
        description: 'Push 3 deal desk tasks to CRM to maintain accountability across legal, solutions engineering, and sales leadership.',
        skillToTrigger: 'crm.add_next_steps',
        skillParams: {
          opportunity_id: opportunity.id,
          actions: [
            { title: 'Submit Frankfurt isolation architecture whitepaper', owner: 'Solutions Architect', due: 'Wednesday 12:00 PM' },
            { title: 'Executive DPA redline approval from Legal VP', owner: 'David Miller (Legal)', due: 'Thursday 11:00 AM' },
            { title: 'Deliver signed packet to Rachel Thorne before board cutoff', owner: 'Sarah Jenkins (AE)', due: 'Thursday 4:00 PM CET' },
          ],
        },
        status: 'pending',
      },
    ];
  } else {
    // Scenario A: Expanding Enterprise — Champion Weak (Medium risk)
    riskScore = 54;
    severity = 'medium';
    summary = 'Medium risk deal: Champion Dan Henderson loves the unified incident triage, but Economic Buyer Marcus Vance (CFO) is unengaged. Furthermore, Datadog offered a 25% bundled renewal discount, and the deal lacks a quantified dollar ROI model ahead of next Friday\'s Q3 budget lock.';

    meddpiccItems = [
      {
        key: 'metrics',
        name: 'Metrics',
        shortCode: 'M',
        status: 'weak',
        score: 40,
        summary: 'SRE time savings acknowledged, but no hard financial ROI or MTTR reduction dollar figure calculated.',
        evidenceQuotes: ['"Honestly, we have not put a hard dollar figure on it yet. We just know our team is burning out..."'],
        recommendation: 'Build 1-page financial business case with 40% MTTR cost savings model.',
      },
      {
        key: 'economic_buyer',
        name: 'Economic Buyer',
        shortCode: 'E',
        status: 'missing',
        score: 30,
        summary: 'CFO Marcus Vance has not been pitched and stays out of vendor demos; only reviews 1-page ROI.',
        evidenceQuotes: [
          '"Marcus usually stays out of vendor demos. He just looks at the final 1-page ROI justification..."',
          '"I haven\'t pitched him on this line item yet."'
        ],
        recommendation: 'Equip Dan Henderson with executive brief or secure 15-min alignment with Marcus.',
      },
      {
        key: 'decision_criteria',
        name: 'Decision Criteria',
        shortCode: 'Dc',
        status: 'validated',
        score: 75,
        summary: 'SRE triage speed and incident response unification are clear technical wins from the 2-week trial.',
        evidenceQuotes: ['"The trial went really well on our end. My SRE leads love the unified incident triage view."'],
        recommendation: 'Highlight benchmark data in executive deck.',
      },
      {
        key: 'decision_process',
        name: 'Decision Process',
        shortCode: 'Dp',
        status: 'weak',
        score: 45,
        summary: 'Q3 budget lock is next Friday; missing this deadline slips deal into Q4 or next fiscal year.',
        evidenceQuotes: ['"...if Dan doesn\'t get Marcus\'s explicit blessing before Q3 budget lock next Friday, this will slip into Q4..."'],
        recommendation: 'Fast-track business case submission before Thursday.',
      },
      {
        key: 'paper_process',
        name: 'Paper Process',
        shortCode: 'P',
        status: 'validated',
        score: 70,
        summary: 'Standard procurement process once CFO budget approval is granted.',
        evidenceQuotes: ['"...signs off if our department budget absorbs it."'],
        recommendation: 'Prepare standard SaaS agreement for rapid turnaround.',
      },
      {
        key: 'identify_pain',
        name: 'Identify Pain',
        shortCode: 'I',
        status: 'validated',
        score: 88,
        summary: 'Severe on-call burnout and slow P1 incident resolution across engineering teams.',
        evidenceQuotes: ['"...our team is burning out on on-call rotations and we need tooling relief."'],
        recommendation: 'Translate on-call burnout into engineering turnover risk costs.',
      },
      {
        key: 'champion',
        name: 'Champion',
        shortCode: 'C',
        status: 'weak',
        score: 55,
        summary: 'VP Dan Henderson is enthusiastic technically, but hesitant to advocate directly to CFO without pre-packaged numbers.',
        evidenceQuotes: ['"I haven\'t pitched him on this line item yet."'],
        recommendation: 'Co-create executive pitch with Dan to make him confident before Marcus.',
      },
      {
        key: 'competition',
        name: 'Competition',
        shortCode: 'Co',
        status: 'weak',
        score: 45,
        summary: 'Datadog offered an aggressive 25% bundled renewal discount appealing to Finance.',
        evidenceQuotes: ['"Datadog came back with a bundled renewal discount that is about 25% lower than your proposal."'],
        recommendation: 'Differentiate on unified SRE workflow vs. siloed APM metrics.',
      },
    ];

    gaps = [
      {
        id: 'gap-a1',
        elementKey: 'economic_buyer',
        title: 'Economic Buyer Marcus Vance (CFO) Not Engaged',
        severity: 'high',
        description: 'Dan Henderson has not pitched Marcus Vance. Marcus requires a concise 1-page financial ROI sheet and has not seen the business case.',
        evidenceQuote: 'I haven\'t pitched him on this line item yet. Marcus usually stays out of vendor demos.',
        speaker: 'Dan Henderson (VP Eng)',
        impactScore: 26,
      },
      {
        id: 'gap-a2',
        elementKey: 'metrics',
        title: 'No Hard Dollar ROI Quantified',
        severity: 'medium',
        description: 'Pain is acknowledged qualitatively (burnout), but financial savings (MTTR dollar impact, engineer retention) have not been modeled.',
        evidenceQuote: 'Honestly, we have not put a hard dollar figure on it yet.',
        speaker: 'Dan Henderson (VP Eng)',
        impactScore: 18,
      },
      {
        id: 'gap-a3',
        elementKey: 'competition',
        title: 'Datadog 25% Renewal Discount Pressure',
        severity: 'medium',
        description: 'Director Elena highlighted a 25% renewal discount from Datadog that will attract Finance unless superior value is proven.',
        evidenceQuote: 'Datadog came back with a bundled renewal discount that is about 25% lower than your proposal.',
        speaker: 'Elena Rostova (Director Cloud Ops)',
        impactScore: 10,
      },
    ];

    actions = [
      {
        id: 'act-a1',
        title: 'Draft AE Executive Brief & 1-Page ROI Justification',
        owner: 'AE (Sarah Jenkins)',
        priority: 'high',
        dueTimeframe: 'By Wednesday 10:00 AM',
        description: 'Trigger email.draft_ae_brief to send champion Dan Henderson a pre-packaged 1-page financial model to present to CFO Marcus Vance.',
        skillToTrigger: 'email.draft_ae_brief',
        skillParams: {
          recipient_role: 'VP Engineering',
          champion_name: 'Dan Henderson',
          deal_gaps: ['Unquantified ROI', 'Datadog 25% pricing pressure', 'Q3 budget deadline'],
          call_to_action: 'Align on 1-page ROI justification before Marcus meeting',
        },
        status: 'pending',
      },
      {
        id: 'act-a2',
        title: 'Sync Strategic Action Milestones to CRM',
        owner: 'DealPulse Agent',
        priority: 'medium',
        dueTimeframe: 'Immediate',
        description: 'Append executive alignment tasks and budget lock milestone to Salesforce opportunity record.',
        skillToTrigger: 'crm.add_next_steps',
        skillParams: {
          opportunity_id: opportunity.id,
          actions: [
            { title: 'Co-build 1-page ROI sheet with Dan Henderson', owner: 'Sarah Jenkins (AE)', due: 'Thursday' },
            { title: 'Secure Marcus Vance CFO sign-off prior to Friday lock', owner: 'Dan Henderson (Champion)', due: 'Next Friday' },
          ],
        },
        status: 'pending',
      },
      {
        id: 'act-a3',
        title: 'Update Pipeline Probability & Stage',
        owner: 'RevOps (Alex)',
        priority: 'medium',
        dueTimeframe: 'Today',
        description: 'Adjust close probability to 55% reflecting unconfirmed Economic Buyer access.',
        skillToTrigger: 'crm.update_stage',
        skillParams: {
          opportunity_id: opportunity.id,
          new_stage: 'Stage 3 - Business Case Alignment',
          risk_flag: 'EB_UNCOMMITTED',
          confidence: 55,
        },
        status: 'pending',
      },
    ];
  }

  // Generate Handoff Packet
  const handoffPacket: HandoffPacket = {
    packetId: isScenarioB ? 'HPK-904218' : 'HPK-381042',
    correlationId: isScenarioB ? 'corr-bfin-9982' : 'corr-cld-4410',
    createdAt: new Date().toISOString(),
    checksum: isScenarioB 
      ? 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
      : 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d30f11acde4d27e28987bcf879e623',
    fromAgent: 'DealPulse Primary Orchestrator',
    toAgent: isScenarioB ? 'Compliance & Legal Specialist Agent' : 'Account Executive (Sarah Jenkins)',
    recommendedOwner: isScenarioB ? 'Elena Vance (General Counsel & FinTech Compliance Lead)' : 'Sarah Jenkins (Enterprise AE)',
    reason: isScenarioB 
      ? 'Risk score 84 exceeded critical threshold (70). Critical Paper Process redline on BaFin EU data residency and 5x indemnity liability cap before Thursday 5 PM CET board cutoff.'
      : 'Routine deal risk review: Champion Dan Henderson requires executive ROI justification for CFO Marcus Vance before Q3 budget lock.',
    riskScore,
    severity,
    opportunityId: opportunity.id,
    accountName: opportunity.accountName,
    meddpiccGaps: gaps.map(g => `${g.title} (${g.severity.toUpperCase()})`),
    decisionsSoFar: isScenarioB 
      ? [
          'CTO Charlotte Dubois approved $350k budget allocation',
          'Standard SaaS DPA rejected by Lead Counsel Rachel Thorne',
          'Deal escalated to P1 Deal Desk War Room',
        ]
      : [
          '2-Week trial successful with SRE platform engineering leads',
          'Identified Datadog 25% discount competitor move',
          'Agreed to build 1-page financial model for CFO',
        ],
    openQuestions: isScenarioB 
      ? [
          'Can engineering guarantee strict in-region Frankfurt telemetry lock without aggregate latency?',
          'Will Legal VP approve a 2.5x indemnity compromise cap before Thursday 5 PM CET?',
        ]
      : [
          'What is Marcus Vance\'s required payback period / hurdle rate?',
          'Can we schedule a 15-minute executive brief with Marcus on Monday?',
        ],
    recommendedActions: actions.map(a => `${a.title} [Owner: ${a.owner}]`),
    evidenceQuotes: gaps.filter(g => g.evidenceQuote).map(g => ({
      quote: g.evidenceQuote!,
      speaker: g.speaker || 'Customer Stakeholder',
      context: g.description,
    })),
    status: isScenarioB ? 'routed' : 'pending',
  };

  const handoffTimeline: HandoffTimelineNode[] = isScenarioB
    ? [
        {
          agentName: 'DealPulse Agent',
          role: 'Primary Deal-Risk Orchestrator',
          status: 'completed',
          timestamp: '11:52:04',
          summary: 'Scanned transcript, extracted MEDDPICC blockers (Paper Process 15%), computed risk score 84.',
        },
        {
          agentName: 'Compliance Specialist Agent',
          role: 'Legal & Regulatory Specialization',
          status: 'active',
          timestamp: '11:52:08',
          summary: 'Triage BaFin Frankfurt tenant isolation addendum and 2.5x indemnity compromise framework.',
        },
        {
          agentName: 'Sarah Jenkins & Legal VP',
          role: 'Human Deal Desk & Account Executive',
          status: 'queued',
          timestamp: 'Pending Hand-off',
          summary: 'Executive sign-off and delivery to Rachel Thorne before Thursday 5 PM CET board cutoff.',
          isHuman: true,
        },
      ]
    : [
        {
          agentName: 'DealPulse Agent',
          role: 'Primary Deal-Risk Orchestrator',
          status: 'completed',
          timestamp: '11:52:04',
          summary: 'Scanned transcript, identified missing Economic Buyer & unquantified metrics, computed risk score 54.',
        },
        {
          agentName: 'AE Copilot Agent',
          role: 'Executive Brief & Sales Enablement',
          status: 'completed',
          timestamp: '11:52:06',
          summary: 'Drafted 1-page financial ROI justification for CFO Marcus Vance.',
        },
        {
          agentName: 'Sarah Jenkins (AE)',
          role: 'Enterprise Account Executive',
          status: 'active',
          timestamp: 'Actionable',
          summary: 'Deliver executive brief to champion Dan Henderson ahead of next Friday budget lock.',
          isHuman: true,
        },
      ];

  return {
    analyzed: true,
    analyzing: false,
    riskScore,
    severity,
    scoreBreakdown: {
      meddpiccWeight: isScenarioB ? 48 : 28,
      sentimentPenalty: isScenarioB ? 24 : 14,
      timelineRisk: isScenarioB ? 12 : 12,
    },
    summary,
    meddpiccItems,
    gaps,
    actions,
    handoffPacket,
    handoffTimeline,
  };
}
