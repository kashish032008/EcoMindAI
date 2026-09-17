import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { Scan, Recycle, RefreshCw, AlertTriangle, Leaf, BarChart3, TrendingUp } from 'lucide-react';
import { fetchDashboard } from '../services/api';
import type { DashboardData, WasteAnalysis } from '../types';
import { ACTION_LABELS, ACTION_EMOJI, CONDITION_LABELS } from '../types';
import { SkeletonStat } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const MATERIAL_COLORS = ['#059669', '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#94a3b8'];
const ACTION_COLORS: Record<string, string> = {
  'Reuse': '#059669',
  'Prepare & Recycle': '#3b82f6',
  'Recycle': '#0d9488',
  'Compost': '#f59e0b',
  'Check Local Facility': '#f97316',
  'Check Facility': '#f97316',
  'Special Disposal': '#ef4444',
  'General Disposal': '#94a3b8',
};

const DEMO_DASHBOARD: DashboardData = {
  overview: { total: 0, reusable: 0, recyclable: 0, preparationNeeded: 0, facilityDependent: 0, compost: 0, specialDisposal: 0 },
  materialDistribution: [],
  actionDistribution: [],
  recentAnalyses: [],
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(DEMO_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Analyzed', value: data.overview.total, icon: Scan, color: 'text-[var(--color-primary)]', bg: 'bg-[rgba(16,185,129,0.05)]' },
    { label: 'Reusable', value: data.overview.reusable, icon: RefreshCw, color: 'text-[#60a5fa]', bg: 'bg-[rgba(59,130,246,0.1)]' },
    { label: 'Recyclable', value: data.overview.recyclable, icon: Recycle, color: 'text-[var(--color-accent)]', bg: 'bg-[rgba(6,182,212,0.1)]' },
    { label: 'Needs Preparation', value: data.overview.preparationNeeded, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Facility-dependent', value: data.overview.facilityDependent, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Special Disposal', value: data.overview.specialDisposal, icon: AlertTriangle, color: 'text-[#f43f5e]', bg: 'bg-[rgba(244,63,94,0.1)]' },
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">Dashboard</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Analytics overview of all waste analyses</p>
          </div>
          <Link to="/analyze" className="btn btn-primary animate-pulse-glow text-sm py-2">
            <Scan className="w-4 h-4" />
            Analyze Waste
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 mb-6">
            ⚠️ {error} — Showing empty state.
          </div>
        )}

        {/* ── Stat Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {loading
            ? Array(6).fill(0).map((_, i) => <SkeletonStat key={i} />)
            : statCards.map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-[var(--color-text)]">{s.value}</div>
                <div className="text-xs text-[var(--color-text-muted)] leading-tight mt-0.5">{s.label}</div>
              </div>
            ))
          }
        </div>

        {data.overview.total === 0 && !loading ? (
          <EmptyState
            icon={<BarChart3 className="w-7 h-7" />}
            title="No analyses yet"
            description="Analyze some waste items to see your dashboard statistics and charts."
            action={
              <Link to="/analyze" className="btn btn-primary animate-pulse-glow">
                <Scan className="w-4 h-4" />
                Analyze Waste
              </Link>
            }
          />
        ) : (
          <>
            {/* ── Charts Row ────────────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Material Pie */}
              <div className="card p-6">
                <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[rgba(16,185,129,0.05)]0" />
                  Material Distribution
                </h2>
                {data.materialDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.materialDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.materialDistribution.map((_, i) => (
                          <Cell key={i} fill={MATERIAL_COLORS[i % MATERIAL_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Items']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No data yet</div>
                )}
              </div>

              {/* Action Bar */}
              <div className="card p-6">
                <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[rgba(6,182,212,0.1)]0" />
                  Action Distribution
                </h2>
                {data.actionDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.actionDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Items" radius={[4, 4, 0, 0]}>
                        {data.actionDistribution.map((entry, i) => (
                          <Cell key={i} fill={ACTION_COLORS[entry.name] || MATERIAL_COLORS[i % MATERIAL_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No data yet</div>
                )}
              </div>
            </div>

            {/* ── Recent Analyses ───────────────────────────────────────────── */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="font-semibold text-[var(--color-text)]">Recent Analyses</h2>
                <Link to="/history" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                  View all →
                </Link>
              </div>
              {data.recentAnalyses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full data-table">
                    <thead>
                      <tr>
                        <th>Object</th>
                        <th>Material</th>
                        <th>Condition</th>
                        <th>Recommendation</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAnalyses.map((a: WasteAnalysis) => (
                        <tr key={a._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-[rgba(16,185,129,0.05)] flex-shrink-0 flex items-center justify-center text-lg">
                                {a.imageUrl
                                  ? <img src={a.imageUrl} alt={a.objectName} className="w-full h-full object-cover" />
                                  : ACTION_EMOJI[a.recommendedAction]
                                }
                              </div>
                              <span className="font-medium text-[var(--color-text)] text-sm">{a.objectName}</span>
                              {a.isDemo && <span className="text-[10px] text-purple-500 font-medium ml-2">Demo</span>}
                            </div>
                          </td>
                          <td className="text-[var(--color-text-muted)]">{a.material}</td>
                          <td>
                            <span className={`badge text-xs ${
                              a.condition === 'clean' ? 'badge-emerald'
                              : a.condition === 'slightly_contaminated' ? 'badge-amber'
                              : 'badge-red'
                            }`}>
                              {CONDITION_LABELS[a.condition]}
                            </span>
                          </td>
                          <td>
                            <span className={`badge text-xs action-${a.recommendedAction}`}>
                              {ACTION_LABELS[a.recommendedAction]}
                            </span>
                          </td>
                          <td className="text-[var(--color-text-muted)] text-xs">
                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-[var(--color-text-muted)] text-sm">No analyses yet. Start by analyzing a waste item.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
