export function Spinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClass} rounded-full border-2 border-surface-4 border-t-primary animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-surface-4 border-t-primary animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="aspect-square animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded-full animate-shimmer" />
        <div className="h-4 w-full rounded-full animate-shimmer" />
        <div className="h-4 w-3/4 rounded-full animate-shimmer" />
        <div className="h-3 w-20 rounded-full animate-shimmer" />
        <div className="h-5 w-24 rounded-full animate-shimmer" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
