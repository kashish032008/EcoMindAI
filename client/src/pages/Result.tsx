import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Save, RotateCcw, AlertTriangle, Cpu, Recycle, Loader2, Info } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { ACTION_LABELS, CONDITION_LABELS, ACTION_EMOJI, REUSABILITY_LABELS, RECYCLING_STATUS_LABELS } from '../types';
import { saveAnalysis, getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';

const actionColorClass: Record<string, string> = {
  REUSE: 'action-REUSE',
  PREPARE_AND_RECYCLE: 'action-PREPARE_AND_RECYCLE',
  RECYCLE: 'action-RECYCLE',
  COMPOST: 'action-COMPOST',
  CHECK_LOCAL_FACILITY: 'action-CHECK_LOCAL_FACILITY',
  SPECIAL_DISPOSAL: 'action-SPECIAL_DISPOSAL',
  GENERAL_DISPOSAL: 'action-GENERAL_DISPOSAL',
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const state = location.state as { result: AnalysisResult; imagePreview?: string } | null;

  useEffect(() => {
    if (!state?.result) navigate('/analyze', { replace: true });
  }, [state, navigate]);

  if (!state?.result) return null;

  const { result } = state;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAnalysis({
        imageUrl: result.imageUrl,
        objectName: result.objectName,
        material: result.material,
        materialCode: result.materialCode,
        condition: result.condition,
        contaminationLevel: result.contaminationLevel,
        contaminationPercentage: result.contaminationPercentage,
        reusability: result.reusability,
        recyclingStatus: result.recyclingStatus,
        recommendedAction: result.recommendedAction,
        recommendationReason: result.recommendationReason,
        actionSteps: result.actionSteps,
        secondLifePotential: result.secondLifePotential,
        secondLifeExplanation: result.secondLifeExplanation,
        confidence: result.confidence,
        isDemo: result.isDemo,
      });
      setSaved(true);
      toast.success('Analysis saved successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const detailItems = [
    { label: 'Material', value: result.material + (result.materialCode ? ` — ${result.materialCode}` : ''), icon: Cpu },
    { label: 'Condition', value: CONDITION_LABELS[result.condition], icon: Info },
    { label: 'Contamination', value: `${result.contaminationLevel.charAt(0).toUpperCase() + result.contaminationLevel.slice(1)} (${result.contaminationPercentage || 0}%)`, icon: AlertTriangle },
    { label: 'Reusability', value: REUSABILITY_LABELS[result.reusability] || 'Unknown', icon: Recycle },
    { label: 'Recycling Status', value: RECYCLING_STATUS_LABELS[result.recyclingStatus] || 'Unknown', icon: Recycle },
  ];

  return (
    <div className="min-h-screen gradient-bg-subtle py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(16,185,129,0.1)] border border-[var(--color-border)] rounded-full text-sm text-[var(--color-primary)] font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            AI Analysis Complete
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Your Waste Analysis</h1>
          {result.isDemo && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-xs text-purple-600 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Demo Analysis — results are illustrative
            </div>
          )}
        </div>

        {/* Image + Object Name */}
        <div className="card p-6 mb-5 animate-fade-up delay-100">
          <div className="flex gap-5 items-center">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-[rgba(16,185,129,0.05)] flex-shrink-0 ">
              {(state.imagePreview || result.imageUrl) ? (
                <img
                  src={state.imagePreview || result.imageUrl}
                  alt={result.objectName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {ACTION_EMOJI[result.recommendedAction]}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Detected Object</div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">{result.objectName}</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Cpu className="w-4 h-4 text-[var(--color-primary-light)]" />
                {result.material}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">{result.isDemo ? 'Demo Confidence:' : 'AI Confidence:'}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                    <div className="h-full gradient-bg rounded-full" style={{ width: `${result.confidence}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-primary)]">{result.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-up delay-200">
          {detailItems.map(item => (
            <div key={item.label} className="card p-4">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{item.label}</div>
              <div className="font-semibold text-[var(--color-text)] text-sm leading-snug">{item.value}</div>
            </div>
          ))}
        </div>

        {/* ── Recommended Action ───────────────────────────────────────────── */}
        <div className={`card p-6 mb-5 border-2 animate-fade-up delay-300 ${actionColorClass[result.recommendedAction]}`}>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Recommended Action</div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{ACTION_EMOJI[result.recommendedAction]}</span>
            <span className="text-2xl font-bold">{ACTION_LABELS[result.recommendedAction]}</span>
          </div>
        </div>

        {/* ── Why? ─────────────────────────────────────────────────────────── */}
        <div className="card p-5 mb-5 animate-fade-up delay-300">
          <h3 className="font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--color-primary-light)]" />
            Why did EcoMind recommend this?
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{result.recommendationReason}</p>
        </div>

        {/* ── Action Steps ─────────────────────────────────────────────────── */}
        {result.actionSteps && result.actionSteps.length > 0 && (
          <div className="card p-5 mb-5 animate-fade-up delay-400">
            <h3 className="font-semibold text-[var(--color-text)] mb-4">What should you do?</h3>
            <ol className="space-y-3">
              {result.actionSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--color-text-muted)]">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-bg text-white text-xs font-bold flex items-center justify-center ">
                    {i + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Second-Life Potential ────────────────────────────────────────── */}
        {result.secondLifePotential && (
          <div className="card p-5 mb-5 animate-fade-up delay-400">
            <h3 className="font-semibold text-[var(--color-text)] mb-2">♻️ Second-Life Potential</h3>
            <div className="bg-[rgba(16,185,129,0.05)] border border-[var(--color-border)] rounded-xl p-4">
              <div className="font-semibold text-[var(--color-primary)] text-sm mb-1">{result.secondLifePotential}</div>
              <p className="text-[var(--color-primary)] text-xs leading-relaxed">{result.secondLifeExplanation}</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 mb-6 animate-fade-up delay-400">
          ⚠️ AI recommendations are informational and may vary according to local recycling guidelines and facility capabilities. Always check with your local authority for the most accurate guidance.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-400">
          <button
            id="save-analysis-btn"
            onClick={handleSave}
            disabled={saving || saved}
            className="btn btn-primary animate-pulse-glow flex-1 justify-center py-3"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" />Saved!</>
            ) : (
              <><Save className="w-4 h-4" />Save Analysis</>
            )}
          </button>
          <Link to="/analyze" className="btn btn-outline flex-1 justify-center py-3">
            <RotateCcw className="w-4 h-4" />
            Analyze Another Item
          </Link>
        </div>

        {saved && (
          <div className="mt-4 flex gap-3 text-sm justify-center">
            <Link to="/dashboard" className="text-[var(--color-primary)] hover:underline font-medium">View Dashboard →</Link>
            <span className="text-[var(--color-text-muted)]">·</span>
            <Link to="/history" className="text-[var(--color-primary)] hover:underline font-medium">View History →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
