import type { WasteAnalysis } from '../types';
import { ACTION_LABELS, CONDITION_LABELS, ACTION_EMOJI, REUSABILITY_LABELS } from '../types';
import { Calendar, Cpu, Recycle } from 'lucide-react';

interface Props {
  analysis: WasteAnalysis;
  onClick?: () => void;
  compact?: boolean;
}

const actionColorMap: Record<string, string> = {
  REUSE: 'badge-emerald',
  PREPARE_AND_RECYCLE: 'badge-blue',
  RECYCLE: 'badge-teal',
  COMPOST: 'badge-amber',
  CHECK_LOCAL_FACILITY: 'badge-orange',
  SPECIAL_DISPOSAL: 'badge-red',
  GENERAL_DISPOSAL: 'badge-gray',
};

const conditionColorMap: Record<string, string> = {
  clean: 'badge-emerald',
  slightly_contaminated: 'badge-amber',
  contaminated: 'badge-red',
  heavily_contaminated: 'badge-red',
  damaged: 'badge-red',
  used: 'badge-gray',
  mixed_material: 'badge-purple',
};

export default function AnalysisCard({ analysis, onClick, compact = false }: Props) {
  const actionBadge = actionColorMap[analysis.recommendedAction] || 'badge-gray';
  const condBadge = conditionColorMap[analysis.condition] || 'badge-gray';
  const date = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <div
      className={`card card-lift cursor-pointer overflow-hidden ${compact ? 'p-3' : 'p-5'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[rgba(16,185,129,0.05)]">
          {analysis.imageUrl ? (
            <img
              src={analysis.imageUrl}
              alt={analysis.objectName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {ACTION_EMOJI[analysis.recommendedAction]}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[var(--color-text)] truncate text-sm sm:text-base">
              {analysis.objectName}
            </h3>
            {analysis.isDemo && (
              <span className="badge badge-purple flex-shrink-0 text-[10px]">Demo</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`badge text-[11px] ${actionBadge}`}>
              {ACTION_LABELS[analysis.recommendedAction]}
            </span>
            <span className={`badge text-[11px] ${condBadge}`}>
              {CONDITION_LABELS[analysis.condition]}
            </span>
          </div>

          {!compact && (
            <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                {analysis.material}
                {analysis.materialCode && ` — ${analysis.materialCode}`}
              </span>
              {analysis.reusability && analysis.reusability !== 'not_suitable' && (
                <span className="flex items-center gap-1 text-[var(--color-primary)]">
                  <Recycle className="w-3.5 h-3.5" />
                  {REUSABILITY_LABELS[analysis.reusability] || 'Reusable'}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {date}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confidence bar */}
      {!compact && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
            <span>{analysis.isDemo ? 'Demo Confidence' : 'AI Confidence'}</span>
            <span>{analysis.confidence}%</span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-bg transition-all duration-700"
              style={{ width: `${analysis.confidence}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
