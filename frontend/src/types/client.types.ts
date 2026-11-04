// ============================================================
// Client Types
// ============================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'healthy';
export type ClientStatus = 'active' | 'at-risk' | 'churned' | 'new' | 'retained';
export type ClientTier = 'enterprise' | 'growth' | 'starter' | 'partner';
export type ClientWorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ClientContact {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary: boolean;
}

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  tier: ClientTier;
  status: ClientStatus;
  riskLevel: RiskLevel;
  churnProbability: number;
  healthScore: number;
  mrr: number;
  arr: number;
  contractValue: number;
  contractStartDate: string;
  contractEndDate: string;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
  contact: ClientContact;
  address: ClientAddress;
  tags: string[];
  segmentId?: string;
  accountManager?: string; // e.g. "Sarah Jenkins"
  campaign?: string; // e.g. "Q3 Retention Drive"
  program?: string; // e.g. "Enterprise Success Plan"
  workflowStatus?: ClientWorkflowStatus;
  metadata?: Record<string, unknown>;
}

export interface ClientSummaryStats {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  churnedClients: number;
  avgHealthScore: number;
  avgChurnProbability: number;
  totalMRR: number;
  totalARR: number;
}

export interface ClientListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ClientStatus;
  riskLevel?: RiskLevel;
  industry?: string;
  campaign?: string;
  program?: string;
  accountManager?: string;
  tier?: ClientTier;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minHealth?: number;
  maxHealth?: number;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ClientInfo {
  id?: string;
  name?: string;
  program_type?: string;
  program_duration?: string;
  program_stage?: string;
  campaign_status?: string;
}

export interface SummaryResult {
  text?: string;
  satisfaction_score?: number;
}

export interface KPIResult {
  interpretation?: Record<string, any>;
}

export interface HistoricalContext {
  historical_matches?: Record<string, any>[];
  summary_matches?: Record<string, any>[];
  kpi_matches?: Record<string, any>[];
}

export interface ChurnResult {
  probability?: number;
  risk_level?: string;
  analysis?: string;
  red_flags?: string[];
  bottlenecks?: string[];
  historical_insights?: string[];
}

export interface ClientAnalysisResponse {
  client: ClientInfo;
  summary: SummaryResult;
  kpi: KPIResult;
  historical_context: HistoricalContext;
  churn: ChurnResult;
  recommendations?: string[];
  status?: string;
}

export interface ClientAnalysisRequest {
  user_query: string;
}

