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
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      {soldOut && (
        <span className="bg-rosewood text-cream text-[9px] font-semibold uppercase tracking-widest2 px-2.5 py-1 rounded-full shadow-sm">
          Sold Out
        </span>
      )}
      {discountPercent > 0 && (
        <span className="bg-red-600 text-white text-[9px] font-semibold uppercase tracking-widest2 px-2.5 py-1 rounded-full shadow-sm">
          {discountPercent}% Off
        </span>
      )}
      {badges.map((badge) => (
        <span
          key={badge.key}
          className={`${badge.className} text-white text-[9px] font-semibold uppercase tracking-widest2 px-2.5 py-1 rounded-full shadow-sm`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export { BADGE_OPTIONS };
