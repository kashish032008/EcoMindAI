import { Link } from 'react-router-dom';
import { Camera, Cpu, Search, CheckCircle, ArrowRight, Zap } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Camera,
    title: 'Detect',
    description: 'Upload a photo of any waste item. The AI instantly detects the object from the image — whether it\'s a bottle, a battery, cardboard, or food scraps.',
    color: 'text-[var(--color-primary)]',
    bg: 'bg-[rgba(16,185,129,0.05)]',
    border: 'border-[var(--color-border)]',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Identify',
    description: 'The system identifies the material composition — plastic (PET, HDPE, LDPE), glass, metal, paper, organic, or e-waste — and assigns a material code.',
    color: 'text-[var(--color-accent)]',
    bg: 'bg-[rgba(6,182,212,0.1)]',
    border: 'border-teal-200',
  },
  {
    number: '03',
    icon: Search,
    title: 'Analyse',
    description: 'AI analyses the condition (clean, contaminated, damaged), estimates contamination level, and evaluates whether the item is suitable for reuse or recycling.',
    color: 'text-[#60a5fa]',
    bg: 'bg-[rgba(59,130,246,0.1)]',
    border: 'border-blue-200',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Decide',
    description: 'The decision engine applies a priority-based logic: Reuse → Recycle → Compost → Special Disposal. It outputs the optimal next action with a full explanation.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
];

const FLOW_NODES = [
  'Camera / Image',
  'AI Detection',
  'Material Analysis',
  'Condition Analysis',
  'Decision Engine',
  'Recommendation',
];

const EXAMPLES = [
  { emoji: '🍶', object: 'Plastic Bottle', material: 'PET (#1)', condition: 'Slightly contaminated', action: 'Prepare & Recycle', actionClass: 'badge-blue' },
  { emoji: '🫙', object: 'Glass Jar', material: 'Glass', condition: 'Clean', action: 'Reuse', actionClass: 'badge-emerald' },
  { emoji: '📦', object: 'Cardboard Box', material: 'Cardboard', condition: 'Clean', action: 'Recycle', actionClass: 'badge-teal' },
  { emoji: '🔋', object: 'Used Battery', material: 'E-waste', condition: 'Damaged', action: 'Special Disposal', actionClass: 'badge-red' },
  { emoji: '🍂', object: 'Food Waste', material: 'Organic', condition: 'Fresh', action: 'Compost', actionClass: 'badge-amber' },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-bg-subtle py-16 px-4 text-center border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-full text-sm text-[var(--color-primary)] font-medium mb-6 ">
            <Zap className="w-4 h-4" />
            How It Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-4">
            From Image to <span className="gradient-text">Intelligent Action</span>
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
            EcoMind AI follows a structured four-step process to turn a single photo into a
            clear, actionable waste management recommendation.
          </p>
        </div>
      </section>

      {/* Process Flow Diagram */}
      <section className="py-12 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl font-semibold text-[var(--color-text)] mb-8">The Analysis Pipeline</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FLOW_NODES.map((node, i) => (
              <span key={node} className="flex items-center gap-2">
                <span className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-primary)]  whitespace-nowrap">
                  {node}
                </span>
                {i < FLOW_NODES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Steps */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 border-l-4 ${step.border} animate-fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex-shrink-0 flex sm:flex-col items-center gap-4 sm:gap-2">
                  <div className="text-5xl font-black text-[var(--color-text-muted)]">{step.number}</div>
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-3 ${step.color}`}>{step.title}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decision Priority */}
      <section className="py-16 px-4 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-text)] text-center mb-3">Decision Priority Logic</h2>
          <p className="text-[var(--color-text-muted)] text-center mb-10 max-w-lg mx-auto">
            The decision engine follows this priority order to determine the most sustainable action:
          </p>
          <div className="space-y-3">
            {[
              { priority: '1st', label: 'REUSE', desc: 'Item is reusable and in good condition', color: 'action-REUSE' },
              { priority: '2nd', label: 'PREPARE & RECYCLE', desc: 'Recyclable but contaminated — needs preparation', color: 'action-PREPARE_AND_RECYCLE' },
              { priority: '3rd', label: 'RECYCLE', desc: 'Recyclable and suitable for direct recycling', color: 'action-RECYCLE' },
              { priority: '4th', label: 'COMPOST', desc: 'Organic material that can be composted', color: 'action-COMPOST' },
              { priority: '5th', label: 'SPECIAL DISPOSAL', desc: 'Hazardous or electronic waste requiring specialist facility', color: 'action-SPECIAL_DISPOSAL' },
              { priority: '6th', label: 'GENERAL DISPOSAL', desc: 'Does not meet criteria for any of the above', color: 'action-GENERAL_DISPOSAL' },
            ].map(d => (
              <div key={d.label} className={`flex items-center gap-4 p-4 rounded-xl border-2 ${d.color}`}>
                <span className="text-xs font-bold opacity-60 w-8">{d.priority}</span>
                <span className="font-bold text-sm">{d.label}</span>
                <span className="text-sm opacity-70 hidden sm:block">— {d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Analyses */}
      <section className="py-20 px-4 bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-text)] text-center mb-3">Sample Analyses</h2>
          <p className="text-[var(--color-text-muted)] text-center mb-10">See how EcoMind AI handles common waste items.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXAMPLES.map(ex => (
              <div key={ex.object} className="card card-lift p-5">
                <div className="text-4xl mb-3">{ex.emoji}</div>
                <h3 className="font-bold text-[var(--color-text)] mb-1">{ex.object}</h3>
                <div className="text-sm text-[var(--color-text-muted)] mb-1">{ex.material}</div>
                <div className="text-xs text-[var(--color-text-muted)] mb-3">Condition: {ex.condition}</div>
                <span className={`badge ${ex.actionClass}`}>{ex.action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Mode Notice */}
      <section className="py-12 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto card p-6 bg-amber-50 border-amber-100">
          <h3 className="font-semibold text-amber-800 mb-2">⚠️ About AI Accuracy</h3>
          <p className="text-amber-700 text-sm leading-relaxed">
            AI recommendations are informational and may vary according to local recycling guidelines
            and facility capabilities. EcoMind AI is designed to support waste management decisions —
            not replace local authority guidance. Always verify recommendations with your local recycling facility.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center gradient-bg-subtle border-t border-[var(--color-border)]">
        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">Ready to try it?</h2>
        <p className="text-[var(--color-text-muted)] mb-7">Upload any waste item and get an instant AI-powered recommendation.</p>
        <Link to="/analyze" className="btn btn-primary animate-pulse-glow text-base px-10 py-3">
          <Zap className="w-5 h-5" />
          Analyze Waste Now
        </Link>
      </section>
    </div>
  );
}
