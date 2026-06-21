/**
 * Imports products from the Wix catalog export (scripts/catalog_products.csv)
 * into Firestore using the Admin SDK.
 *
 * Run with: npm run seed:catalog
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local
 *
 * Safe to re-run: each product is keyed by its original Wix handle (a stable
 * UUID), so re-running this script updates existing docs instead of duplicating them.
 */
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const CSV_PATH = path.join(__dirname, "catalog_products.csv");
const DEFAULT_STOCK = 20; // Wix export only has an IN_STOCK flag, not a quantity.

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // skip
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function htmlToText(html) {
  return html
    .replace(/<li>/gi, " • ")
    .replace(/<\/li>/gi, "")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s*•\s*/g, " • ")
    .replace(/^\s*•\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^levate /, "Elevate "); // source typo: "levate your accessory game..."
}

function inferCategory(p) {
  const cat = p.primaryCategorySlug || p.categorySlugs;
  if (cat) return cat;
  if (/ring/i.test(p.name)) return "rings";
  return "uncategorized";
}

function toImageUrl(filename) {
  return `https://static.wixstatic.com/media/${filename}`;
}

function readCatalog() {
  const raw = fs.readFileSync(CSV_PATH, "utf8").replace(/^﻿/, "");
  const rows = parseCSV(raw);
  const header = rows[0];
  const idx = (name) => header.indexOf(name);

  const products = [];
  let current = null;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row.length || (row.length === 1 && row[0] === "")) continue;
    const fieldType = row[idx("fieldType")];
    if (fieldType === "PRODUCT") {
      current = {
        handle: row[idx("handle")],
        name: row[idx("name")],
        description: row[idx("plainDescription")],
        categorySlugs: row[idx("categorySlugs")],
        primaryCategorySlug: row[idx("primaryCategorySlug")],
        ribbon: row[idx("ribbon")],
        price: row[idx("price")],
        strikethroughPrice: row[idx("strikethroughPrice")],
        sku: row[idx("sku")],
        media: [],
      };
      products.push(current);
    } else if (fieldType === "MEDIA" && current) {
      current.media.push(row[idx("media")]);
    }
  }
  return products;
}

function toFirestoreProduct(p) {
  const images = p.media
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(toImageUrl);

  const payload = {
    name: p.name,
    category: inferCategory(p),
    sku: p.sku,
    status: "active",
    price: Math.round(parseFloat(p.price) * 100),
    stock: DEFAULT_STOCK,
    lowStockThreshold: 5,
    description: htmlToText(p.description),
    featured: p.ribbon === "Best Seller",
    images,
    videos: [],
    variants: [],
  };

  if (p.strikethroughPrice) {
    payload.originalPrice = Math.round(parseFloat(p.strikethroughPrice) * 100);
  }

  return payload;
}

async function seed() {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
  const db = getFirestore(app);

  const products = readCatalog();
  console.log(`Importing ${products.length} products from catalog...`);

  for (const p of products) {
    const docId = p.handle.replace(/^Product_/, "");
    const payload = toFirestoreProduct(p);
    await db
      .collection("products")
      .doc(docId)
      .set({ ...payload, createdAt: FieldValue.serverTimestamp() }, { merge: true });
    console.log(`Added: ${payload.name} (${payload.sku})`);
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
