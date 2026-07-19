import { BADGE_OPTIONS, getBadgeConfig } from "@/lib/badges";

export function getDiscountPercent(product) {
  const hasDiscount = product.originalPrice > product.price;
  if (!hasDiscount) return 0;
  return Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );
}

export default function ProductBadges({ product, className = "" }) {
  const soldOut = (product.stock ?? 0) <= 0;
  const discountPercent = getDiscountPercent(product);
  const badges = (product.badges || [])
    .map((key) => getBadgeConfig(key))
    .filter(Boolean);

  if (!soldOut && !discountPercent && badges.length === 0) return null;

  return (
    <div className={`flex flex-col items-start gap-1 max-w-[80%] ${className}`}>
      {soldOut && (
        <span className="bg-rosewood text-cream text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm whitespace-nowrap leading-tight">
          Sold Out
        </span>
      )}
      {discountPercent > 0 && (
        <span className="bg-gold text-brown-dark text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm whitespace-nowrap leading-tight">
          {discountPercent}% Off
        </span>
      )}
      {badges.map((badge) => (
        <span
          key={badge.key}
          className={`${badge.className} text-white text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm whitespace-nowrap leading-tight max-w-full truncate`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export { BADGE_OPTIONS };
