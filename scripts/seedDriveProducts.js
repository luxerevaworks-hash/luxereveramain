/**
 * Adds the product collections supplied through Google Drive to Firestore.
 *
 * Run with: npm run seed:drive-products
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and
 * FIREBASE_PRIVATE_KEY in .env.local.
 *
 * The stable document IDs make this safe to run again: it updates the same
 * products instead of creating duplicates.
 */
require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    });

const db = getFirestore(app);

const products = [
  {
    id: "crystal-huggie-pendant-set",
    name: "Crystal Huggie & Pendant Set",
    category: "earrings",
    sku: "LX-CHR-001",
    status: "active",
    price: 199900,
    stock: 20,
    lowStockThreshold: 5,
    rating: null,
    reviewCount: null,
    badges: ["new"],
    featured: true,
    description:
      "A graceful matching set featuring polished gold-tone huggie hoops and a fine pendant necklace, each finished with a luminous solitaire-style crystal. An effortless choice for everyday elegance, thoughtful gifting, and softly elevated occasion wear.",
    videos: [],
    variants: [],
  },
  {
    id: "heart-link-pendant-necklace",
    name: "Heart Link Pendant Necklace",
    category: "necklaces",
    sku: "LX-HRT-001",
    status: "active",
    price: 149900,
    stock: 25,
    lowStockThreshold: 5,
    rating: null,
    reviewCount: null,
    badges: ["new"],
    featured: true,
    description:
      "A modern gold-tone link necklace with a sculpted heart pendant and a delicate draped-chain detail. Its mix of smooth and elongated links gives this romantic piece a refined, contemporary finish that layers beautifully or stands confidently on its own.",
    videos: [],
    variants: [],
  },
];

async function seed() {
  for (const { id, ...product } of products) {
    await db.collection("products").doc(id).set(
      {
        ...product,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Added: ${product.name}`);
  }
  console.log("Google Drive products imported.");
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
