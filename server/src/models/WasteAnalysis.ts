import mongoose, { Document, Schema } from 'mongoose';

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

export interface IWasteAnalysis extends Document {
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
  secondLifePotential: string;
  secondLifeExplanation: string;
  confidence: number;
  isDemo: boolean;
  createdAt: Date;
}

const WasteAnalysisSchema = new Schema<IWasteAnalysis>({
  imageUrl: { type: String, required: true },
  objectName: { type: String, required: true },
  material: { type: String, required: true },
  materialCode: { type: String },
  condition: {
    type: String,
    enum: ['clean', 'good', 'slightly_contaminated', 'contaminated', 'heavily_contaminated', 'damaged', 'used', 'mixed_material'],
    required: true,
  },
  contaminationLevel: {
    type: String,
    enum: ['none', 'low', 'medium', 'high'],
    required: true,
  },
  contaminationPercentage: { type: Number, min: 0, max: 100, default: 0 },
  reusability: {
    type: String,
    enum: ['reusable', 'reusable_after_preparation', 'not_suitable'],
    required: true,
  },
  recyclingStatus: {
    type: String,
    enum: ['recyclable', 'recyclable_after_preparation', 'facility_dependent', 'not_suitable', 'special_handling'],
    required: true,
  },
  recommendedAction: {
    type: String,
    enum: ['REUSE', 'PREPARE_AND_RECYCLE', 'RECYCLE', 'COMPOST', 'CHECK_LOCAL_FACILITY', 'SPECIAL_DISPOSAL', 'GENERAL_DISPOSAL'],
    required: true,
  },
  recommendationReason: { type: String, required: true },
  actionSteps: [{ type: String }],
  secondLifePotential: { type: String, default: '' },
  secondLifeExplanation: { type: String, default: '' },
  confidence: { type: Number, min: 0, max: 100, default: 85 },
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for filtering
WasteAnalysisSchema.index({ material: 1 });
WasteAnalysisSchema.index({ recommendedAction: 1 });
WasteAnalysisSchema.index({ condition: 1 });
WasteAnalysisSchema.index({ recyclingStatus: 1 });
WasteAnalysisSchema.index({ reusability: 1 });
WasteAnalysisSchema.index({ createdAt: -1 });

export default mongoose.model<IWasteAnalysis>('WasteAnalysis', WasteAnalysisSchema);
