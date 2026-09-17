import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { WasteAnalysis } from '../types';
import { ACTION_LABELS, CONDITION_LABELS, ACTION_EMOJI, REUSABILITY_LABELS, RECYCLING_STATUS_LABELS } from '../types';

interface Props {
  analysis: WasteAnalysis;
  onClose: () => void;
}

const actionColorMap: Record<string, string> = {
  REUSE: 'action-REUSE',
  PREPARE_AND_RECYCLE: 'action-PREPARE_AND_RECYCLE',
  RECYCLE: 'action-RECYCLE',
  COMPOST: 'action-COMPOST',
  CHECK_LOCAL_FACILITY: 'action-CHECK_LOCAL_FACILITY',
  SPECIAL_DISPOSAL: 'action-SPECIAL_DISPOSAL',
  GENERAL_DISPOSAL: 'action-GENERAL_DISPOSAL',
};

export default function AnalysisModal({ analysis, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-lg text-[var(--color-text)]">Analysis Detail</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Image + Object */}
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-[rgba(16,185,129,0.05)] flex-shrink-0">
              {analysis.imageUrl ? (
                <img src={analysis.imageUrl} alt={analysis.objectName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {ACTION_EMOJI[analysis.recommendedAction]}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">{analysis.objectName}</h3>
              <p className="text-[var(--color-text-muted)] text-sm">{analysis.material}{analysis.materialCode ? ` — ${analysis.materialCode}` : ''}</p>
              {analysis.isDemo && (
                <span className="badge badge-purple text-xs mt-2 inline-block">Demo Analysis</span>
              )}
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Condition', value: CONDITION_LABELS[analysis.condition] },
              { label: 'Contamination', value: `${analysis.contaminationLevel.charAt(0).toUpperCase() + analysis.contaminationLevel.slice(1)} (${analysis.contaminationPercentage || 0}%)` },
              { label: analysis.isDemo ? 'Demo Confidence' : 'AI Confidence', value: `${analysis.confidence}%` },
              { label: 'Reusability', value: REUSABILITY_LABELS[analysis.reusability] || 'Unknown' },
              { label: 'Recycling Status', value: RECYCLING_STATUS_LABELS[analysis.recyclingStatus] || 'Unknown' },
            ].map(item => (
              <div key={item.label} className="bg-[var(--color-bg)] rounded-xl p-3">
                <div className="text-xs text-[var(--color-text-muted)] mb-0.5">{item.label}</div>
                <div className="font-semibold text-[var(--color-text)] text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Recommended Action */}
          <div className={`rounded-xl p-4 border-2 ${actionColorMap[analysis.recommendedAction]}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{ACTION_EMOJI[analysis.recommendedAction]}</span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Recommended Action</span>
            </div>
            <div className="text-xl font-bold">{ACTION_LABELS[analysis.recommendedAction]}</div>
          </div>

          {/* Reason */}
          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-2 text-sm">Why did EcoMind recommend this?</h4>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed bg-[var(--color-bg)] rounded-xl p-3">
              {analysis.recommendationReason}
            </p>
          </div>

          {/* Steps */}
          {analysis.actionSteps && analysis.actionSteps.length > 0 && (
            <div>
              <h4 className="font-semibold text-[var(--color-text)] mb-3 text-sm">What should you do?</h4>
              <ol className="space-y-2">
                {analysis.actionSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--color-text-muted)]">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-bg text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Second-Life Potential */}
          {analysis.secondLifePotential && (
            <div>
              <h4 className="font-semibold text-[var(--color-text)] mb-2 text-sm">♻️ Second-Life Potential</h4>
              <div className="bg-[rgba(16,185,129,0.05)] border border-[var(--color-border)] rounded-xl p-3">
                <div className="font-semibold text-[var(--color-primary)] text-sm mb-1">{analysis.secondLifePotential}</div>
                <p className="text-[var(--color-primary)] text-xs leading-relaxed">{analysis.secondLifeExplanation}</p>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-[var(--color-text-muted)] bg-amber-50 border border-amber-100 rounded-xl p-3">
            ⚠️ AI recommendations are informational and may vary according to local recycling guidelines and facility capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
