/**
 * Downloads each product's images (currently hotlinked from Wix's CDN),
 * converts them to WebP under MAX_BYTES, re-uploads them to Firebase
 * Storage, and rewrites each product's `images` array in Firestore to
 * point at the new self-hosted URLs.
 *
 * Run with: node scripts/convertImages.js
 * Requires the same .env.local Firebase Admin credentials as seedCatalog.js.
 */
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const sharp = require("sharp");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const MAX_BYTES = 100 * 1024;
const WIDTHS = [1600, 1200, 1000, 800, 600, 400];
const QUALITIES = [80, 70, 60, 50, 40, 30];

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

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

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
  // Fall through: smallest size/quality combo we tried, even if still over the limit.
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
  const snap = await db.collection("products").get();
  console.log(`Found ${snap.size} products`);

  let totalImages = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const images = data.images || [];
    if (!images.length) continue;

    const newUrls = [];
    for (let i = 0; i < images.length; i++) {
      const sourceUrl = images[i];
      if (sourceUrl.includes("firebasestorage.googleapis.com")) {
        // Already converted in a previous run.
        newUrls.push(sourceUrl);
        continue;
      }
      try {
        const original = await downloadBuffer(sourceUrl);
        const { buffer, width, quality } = await toWebpUnderLimit(original);
        const destPath = `products/${doc.id}/${i}.webp`;
        const url = await uploadWebp(buffer, destPath);
        newUrls.push(url);

        totalImages++;
        totalBefore += original.length;
        totalAfter += buffer.length;
        console.log(
          `${data.name} [${i}] ${(original.length / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB (w=${width}, q=${quality})`
        );
      } catch (err) {
        console.error(`FAILED ${data.name} [${i}]: ${err.message}`);
        newUrls.push(sourceUrl); // keep original on failure
      }
    }

    await doc.ref.set({ images: newUrls, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }

  console.log("\nDone.");
  console.log(`Converted ${totalImages} images`);
  console.log(`Total before: ${(totalBefore / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Total after: ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
