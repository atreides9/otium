'use client'

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  size?: number
}

export default function StarRating({ rating, onRatingChange, size = 32 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = rating >= star
        const half = !full && rating >= star - 0.5
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            {/* Empty star */}
            <button
              type="button"
              onClick={() => onRatingChange(star)}
              className="absolute inset-0 flex items-center justify-center"
              aria-label={`${star}점`}
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
                  fill={full || half ? '#C47D2E' : '#D4CAC2'}
                  stroke={full || half ? '#C47D2E' : '#D4CAC2'}
                  strokeWidth="1"
                />
                {half && (
                  <clipPath id={`half-${star}`}>
                    <rect x="0" y="0" width="12" height="24" />
                  </clipPath>
                )}
              </svg>
              {half && (
                <svg
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                  className="absolute inset-0"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                >
                  <path
                    d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
                    fill="#C47D2E"
                    stroke="#C47D2E"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </button>
            {/* Half star click zone (left half) */}
            <button
              type="button"
              onClick={() => onRatingChange(star - 0.5)}
              className="absolute left-0 top-0 bottom-0"
              style={{ width: size / 2 }}
              aria-label={`${star - 0.5}점`}
            />
          </div>
        )
      })}
      <span className="ml-2 text-[16px] font-semibold text-[#3D2C24] self-center">
        {rating > 0 ? rating.toFixed(1) : '—'}
      </span>
    </div>
  )
}
