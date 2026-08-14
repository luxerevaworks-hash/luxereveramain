import { redirect } from "next/navigation";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getProductSlug } from "@/lib/productUrl";

const siteUrl = (process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com").replace(/\/$/, "");

async function findProduct(identifier) {
  const db = getAdminDb();
  const byId = await db.collection("products").doc(identifier).get();
  if (byId.exists) return { id: byId.id, ...byId.data() };

  const bySlug = await db.collection("products").where("slug", "==", identifier).limit(1).get();
  if (!bySlug.empty) return { id: bySlug.docs[0].id, ...bySlug.docs[0].data() };

  // Supports old records until the one-time slug migration has been run.
  const all = await db.collection("products").get();
  const match = all.docs.find((doc) => getProductSlug({ id: doc.id, ...doc.data() }) === identifier);
  return match ? { id: match.id, ...match.data() } : null;
}

export async function generateMetadata({ params }) {
  const product = await findProduct(params.id).catch(() => null);
  const slug = product ? getProductSlug(product) : params.id;
  const canonical = `${siteUrl}/products/${encodeURIComponent(slug)}`;

  return {
    title: product?.name || "Product",
    description: product?.description || "Shop jewellery at Luxereva.",
    alternates: { canonical },
    openGraph: product ? { title: product.name, description: product.description, images: product.images?.[0] ? [product.images[0]] : [] } : undefined,
  };
}

export default async function ProductLayout({ children, params }) {
  const product = await findProduct(params.id).catch(() => null);
  if (product) {
    const canonicalSlug = getProductSlug(product);
    if (params.id !== canonicalSlug) redirect(`/products/${encodeURIComponent(canonicalSlug)}`);
  }
  return children;
}
