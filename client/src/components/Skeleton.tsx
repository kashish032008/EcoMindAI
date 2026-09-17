interface Props {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 animate-pulse ${className}`}>
      <div className="flex gap-4">
        <div className="skeleton w-20 h-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ rows = 3, cols = 2, className = '' }: Props) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} ${className}`}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded mb-1" />
      <div className="skeleton h-2 w-20 rounded" />
    </div>
  );
}
