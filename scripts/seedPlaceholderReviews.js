/**
 * Adds one clearly-labeled placeholder review to every product that has none yet.
 * These are NOT fabricated customer testimonials — they're flagged as samples so
 * the storefront isn't empty, with a note for the store owner to swap them for
 * real customer reviews via /admin/reviews.
 *
 * Run with: node scripts/seedPlaceholderReviews.js
 */
require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app);

async function main() {
  const productsSnap = await db.collection("products").get();
  console.log(`Checking ${productsSnap.size} products...`);

  for (const productDoc of productsSnap.docs) {
    const reviewsSnap = await db
      .collection("products")
      .doc(productDoc.id)
      .collection("reviews")
      .limit(1)
      .get();

    if (!reviewsSnap.empty) continue;

    await db.collection("products").doc(productDoc.id).collection("reviews").add({
      name: "Luxereva Team",
      rating: 5,
      text: "Sample review — replace with real customer feedback via the admin Reviews page once orders come in.",
      photo: "",
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`Seeded placeholder review for: ${productDoc.data().name}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
