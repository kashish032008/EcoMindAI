import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Scan, Trash2 } from 'lucide-react';
import { fetchAnalyses, deleteAnalysis, getErrorMessage } from '../services/api';
import type { WasteAnalysis } from '../types';
import { ACTION_LABELS, CONDITION_LABELS, ACTION_EMOJI } from '../types';
import AnalysisModal from '../components/AnalysisModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import toast from 'react-hot-toast';

const MATERIALS = ['all', 'Plastic', 'Glass', 'Paper/Cardboard', 'Metal', 'Organic', 'E-waste', 'Other'];
const ACTIONS = ['all', 'REUSE', 'PREPARE_AND_RECYCLE', 'RECYCLE', 'COMPOST', 'CHECK_LOCAL_FACILITY', 'SPECIAL_DISPOSAL', 'GENERAL_DISPOSAL'];
const CONDITIONS = ['all', 'clean', 'slightly_contaminated', 'contaminated', 'heavily_contaminated', 'damaged', 'mixed_material', 'used'];

export default function History() {
  const [analyses, setAnalyses] = useState<WasteAnalysis[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('all');
  const [action, setAction] = useState('all');
  const [condition, setCondition] = useState('all');
  const [selected, setSelected] = useState<WasteAnalysis | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAnalyses({ search, material, action, condition, page })
      .then(res => {
        setAnalyses(res.analyses);
        setTotal(res.total);
        setPages(res.pages);
      })
      .catch(e => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [search, material, action, condition, page]);

  useEffect(() => { setPage(1); }, [search, material, action, condition]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      toast.success('Analysis deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const actionBadgeClass: Record<string, string> = {
    REUSE: 'badge-emerald',
    PREPARE_AND_RECYCLE: 'badge-blue',
    RECYCLE: 'badge-teal',
    COMPOST: 'badge-amber',
    CHECK_LOCAL_FACILITY: 'badge-orange',
    SPECIAL_DISPOSAL: 'badge-red',
    GENERAL_DISPOSAL: 'badge-gray',
  };

  const condBadgeClass: Record<string, string> = {
    clean: 'badge-emerald',
    slightly_contaminated: 'badge-amber',
    contaminated: 'badge-red',
    heavily_contaminated: 'badge-red',
    damaged: 'badge-red',
    mixed_material: 'badge-purple',
    used: 'badge-gray',
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">Analysis History</h1>
            <p className="text-[var(--color-text-muted)] text-sm">{total > 0 ? `${total} analysis records` : 'No records yet'}</p>
          </div>
          <Link to="/analyze" className="btn btn-primary animate-pulse-glow text-sm py-2">
            <Scan className="w-4 h-4" />
            Analyze Waste
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search by object or material..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-emerald-100 transition-colors"
              />
            </div>
            {/* Material */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
              <select
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="border border-[var(--color-border)] rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              >
                {MATERIALS.map(m => (
                  <option key={m} value={m}>{m === 'all' ? 'All Materials' : m}</option>
                ))}
              </select>
            </div>
            {/* Action */}
            <select
              value={action}
              onChange={e => setAction(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
            >
              {ACTIONS.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All Actions' : ACTION_LABELS[a as keyof typeof ACTION_LABELS] || a}</option>
              ))}
            </select>
            {/* Condition */}
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Conditions' : CONDITION_LABELS[c as keyof typeof CONDITION_LABELS] || c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={<Search className="w-7 h-7" />}
            title="No analyses found"
            description={
              search || material !== 'all' || action !== 'all' || condition !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Start by analyzing your first waste item.'
            }
            action={
              <Link to="/analyze" className="btn btn-primary animate-pulse-glow">
                <Scan className="w-4 h-4" />
                Analyze Waste
              </Link>
            }
          />
        ) : (
          <>
            {/* Table */}
            <div className="card overflow-hidden mb-5">
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Material</th>
                      <th>Condition</th>
                      <th>Recommendation</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map(a => (
                      <tr
                        key={a._id}
                        onClick={() => setSelected(a)}
                        className="cursor-pointer"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[rgba(16,185,129,0.05)] flex-shrink-0 flex items-center justify-center text-xl">
                              {a.imageUrl
                                ? <img src={a.imageUrl} alt={a.objectName} className="w-full h-full object-cover" />
                                : ACTION_EMOJI[a.recommendedAction]
                              }
                            </div>
                            <div>
                              <div className="font-medium text-[var(--color-text)] text-sm">{a.objectName}</div>
                              {a.isDemo && <span className="text-[10px] text-purple-500 font-medium">Demo</span>}
                            </div>
                          </div>
                        </td>
                        <td className="text-[var(--color-text-muted)] text-xs">{a.material}</td>
                        <td>
                          <span className={`badge text-xs ${condBadgeClass[a.condition] || 'badge-gray'}`}>
                            {CONDITION_LABELS[a.condition]}
                          </span>
                        </td>
                        <td>
                          <span className={`badge text-xs ${actionBadgeClass[a.recommendedAction] || 'badge-gray'}`}>
                            {ACTION_LABELS[a.recommendedAction]}
                          </span>
                        </td>
                        <td className="text-[var(--color-text-muted)] text-xs whitespace-nowrap">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => a._id && handleDelete(a._id, e)}
                            disabled={deleting === a._id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost py-2 px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-[var(--color-text-muted)]">
                  Page {page} of {pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="btn btn-ghost py-2 px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selected && <AnalysisModal analysis={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
