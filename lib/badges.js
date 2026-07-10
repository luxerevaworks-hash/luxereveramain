export const BADGE_OPTIONS = [
  { key: "new", label: "New", className: "bg-emerald-600" },
  { key: "bestseller", label: "Best Seller", className: "bg-amber-600" },
  { key: "most-loved", label: "Most Loved", className: "bg-rose-600" },
  { key: "trending", label: "Trending", className: "bg-orange-600" },
  { key: "top-rated", label: "Top Rated", className: "bg-indigo-600" },
  { key: "premium", label: "Premium", className: "bg-brown-dark" },
  { key: "hot-seller", label: "Hot Seller", className: "bg-red-600" },
  { key: "customer-favorite", label: "Customer Favorite", className: "bg-pink-600" },
  { key: "limited-edition", label: "Limited Edition", className: "bg-purple-700" },
  { key: "sale", label: "Sale", className: "bg-rosewood" },
];

export function getBadgeConfig(key) {
  return BADGE_OPTIONS.find((b) => b.key === key) || null;
}
