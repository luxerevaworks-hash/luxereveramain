import { redirect } from "next/navigation";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getProductSlug } from "@/lib/productUrl";

const siteUrl = (process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com").replace(/\/$/, "");

function toJsonLd(data) {
  // Prevent product text from ever closing the script element.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function productSchema(product) {
  const slug = getProductSlug(product);
  const url = `${siteUrl}/products/${encodeURIComponent(slug)}`;
  const price = Number(product.price);
  const inStock = product.status !== "inactive" && product.status !== "draft" && (product.stock === undefined || product.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    image: product.images?.filter(Boolean) || undefined,
    description: product.description || `${product.name} by Luxereva.`,
    sku: product.sku || undefined,
    category: product.category ? `${product.category.charAt(0).toUpperCase()}${product.category.slice(1)}` : undefined,
    brand: { "@type": "Brand", name: "Luxereva" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      // Prices in Firestore are stored in paise; Schema requires rupees.
      price: Number.isFinite(price) ? (price / 100).toFixed(2) : undefined,
      availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Luxereva", url: siteUrl },
    },
  };
}

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
  return (
    <>
      {children}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(productSchema(product)) }}
        />
      )}
    </>
  );
}
