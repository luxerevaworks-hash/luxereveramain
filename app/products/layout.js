const siteUrl = (process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com").replace(/\/$/, "");

// Filter/search URLs render the same shop page.  Keep only /products as the
// indexable collection URL so query-string variations do not compete in Google.
export const metadata = {
  alternates: { canonical: `${siteUrl}/products` },
};

export default function ProductsLayout({ children }) {
  return children;
}
