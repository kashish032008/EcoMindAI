import { type ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(16,185,129,0.05)] flex items-center justify-center mb-4 text-[var(--color-primary-light)]">
        {icon || <Search className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{title}</h3>
      {description && <p className="text-[var(--color-text-muted)] text-sm max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}
