export interface HistoricalSimilarClient {
  id: string;
  name: string;
  industry: string;
  similarityScore: number;
  outcome: 'churned' | 'retained' | 'upsold';
  healthAtTime: number;
  reasonForChurn?: string;
  lessonsLearned?: string;
}

export interface KeyInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
}

export interface TrendInterpretation {
  detectedTrend: string;
  confidence: number;
  businessInterpretation: string;
  possibleCauses: string[];
  historicalComparison: string;
}

export interface ClientTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'creation' | 'campaign' | 'kpi' | 'analysis' | 'recommendation' | 'workflow';
  author?: string;
}
