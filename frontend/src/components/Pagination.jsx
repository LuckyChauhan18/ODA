import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < pages - 1) range.push('...');
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg bg-surface-3 border border-glass-border text-text-secondary
                   hover:text-text hover:bg-glass-hover disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 cursor-pointer"
      >
        <HiChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((num, i) =>
        num === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-text-muted">...</span>
        ) : (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
              ${num === page
                ? 'text-white shadow-lg shadow-primary/30'
                : 'bg-surface-3 border border-glass-border text-text-secondary hover:text-text hover:bg-glass-hover'
              }`}
            style={num === page ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))' } : {}}
          >
            {num}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="p-2 rounded-lg bg-surface-3 border border-glass-border text-text-secondary
                   hover:text-text hover:bg-glass-hover disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 cursor-pointer"
      >
        <HiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
