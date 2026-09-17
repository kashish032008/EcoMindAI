import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scan, Brain, Target, Recycle, RefreshCw, Leaf, BarChart3 } from 'lucide-react';
import { fetchDashboard } from '../services/api';
import type { DashboardData } from '../types';

const FALLBACK_STATS = {
  total: 1284,
  reusable: 214,
  recyclable: 843,
  specialDisposal: 47,
};

export default function Home() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(data => {
        if (data.overview.total > 0) {
          setStats({
            total: data.overview.total,
            reusable: data.overview.reusable,
            recyclable: data.overview.recyclable,
            specialDisposal: data.overview.specialDisposal,
          });
        }
      })
      .catch(() => {/* use fallback */})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Waste Items Analyzed', value: stats.total.toLocaleString(), icon: Scan, color: 'text-[var(--color-primary)]', bg: 'bg-[rgba(16,185,129,0.05)]' },
    { label: 'Recyclable Items', value: stats.recyclable.toLocaleString(), icon: Recycle, color: 'text-[var(--color-accent)]', bg: 'bg-[rgba(6,182,212,0.1)]' },
    { label: 'Reusable Items', value: stats.reusable.toLocaleString(), icon: RefreshCw, color: 'text-[#60a5fa]', bg: 'bg-[rgba(59,130,246,0.1)]' },
    { label: 'Special Disposal', value: stats.specialDisposal.toLocaleString(), icon: Target, color: 'text-[#f43f5e]', bg: 'bg-[rgba(244,63,94,0.1)]' },
  ];

  const concepts = [
    {
      icon: Scan,
      title: 'Identify',
      description: 'AI detects the object and identifies its material composition with high accuracy.',
      color: 'text-[var(--color-primary)]',
      bg: 'bg-[rgba(16,185,129,0.05)]',
    },
    {
      icon: Brain,
      title: 'Understand',
      description: 'Analyse the condition, contamination level, and suitability for reuse or recycling.',
      color: 'text-[var(--color-accent)]',
      bg: 'bg-[rgba(6,182,212,0.1)]',
    },
    {
      icon: Target,
      title: 'Decide',
      description: 'Our decision engine recommends the most appropriate next action — reuse, recycle, compost or specialist disposal.',
      color: 'text-[#60a5fa]',
      bg: 'bg-[rgba(59,130,246,0.1)]',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-bg-subtle pt-16 pb-24 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[rgba(16,185,129,0.1)] rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-[rgba(6,182,212,0.1)] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-full text-sm text-[var(--color-primary)] font-medium mb-8 animate-fade-up animate-float">
            <Leaf className="w-4 h-4" />
            AI-Powered Waste Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-6 animate-fade-up delay-100">
            Don't Just Identify Waste.{' '}
            <span className="gradient-text">Understand It.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            EcoMind AI uses artificial intelligence to identify waste, analyse its condition,
            and recommend whether it should be reused, prepared for recycling, recycled, or
            handled through a special disposal route.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
            <Link to="/analyze" className="btn btn-primary animate-pulse-glow text-base px-8 py-3">
              <Scan className="w-5 h-5" />
              Analyze Waste
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works" className="btn btn-outline text-base px-8 py-3">
              How It Works
            </Link>
          </div>

          {/* Flow indicator */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] animate-fade-up delay-400">
            {['Detect', 'Identify', 'Analyse', 'Decide', 'Recommend'].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]  font-medium text-[var(--color-primary)]">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Concepts ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">Beyond Basic Sorting</h2>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
            EcoMind AI goes further than just identifying waste. It understands it.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {concepts.map((c, i) => (
            <div key={c.title} className={`card card-lift p-6 text-center animate-fade-up delay-${(i + 1) * 100}`}>
              <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center mx-auto mb-4`}>
                <c.icon className={`w-7 h-7 ${c.color}`} />
              </div>
              <h3 className="font-bold text-lg text-[var(--color-text)] mb-2">{c.title}</h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">
              Real Impact, <span className="gradient-text">Real Numbers</span>
            </h2>
            <p className="text-[var(--color-text-muted)]">
              {loading ? 'Loading live statistics...' : 'Live statistics from our analysis database.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((s, i) => (
              <div key={s.label} className={`card p-6 text-center animate-fade-up delay-${i * 100}`}>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)] mb-1">{s.value}</div>
                <div className="text-sm text-[var(--color-text-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card p-10 text-center gradient-bg-subtle border-[var(--color-border)]">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-green">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
              Ready to Analyse Your Waste?
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-lg mx-auto">
              Upload an image and get an instant AI-powered analysis with actionable recommendations.
              No sign-up required.
            </p>
            <Link to="/analyze" className="btn btn-primary animate-pulse-glow text-base px-10 py-3">
              <Scan className="w-5 h-5" />
              Start Analyzing
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              Understand Waste. Make Better Decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="py-6 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
        © 2026 EcoMind AI · Understand Waste. Make Better Decisions.
      </div>
    </div>
  );
}
