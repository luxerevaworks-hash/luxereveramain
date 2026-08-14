import { getAdminDb } from "@/lib/firebaseAdmin";

import { getProductSlug } from "@/lib/productUrl";

const STATIC_PAGES = [
  ["", 1],
  ["/products", 0.9],
  ["/about-us", 0.6],
  ["/contact", 0.6],
  ["/faq", 0.5],
  ["/blogs", 0.8],
  ["/reviews", 0.5],
  ["/notifications", 0.3],
  ["/terms-and-conditions", 0.3],
  ["/privacy-policy", 0.3],
  ["/shipping-policy", 0.3],
  ["/refund-returns-policy", 0.3],
];

export default async function sitemap() {
  const siteUrl = (process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com").replace(/\/$/, "");
  const entries = STATIC_PAGES.map(([path, priority]) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));

  try {
    const adminDb = getAdminDb();
    const [productsSnap, blogsSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("blogs").get(),
    ]);

    productsSnap.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      if (product.status && product.status !== "active") return;
      entries.push({
        url: `${siteUrl}/products/${encodeURIComponent(getProductSlug(product))}`,
        lastModified: product.updatedAt?.toDate?.() || product.createdAt?.toDate?.() || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    blogsSnap.forEach((doc) => {
      entries.push({
        url: `${siteUrl}/blogs/${doc.id}`,
        lastModified: doc.data().updatedAt?.toDate?.() || doc.data().createdAt?.toDate?.() || new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  } catch (err) {
    console.error("sitemap generation error:", err);
  }

  return entries;
}
