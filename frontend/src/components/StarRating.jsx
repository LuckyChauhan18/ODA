import { HiStar, HiOutlineStar } from 'react-icons/hi';

export default function StarRating({ rating = 0, onRate, size = 'md', showCount, count }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  const interactive = typeof onRate === 'function';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} transition-transform duration-150`}
          disabled={!interactive}
        >
          {star <= rating ? (
            <HiStar className={`${sizeClass} text-yellow-400`} />
          ) : (
            <HiOutlineStar className={`${sizeClass} text-surface-4`} />
          )}
        </button>
      ))}
      {showCount && count !== undefined && (
        <span className="text-sm text-text-muted ml-1">({count})</span>
      )}
    </div>
  );
}
