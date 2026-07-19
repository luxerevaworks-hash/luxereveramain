/**
 * Uploads the new-arrival necklace/set photos (Drive folders LUX1001-LUX1008,
 * downloaded locally under DRIVE_ROOT below), converts each to WebP under
 * MAX_BYTES, uploads to Firebase Storage, and creates/updates the matching
 * Firestore product docs using the Jewelry_Product_Catalog + Pricing_Sheet data.
 *
 * The first image listed per product is the plain white-background shot,
 * per Madan's instruction to keep the white image first for these new arrivals.
 *
 * Run with: node scripts/seedNecklaces.js
 * Requires the same .env.local Firebase Admin credentials as seedCatalog.js.
 */
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const MAX_BYTES = 100 * 1024;
const WIDTHS = [1600, 1200, 1000, 800, 600, 400];
const QUALITIES = [80, 70, 60, 50, 40, 30];

const DRIVE_ROOT = "C:/Users/khushi mishra/Downloads/Necklaces/Necklaces";

const PRODUCTS = [
  {
    id: "celeste-moon-layered-necklace",
    sku: "LX001",
    name: "Celeste Moon Layered Necklace",
    category: "necklaces",
    price: 999,
    originalPrice: 2099,
    description:
      "Inspired by celestial beauty, the Celeste Moon Layered Necklace features delicate layered chains with an elegant crescent moon charm that adds a dreamy, sophisticated touch. Crafted from premium stainless steel with a luxurious 18K gold-plated finish, this necklace is lightweight, anti-tarnish, and designed for everyday elegance. Whether worn solo or layered with your favorite pieces, it effortlessly elevates any outfit. Comes with a 1 Year Warranty.",
    folder: "LUX1001",
    files: [7, 1, 2, 3, 4, 5, 6].map((n) => `18K_Gold_Plated_Necklace (${n}).png`),
  },
  {
    id: "pearl-bloom-butterfly-necklace",
    sku: "LX002",
    name: "Pearl Bloom Butterfly Necklace",
    category: "necklaces",
    price: 999,
    originalPrice: 2049,
    description:
      "Graceful pearls meet a sparkling butterfly charm in the Pearl Bloom Butterfly Necklace, creating a delicate piece that symbolizes beauty and transformation. Made from premium stainless steel with radiant 18K gold plating, this necklace offers exceptional durability while remaining lightweight and comfortable. Its timeless design makes it perfect for both casual and special occasions. Includes a 1 Year Warranty.",
    folder: "LUX1002",
    files: [8, 1, 2, 3, 4, 5, 6, 7].map((n) => `18K_Gold_Plated_Necklace (${n}).png`),
  },
  {
    id: "eterna-heart-charm-necklace",
    sku: "LX003",
    name: "Eterna Heart Charm Necklace",
    category: "necklaces",
    price: 699,
    originalPrice: 1099,
    description:
      "Celebrate everlasting love with the Eterna Heart Charm Necklace. Featuring a sleek heart pendant suspended from a modern gold chain, this elegant design blends minimalism with romance. Crafted from high-quality stainless steel and finished in luxurious 18K gold plating, it is anti-tarnish, lightweight, and made for daily wear. A timeless piece you'll treasure for years. Backed by a 1 Year Warranty.",
    folder: "LUX1003",
    files: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `18K_Gold_Plated_Necklace (${n}).png`),
  },
  {
    id: "aurelia-heart-drop-necklace",
    sku: "LX004",
    name: "Aurelia Heart Drop Necklace",
    category: "necklaces",
    price: 999,
    originalPrice: 1949,
    description:
      "Elegant and effortlessly chic, the Aurelia Heart Drop Necklace showcases a delicate heart pendant with a graceful drop-chain silhouette. Its refined design adds subtle sophistication to both everyday and evening looks. Crafted from premium stainless steel with brilliant 18K gold plating, this necklace is lightweight, anti-tarnish, and built to last. Includes a 1 Year Warranty.",
    folder: "LUX1004",
    files: [4, 1, 2, 3, 5].map((n) => `18K_Gold_Plated_Necklace (${n}).png`),
  },
  {
    id: "sylvara-floral-charm-set",
    sku: "LX005",
    name: "Sylvara Floral Charm Set",
    category: "necklaces",
    price: 1099,
    originalPrice: 2249,
    description:
      "Inspired by blooming flowers, the Sylvara Floral Charm Set features a beautifully coordinated necklace and bracelet adorned with sparkling floral motifs. Crafted from premium stainless steel with radiant 18K gold plating, this elegant set combines femininity with everyday durability. Lightweight, anti-tarnish, and comfortable to wear, it's perfect for gifting or elevating your personal collection. Comes with a 1 Year Warranty.",
    folder: "LUX1005",
    files: [
      "18K_Gold_Plated_Necklace (1).png",
      "18K_Gold_Plated_Bracelet (2).png",
      "18K_Gold_Plated_Necklace (3).png",
      "18K_Gold_Plated_Bracelet (4).png",
      "18K_Gold_Plated_Necklace (5).png",
      "18K_Gold_Plated_Bracelet (6).png",
    ],
  },
  {
    id: "zenovia-celestial-glow-set",
    sku: "LX006",
    name: "Zenovia Celestial Glow Set",
    category: "necklaces",
    price: 1049,
    originalPrice: 2249,
    description:
      "The Zenovia Celestial Glow Set captures modern elegance with its layered necklace and matching bracelet accented by delicate golden details. Designed for effortless sophistication, this coordinated set is crafted from premium stainless steel and finished with luxurious 18K gold plating for long-lasting shine. Lightweight, anti-tarnish, and versatile enough for every occasion. Protected by a 1 Year Warranty.",
    folder: "LUX1006",
    files: [
      "18K_Gold_Plated_Necklace (1).png",
      "18K_Gold_Plated_Bracelet (2).png",
      "18K_Gold_Plated_Bracelet (3).png",
      "18K_Gold_Plated_Necklace (2).png",
      "18K_Gold_Plated_Necklace (3).png",
      "18K_Gold_Plated_Necklace (4).png",
      "18K_Gold_Plated_Necklace (5).png",
    ],
  },
  {
    id: "lumina-crystal-heart-collection",
    sku: "LX007",
    name: "Lumina Crystal Heart Collection",
    category: "necklaces",
    price: 599,
    originalPrice: 1099,
    description:
      "Add a subtle sparkle to your everyday style with the Lumina Crystal Heart Collection. Featuring elegant crystal heart accents across its coordinated pieces, this set beautifully balances modern minimalism with timeless charm. Crafted from premium stainless steel and finished with radiant 18K gold plating, it is lightweight, anti-tarnish, and designed for lasting brilliance. Includes a 1 Year Warranty.",
    folder: "LUX1007",
    files: [2, 1, 3, 4, 5, 6, 7, 8, 9].map((n) => `Luxereva_Jewelry (${n}).png`),
  },
  {
    id: "eterna-solitaire-set",
    sku: "LX008",
    name: "Eterna Solitaire Set",
    category: "necklaces",
    price: 599,
    originalPrice: 1099,
    description:
      "Timeless elegance meets modern simplicity in the Eterna Solitaire Set. Featuring brilliant solitaire stones paired with sleek gold detailing, this coordinated set is designed to shine on every occasion. Crafted from premium stainless steel with a luxurious 18K gold-plated finish, it offers exceptional durability, lightweight comfort, and anti-tarnish protection. Backed by a 1 Year Warranty.",
    folder: "LUX1008",
    files: [1, 2, 3, 4, 5, 6].map((n) => `Luxereva_Jewelry (${n}).png`),
  },
];

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

async function toWebpUnderLimit(inputBuffer) {
  for (const width of WIDTHS) {
    for (const quality of QUALITIES) {
      const out = await sharp(inputBuffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      if (out.length <= MAX_BYTES) {
        return { buffer: out, width, quality };
      }
    }
  }
  const out = await sharp(inputBuffer)
    .resize({ width: WIDTHS[WIDTHS.length - 1], withoutEnlargement: true })
    .webp({ quality: QUALITIES[QUALITIES.length - 1] })
    .toBuffer();
  return { buffer: out, width: WIDTHS[WIDTHS.length - 1], quality: QUALITIES[QUALITIES.length - 1] };
}

async function uploadWebp(buffer, destPath) {
  const token = crypto.randomUUID();
  const file = bucket.file(destPath);
  await file.save(buffer, {
    contentType: "image/webp",
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });
  const encodedPath = encodeURIComponent(destPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
}

async function main() {
  for (const p of PRODUCTS) {
    console.log(`\n${p.name} (${p.sku})`);
    const urls = [];

    for (let i = 0; i < p.files.length; i++) {
      const filePath = path.join(DRIVE_ROOT, p.folder, p.files[i]);
      const original = fs.readFileSync(filePath);
      const { buffer, width, quality } = await toWebpUnderLimit(original);
      const destPath = `products/${p.id}/${i}.webp`;
      const url = await uploadWebp(buffer, destPath);
      urls.push(url);
      console.log(
        `  [${i}] ${p.files[i]} ${(original.length / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB (w=${width}, q=${quality})`
      );
    }

    const payload = {
      name: p.name,
      category: p.category,
      sku: p.sku,
      status: "active",
      price: Math.round(p.price * 100),
      originalPrice: Math.round(p.originalPrice * 100),
      stock: 20,
      lowStockThreshold: 5,
      description: p.description,
      badges: ["new"],
      images: urls,
      videos: [],
      variants: [],
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db
      .collection("products")
      .doc(p.id)
      .set({ ...payload, createdAt: FieldValue.serverTimestamp() }, { merge: true });
    console.log(`  -> saved as products/${p.id}`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
