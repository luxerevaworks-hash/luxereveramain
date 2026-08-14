/**
 * Adds stable, unique, name-based slugs to existing Firestore products.
 * Run once after deploying: node scripts/migrateProductSlugs.js
 */
require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function slugify(value = "") {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function run() {
  const app = initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }) });
  const db = getFirestore(app);
  const snap = await db.collection("products").get();
  const used = new Set();
  const updates = [];

  for (const doc of snap.docs) {
    const product = doc.data();
    const base = slugify(product.name) || `product-${doc.id}`;
    let slug = product.slug || base;
    let suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    used.add(slug);
    if (product.slug !== slug) updates.push({ ref: doc.ref, slug });
  }

  const updateCount = updates.length;
  while (updates.length) {
    const batch = db.batch();
    updates.splice(0, 400).forEach(({ ref, slug }) => batch.update(ref, { slug }));
    await batch.commit();
  }
  console.log(`Product slug migration complete. Updated ${updateCount} products.`);
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
