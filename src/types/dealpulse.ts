export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type MeddpiccElementKey = 
  | 'metrics'
  | 'economic_buyer'
  | 'decision_criteria'
  | 'decision_process'
  | 'paper_process'
  | 'identify_pain'
  | 'champion'
  | 'competition';

export type MeddpiccStatus = 'validated' | 'weak' | 'missing' | 'blocker';

export interface MeddpiccItem {
  key: MeddpiccElementKey;
  name: string;
  shortCode: string;
  status: MeddpiccStatus;
  score: number; // 0 - 100
  summary: string;
  evidenceQuotes: string[];
  recommendation: string;
}

export interface DealGap {
  id: string;
  elementKey: MeddpiccElementKey;
  title: string;
  severity: RiskSeverity;
  description: string;
  evidenceQuote?: string;
  speaker?: string;
  impactScore: number;
}

export interface NextBestAction {
  id: string;
  title: string;
  owner: string; // e.g. "AE (Sarah)", "RevOps (Alex)", "Legal Specialist"
  priority: 'urgent' | 'high' | 'medium';
  dueTimeframe: string;
  description: string;
  skillToTrigger?: string;
  skillParams?: Record<string, any>;
  status: 'pending' | 'executed' | 'in_progress';
  resultSummary?: string;
}

export interface CrmOpportunity {
  id: string;
  accountName: string;
  industry: string;
  arr: number;
  stage: string;
  closeDate: string;
  healthScore: number;
  primaryContact: {
    name: string;
    role: string;
    sentiment: string;
  };
  economicBuyer?: {
    name: string;
    role: string;
    status: 'unidentified' | 'identified' | 'engaged';
  };
  competitors: string[];
  techStack: string[];
  lastActivityDate: string;
  assignedAe: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: string;
  role: string;
  timestamp: string;
  text: string;
  meddpiccTag?: MeddpiccElementKey;
  sentiment?: 'positive' | 'neutral' | 'caution' | 'negative';
}

export interface DemoScenario {
  id: 'scenario_a' | 'scenario_b';
  name: string;
  tagline: string;
  riskCategory: RiskSeverity;
  baselineRiskScore: number;
  opportunity: CrmOpportunity;
  transcript: TranscriptTurn[];
  expectedSummary: string;
  initialExplanation: string;
}

export interface McpSkill {
  name: string;
  namespace: string;
  description: string;
  version: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  isMock: boolean;
  category: 'crm' | 'analysis' | 'comms' | 'orchestration' | 'compliance';
}

export interface ActionLedgerEntry {
  id: string;
  correlationId: string;
  timestamp: string;
  skillName: string;
  category: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  status: 'success' | 'failed' | 'running';
  executionTimeMs: number;
  agentOwner: string;
  notes?: string;
}

export interface HandoffPacket {
  packetId: string;
  correlationId: string;
  createdAt: string;
  checksum: string;
  fromAgent: string;
  toAgent: string;
  recommendedOwner: string;
  reason: string;
  riskScore: number;
  severity: RiskSeverity;
  opportunityId: string;
  accountName: string;
  meddpiccGaps: string[];
  decisionsSoFar: string[];
  openQuestions: string[];
  recommendedActions: string[];
  evidenceQuotes: { quote: string; speaker: string; context: string }[];
  status: 'pending' | 'routed' | 'accepted' | 'escalated_to_human';
  isFrozen?: boolean;
  frozenReason?: string;
}

export interface HandoffTimelineNode {
  agentName: string;
  role: string;
  status: 'active' | 'completed' | 'queued';
  timestamp: string;
  summary: string;
  isHuman?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentName?: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  activeSkillCalling?: string;
  citations?: { quote: string; speaker: string; category?: string }[];
  actionPrompts?: { label: string; action: () => void }[];
  generatedArtifact?: {
    type: 'email' | 'ticket' | 'stage_update' | 'handoff';
    title: string;
    content: string;
  };
  ctaButtons?: {
    id: string;
    label: string;
    actionType: 'open_artifact' | 'execute_skill' | 'open_transcript' | 'open_handoff';
    skillName?: string;
    artifact?: {
      type: string;
      title: string;
      content: string;
    };
    variant?: 'primary' | 'secondary' | 'warning' | 'danger';
    iconName?: 'ticket' | 'mail' | 'tasks' | 'user' | 'scale' | 'shield';
  }[];
}

export interface AnalysisState {
  analyzed: boolean;
  analyzing: boolean;
  riskScore: number;
  severity: RiskSeverity;
  scoreBreakdown: {
    meddpiccWeight: number;
    sentimentPenalty: number;
    timelineRisk: number;
  };
  summary: string;
  meddpiccItems: MeddpiccItem[];
  gaps: DealGap[];
  actions: NextBestAction[];
  handoffPacket: HandoffPacket | null;
  handoffTimeline: HandoffTimelineNode[];
}
