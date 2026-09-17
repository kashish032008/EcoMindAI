/**
 * Decision Engine — EcoMind AI
 *
 * Transforms AI analysis output into a structured, intelligent recommendation.
 * Fully decoupled from UI and AI provider — can be improved independently.
 *
 * Pipeline:
 *   AI Analysis → Reusability Assessment → Recycling Status → Decision → Action + Steps + Explanation
 *
 * Decision Priority:
 *   1. REUSE            — item is reusable and in good/clean condition
 *   2. PREPARE & RECYCLE — recyclable after preparation (contaminated/needs cleaning)
 *   3. RECYCLE          — recyclable and clean/ready
 *   4. COMPOST          — organic material
 *   5. CHECK LOCAL FACILITY — recycling status is facility-dependent
 *   6. SPECIAL DISPOSAL — hazardous, e-waste, special handling required
 *   7. GENERAL DISPOSAL — none of the above
 */

import type { AIAnalysisResult } from './aiService';
import type {
  RecommendedAction,
  ConditionLevel,
  ReusabilityStatus,
  RecyclingStatus,
} from '../models/WasteAnalysis';

export interface DecisionResult {
  recommendedAction: RecommendedAction;
  recommendationReason: string;
  actionSteps: string[];
  actionLabel: string;
  actionColor: string;
  reusability: ReusabilityStatus;
  recyclingStatus: RecyclingStatus;
  secondLifePotential: string;
  secondLifeExplanation: string;
}

// ─── Second-Life Assessment ──────────────────────────────────────────────────
function assessSecondLife(
  ai: AIAnalysisResult,
): { potential: string; explanation: string } {
  if (ai.reusability === 'reusable') {
    return {
      potential: 'Good potential for reuse',
      explanation: `This ${ai.objectName.toLowerCase()} is in ${formatCondition(ai.condition)} condition and can be cleaned and reused directly. Consider giving it a second life before recycling — this is the most sustainable option.`,
    };
  }
  if (ai.reusability === 'reusable_after_preparation') {
    return {
      potential: 'Reuse possible after preparation',
      explanation: `This ${ai.objectName.toLowerCase()} could be reused after appropriate cleaning or preparation. Reuse extends the lifecycle of the item and reduces waste.`,
    };
  }
  if (ai.recyclingStatus === 'recyclable' || ai.recyclingStatus === 'recyclable_after_preparation') {
    return {
      potential: 'Primarily suitable for recycling',
      explanation: `This ${ai.objectName.toLowerCase()} is not suitable for direct reuse but can be recycled. Recycling recovers the ${ai.material.toLowerCase()} material and keeps it in the production cycle.`,
    };
  }
  return {
    potential: 'Not suitable for reuse',
    explanation: `This ${ai.objectName.toLowerCase()} is not suitable for reuse due to its material type or current condition. Proper disposal or specialist handling is recommended.`,
  };
}

// ─── Contextual Action Steps ─────────────────────────────────────────────────
// Steps are generated per-item based on the actual analysis, not from generic templates.
function generateActionSteps(
  action: RecommendedAction,
  ai: AIAnalysisResult,
): string[] {
  const objLower = ai.objectName.toLowerCase();
  const isContaminated = ai.contaminationLevel === 'medium' || ai.contaminationLevel === 'high'
    || ai.condition === 'contaminated' || ai.condition === 'heavily_contaminated';

  switch (action) {
    case 'REUSE':
      if (ai.condition === 'clean' || ai.condition === 'good') {
        return [
          `Inspect the ${objLower} for any damage or wear.`,
          `Clean appropriately if needed.`,
          `Reuse the item directly — this is more sustainable than recycling.`,
          `Consider donating if you no longer need it.`,
        ];
      }
      return [
        `Inspect the ${objLower} for damage.`,
        `Clean the item thoroughly with appropriate method.`,
        `Store safely for reuse or repurpose.`,
        `Consider donating if no personal use is available.`,
      ];

    case 'PREPARE_AND_RECYCLE':
      const steps: string[] = [];
      // Only show emptying step for containers
      if (/bottle|can|jar|cup|container/i.test(ai.objectName)) {
        steps.push(`Empty any remaining contents from the ${objLower}.`);
      }
      // Only show cleaning step when actually contaminated
      if (isContaminated) {
        steps.push(`Rinse with water to remove residue — this helps the material be accepted for recycling.`);
      }
      // Show separation step only for multi-component items
      if (/bottle|cup|box|container/i.test(ai.objectName)) {
        steps.push(`Separate different material components if present (e.g. caps, labels).`);
      }
      steps.push(`Check your local recycling guidelines for ${ai.material.toLowerCase()} (${ai.materialCode || ai.material}).`);
      steps.push(`Place the prepared material in the appropriate recycling stream.`);
      return steps;

    case 'RECYCLE':
      return [
        `Keep the ${objLower} free from contamination.`,
        ...(/bottle|can|jar|cup|container|box/i.test(ai.objectName)
          ? [`Separate components if required by your local recycling system.`]
          : []),
        `Place it in the designated recycling bin for ${ai.material.toLowerCase()}.`,
      ];

    case 'COMPOST':
      return [
        `Remove any non-organic attachments (labels, wrappers, packaging).`,
        `Place in your compost bin or organic waste collection.`,
        `Consider home composting if facilities are available.`,
        `Avoid adding diseased or chemically treated organic material.`,
      ];

    case 'CHECK_LOCAL_FACILITY':
      return [
        `This type of ${ai.material.toLowerCase()} item may or may not be accepted by your local recycling facility.`,
        `Check with your local authority or recycling provider for specific guidance on ${ai.materialCode || ai.material.toLowerCase()}.`,
        ...(isContaminated
          ? [`If accepted, the item may need cleaning or preparation before recycling.`]
          : []),
        `If not accepted locally, dispose of through general waste.`,
        `Consider switching to more easily recyclable alternatives in future.`,
      ];

    case 'SPECIAL_DISPOSAL':
      return [
        `Do NOT place this ${objLower} in regular waste or recycling bins.`,
        `Locate the nearest e-waste or hazardous waste collection point.`,
        `Some retailers and manufacturers offer take-back or collection schemes for ${ai.material.toLowerCase()}.`,
        `Check your local authority website for designated disposal facilities.`,
        `Handle with care — avoid damage that could cause leaks or contamination.`,
      ];

    case 'GENERAL_DISPOSAL':
      return [
        `This ${objLower} is not currently suitable for recycling or composting.`,
        `Place in your general waste bin.`,
        `Consider whether a reusable or more recyclable alternative could replace this item in future.`,
      ];

    default:
      return [`Dispose of this item according to your local waste management guidelines.`];
  }
}

// ─── Contextual Explanation ──────────────────────────────────────────────────
function generateExplanation(
  action: RecommendedAction,
  ai: AIAnalysisResult,
): string {
  const obj = ai.objectName;
  const mat = ai.material;
  const code = ai.materialCode ? ` (${ai.materialCode})` : '';
  const cond = formatCondition(ai.condition);

  switch (action) {
    case 'REUSE':
      return `This ${obj.toLowerCase()} is made of ${mat.toLowerCase()}${code} and is in ${cond} condition. ` +
        `Because the item is ${ai.reusability === 'reusable' ? 'suitable for direct reuse' : 'reusable after cleaning'}, ` +
        `EcoMind recommends reuse as the most sustainable option — extending the item's lifecycle before considering recycling.`;

    case 'PREPARE_AND_RECYCLE':
      return `This item is made of ${mat.toLowerCase()}${code} and is recyclable, but ${cond.toLowerCase()} contamination was detected. ` +
        `EcoMind therefore recommends preparation (cleaning/rinsing) before sending it to the appropriate recycling stream. ` +
        `Most facilities require materials to be reasonably clean before they can be processed.`;

    case 'RECYCLE':
      return `This ${obj.toLowerCase()} is made of ${mat.toLowerCase()}${code} and is in suitable condition for direct recycling. ` +
        `The material is widely accepted by recycling facilities. ` +
        `Place it in the appropriate recycling stream according to your local guidelines.`;

    case 'COMPOST':
      return `This is organic material that can be composted rather than sent to landfill. ` +
        `Composting returns nutrients to the soil and significantly reduces greenhouse gas emissions compared to landfill disposal.`;

    case 'CHECK_LOCAL_FACILITY':
      return `This ${obj.toLowerCase()} is made of ${mat.toLowerCase()}${code} in ${cond} condition. ` +
        `Acceptance of this material varies between recycling facilities depending on local infrastructure and processing capabilities. ` +
        `EcoMind cannot make a universal recycling claim for this item — please check with your local recycling provider.`;

    case 'SPECIAL_DISPOSAL':
      return `This ${obj.toLowerCase()} contains ${mat.toLowerCase()} materials that require specialised handling. ` +
        `It must NOT be placed in regular waste or recycling bins. ` +
        `Use an authorised e-waste or hazardous waste collection facility to ensure safe and responsible disposal.`;

    case 'GENERAL_DISPOSAL':
      return `Due to its ${cond} condition and material composition (${mat.toLowerCase()}${code}), ` +
        `this item cannot be effectively recycled, reused, or composted under standard guidelines. ` +
        `Dispose of through general waste. Consider switching to more sustainable alternatives in future.`;

    default:
      return `Dispose of this item according to local waste management guidelines.`;
  }
}

// ─── Main Decision Function ───────────────────────────────────────────────────
export function makeDecision(aiResult: AIAnalysisResult): DecisionResult {
  const { reusability, recyclingStatus, isOrganic, isHazardous, condition, contaminationLevel } = aiResult;

  let recommendedAction: RecommendedAction;

  const isGoodCondition = condition === 'clean' || condition === 'good' || condition === 'slightly_contaminated';

  // Priority 1: Reuse (item is directly reusable and condition is acceptable)
  if (reusability === 'reusable' && isGoodCondition) {
    recommendedAction = 'REUSE';
  }
  // Priority 2: Hazardous / E-waste / Special handling → Special Disposal
  else if (isHazardous || recyclingStatus === 'special_handling') {
    recommendedAction = 'SPECIAL_DISPOSAL';
  }
  // Priority 3: Organic → Compost
  else if (isOrganic) {
    recommendedAction = 'COMPOST';
  }
  // Priority 4: Recyclable but contaminated → Prepare & Recycle
  else if (
    (recyclingStatus === 'recyclable' || recyclingStatus === 'recyclable_after_preparation') &&
    (contaminationLevel === 'medium' || contaminationLevel === 'high' ||
     condition === 'contaminated' || condition === 'heavily_contaminated' ||
     recyclingStatus === 'recyclable_after_preparation')
  ) {
    recommendedAction = 'PREPARE_AND_RECYCLE';
  }
  // Priority 5: Recyclable and clean → Recycle
  else if (recyclingStatus === 'recyclable') {
    recommendedAction = 'RECYCLE';
  }
  // Priority 6: Facility-dependent → Check Local Facility
  else if (recyclingStatus === 'facility_dependent') {
    recommendedAction = 'CHECK_LOCAL_FACILITY';
  }
  // Priority 7: Damaged, not recyclable, not reusable
  else {
    recommendedAction = 'GENERAL_DISPOSAL';
  }

  const secondLife = assessSecondLife(aiResult);
  const explanation = generateExplanation(recommendedAction, aiResult);
  const actionSteps = generateActionSteps(recommendedAction, aiResult);
  const actionMeta = getActionMeta(recommendedAction);

  return {
    recommendedAction,
    recommendationReason: explanation,
    actionSteps,
    actionLabel: actionMeta.label,
    actionColor: actionMeta.color,
    reusability,
    recyclingStatus,
    secondLifePotential: secondLife.potential,
    secondLifeExplanation: secondLife.explanation,
  };
}

function formatCondition(condition: ConditionLevel): string {
  const labels: Record<ConditionLevel, string> = {
    clean: 'clean',
    good: 'good',
    slightly_contaminated: 'slightly contaminated',
    contaminated: 'contaminated',
    heavily_contaminated: 'heavily contaminated',
    damaged: 'damaged',
    used: 'used',
    mixed_material: 'mixed material',
  };
  return labels[condition];
}

function getActionMeta(action: RecommendedAction): { label: string; color: string } {
  const meta: Record<RecommendedAction, { label: string; color: string }> = {
    REUSE: { label: 'Reuse', color: 'emerald' },
    PREPARE_AND_RECYCLE: { label: 'Prepare & Recycle', color: 'blue' },
    RECYCLE: { label: 'Recycle', color: 'teal' },
    COMPOST: { label: 'Compost', color: 'amber' },
    CHECK_LOCAL_FACILITY: { label: 'Check Local Facility', color: 'orange' },
    SPECIAL_DISPOSAL: { label: 'Special Disposal', color: 'red' },
    GENERAL_DISPOSAL: { label: 'General Disposal', color: 'gray' },
  };
  return meta[action];
}
