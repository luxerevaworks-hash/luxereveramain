/**
 * Uploads the Google Drive product assets to Firebase Storage and updates the
 * matching Firestore product documents with durable public download URLs.
 *
 * Run with: npm run upload:drive-product-images
 */
require("dotenv").config({ path: ".env.local" });
const path = require("path");
const crypto = require("crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

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
const bucketName =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
const bucket = getStorage(app).bucket(bucketName);

const collections = [
  { id: "crystal-huggie-pendant-set", folder: "crystal-huggie-pendant-set", count: 7 },
  { id: "heart-link-pendant-necklace", folder: "heart-link-pendant-necklace", count: 6 },
];

async function uploadCollection({ id, folder, count }) {
  const urls = [];

  for (let index = 1; index <= count; index++) {
    const filename = `Luxereva_Jewelry_${String(index).padStart(2, "0")}.png`;
    const localPath = path.join(__dirname, "..", "public", "images", "products", folder, filename);
    const storagePath = `products/catalog/${folder}/${filename}`;
    const token = crypto.randomUUID();

    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: {
        contentType: "image/png",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

    urls.push(
      `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`
    );
  }

  await db.collection("products").doc(id).set({ images: urls }, { merge: true });
  console.log(`Uploaded and updated: ${id}`);
}

Promise.all(collections.map(uploadCollection))
  .then(() => console.log("Product image URLs updated."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
