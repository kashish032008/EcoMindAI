import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Leaf, Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home', exact: true },
    { to: '/analyze', label: 'Analyze Waste' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/history', label: 'History' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#09090b] border-b border-[rgba(255,255,255,0.08)] ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center  group-hover:shadow-md transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg gradient-text">EcoMind AI</span>
              <div className="text-[10px] text-[var(--color-text-muted)] leading-none hidden sm:block">Waste Intelligence</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/analyze" className="btn btn-primary animate-pulse-glow text-sm py-2 px-4">
              <Zap className="w-4 h-4" />
              Analyze Waste
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.08)] bg-[#09090b] animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isActive ? 'text-[var(--color-primary)] bg-[rgba(16,185,129,0.1)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[rgba(16,185,129,0.1)]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <Link
                to="/analyze"
                onClick={() => setOpen(false)}
                className="btn btn-primary animate-pulse-glow w-full justify-center mt-1"
              >
                <Zap className="w-4 h-4" />
                Analyze Waste
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
