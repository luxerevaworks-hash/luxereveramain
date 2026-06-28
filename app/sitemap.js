import { getAdminDb } from "@/lib/firebaseAdmin";

const STATIC_PATHS = ["", "/products", "/about-us", "/contact", "/faq", "/blogs", "/terms-and-conditions"];

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const entries = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  try {
    const adminDb = getAdminDb();
    const [productsSnap, blogsSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("blogs").get(),
    ]);

    productsSnap.forEach((doc) => {
      entries.push({
        url: `${siteUrl}/products/${doc.id}`,
        lastModified: doc.data().createdAt?.toDate?.() || new Date(),
      });
    });

    blogsSnap.forEach((doc) => {
      entries.push({
        url: `${siteUrl}/blogs/${doc.id}`,
        lastModified: doc.data().createdAt?.toDate?.() || new Date(),
      });
    });
  } catch (err) {
    console.error("sitemap generation error:", err);
  }

  return entries;
}
