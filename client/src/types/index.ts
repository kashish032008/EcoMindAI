// ─── Shared Types for EcoMind AI Frontend ───────────────────────────────────

export type RecommendedAction =
  | 'REUSE'
  | 'PREPARE_AND_RECYCLE'
  | 'RECYCLE'
  | 'COMPOST'
  | 'CHECK_LOCAL_FACILITY'
  | 'SPECIAL_DISPOSAL'
  | 'GENERAL_DISPOSAL';

export type ConditionLevel =
  | 'clean'
  | 'good'
  | 'slightly_contaminated'
  | 'contaminated'
  | 'heavily_contaminated'
  | 'damaged'
  | 'used'
  | 'mixed_material';

export type ContaminationLevel = 'none' | 'low' | 'medium' | 'high';

export type ReusabilityStatus =
  | 'reusable'
  | 'reusable_after_preparation'
  | 'not_suitable';

export type RecyclingStatus =
  | 'recyclable'
  | 'recyclable_after_preparation'
  | 'facility_dependent'
  | 'not_suitable'
  | 'special_handling';

export interface WasteAnalysis {
  _id?: string;
  imageUrl: string;
  objectName: string;
  material: string;
  materialCode?: string;
  condition: ConditionLevel;
  contaminationLevel: ContaminationLevel;
  contaminationPercentage: number;
  reusability: ReusabilityStatus;
  recyclingStatus: RecyclingStatus;
  recommendedAction: RecommendedAction;
  recommendationReason: string;
  actionSteps: string[];
  actionLabel?: string;
  secondLifePotential: string;
  secondLifeExplanation: string;
  confidence: number;
  isDemo: boolean;
  createdAt?: string;
}

export interface AnalysisResult extends WasteAnalysis {
  actionLabel: string;
}

export interface DashboardData {
  overview: {
    total: number;
    reusable: number;
    recyclable: number;
    preparationNeeded: number;
    facilityDependent: number;
    compost: number;
    specialDisposal: number;
  };
  materialDistribution: { name: string; value: number }[];
  actionDistribution: { name: string; value: number }[];
  recentAnalyses: WasteAnalysis[];
}

export interface AnalysesResponse {
  analyses: WasteAnalysis[];
  total: number;
  page: number;
  pages: number;
}

// Label helpers
export const ACTION_LABELS: Record<RecommendedAction, string> = {
  REUSE: 'Reuse',
  PREPARE_AND_RECYCLE: 'Prepare & Recycle',
  RECYCLE: 'Recycle',
  COMPOST: 'Compost',
  CHECK_LOCAL_FACILITY: 'Check Local Facility',
  SPECIAL_DISPOSAL: 'Special Disposal',
  GENERAL_DISPOSAL: 'General Disposal',
};

export const CONDITION_LABELS: Record<ConditionLevel, string> = {
  clean: 'Clean',
  good: 'Good',
  slightly_contaminated: 'Slightly Contaminated',
  contaminated: 'Contaminated',
  heavily_contaminated: 'Heavily Contaminated',
  damaged: 'Damaged',
  used: 'Used',
  mixed_material: 'Mixed Material',
};

export const CONTAMINATION_LABELS: Record<ContaminationLevel, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const REUSABILITY_LABELS: Record<ReusabilityStatus, string> = {
  reusable: 'Reusable',
  reusable_after_preparation: 'Reusable after cleaning',
  not_suitable: 'Not suitable for reuse',
};

export const RECYCLING_STATUS_LABELS: Record<RecyclingStatus, string> = {
  recyclable: 'Recyclable',
  recyclable_after_preparation: 'Recyclable after preparation',
  facility_dependent: 'Facility-dependent',
  not_suitable: 'Not suitable for recycling',
  special_handling: 'Special handling required',
};

export const ACTION_EMOJI: Record<RecommendedAction, string> = {
  REUSE: '♻️',
  PREPARE_AND_RECYCLE: '🔄',
  RECYCLE: '♻️',
  COMPOST: '🌱',
  CHECK_LOCAL_FACILITY: '🏭',
  SPECIAL_DISPOSAL: '⚠️',
  GENERAL_DISPOSAL: '🗑️',
};
