import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function RatingStars({ rating, reviewCount, className = "" }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex text-gold text-[11px] gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <FaStar key={i} />;
          if (i === full && half) return <FaStarHalfAlt key={i} />;
          return <FaRegStar key={i} />;
        })}
      </div>
      {reviewCount > 0 && (
        <span className="text-[11px] text-brown/50">({reviewCount})</span>
      )}
    </div>
  );
}
