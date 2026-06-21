/**
 * Seed script — adds sample products to Firestore using the Admin SDK.
 * Run with: npm run seed
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local
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

const sampleProducts = [
  {
    name: "Radiance Renewal Face Serum",
    category: "skincare",
    price: 189900, // ₹1,899.00 stored in paise
    stock: 25,
    description:
      "A lightweight, fast-absorbing serum infused with vitamin C and botanical extracts to brighten and even skin tone. Apply 2-3 drops to clean skin morning and night.",
    featured: true,
    images: [],
    variants: [
      { id: "v1", name: "30ml" },
      { id: "v2", name: "50ml" },
    ],
  },
  {
    name: "Velvet Oud Eau de Parfum",
    category: "fragrance",
    price: 349900,
    stock: 15,
    description:
      "A rich, warm fragrance blending oud, amber and rose petals for a luxurious all-day scent.",
    featured: true,
    images: [],
    variants: [
      { id: "v1", name: "50ml" },
      { id: "v2", name: "100ml" },
    ],
  },
  {
    name: "Signature Silk Pouch",
    category: "accessories",
    price: 99900,
    stock: 40,
    description:
      "A soft, durable silk pouch with the Luxereva monogram — perfect for travel or gifting.",
    featured: true,
    images: [],
    variants: [],
  },
  {
    name: "Hydra Glow Night Cream",
    category: "skincare",
    price: 229900,
    stock: 18,
    description:
      "A deeply nourishing overnight cream that restores moisture and leaves skin visibly plumper by morning.",
    featured: false,
    images: [],
    variants: [],
  },
];

async function seed() {
  console.log("Seeding products…");
  for (const product of sampleProducts) {
    await db.collection("products").add({
      ...product,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`Added: ${product.name}`);
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
