export default function robots() {
  const siteUrl = (process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
