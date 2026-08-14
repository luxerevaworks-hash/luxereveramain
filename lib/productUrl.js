import { slugify } from "@/lib/utils";

// The saved slug is the public, stable identifier.  Falling back to the name
// keeps links readable while older Firestore records are being migrated.
export function getProductSlug(product = {}) {
  return product.slug || slugify(product.name) || product.id;
}

export function getProductUrl(product = {}) {
  return `/products/${encodeURIComponent(getProductSlug(product))}`;
}
