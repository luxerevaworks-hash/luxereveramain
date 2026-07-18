require("dotenv").config({ path: ".env.local" });
const { getAdminDb } = require("../lib/firebaseAdmin");

async function head(url) {
  try {
    let res = await fetch(url, { method: "HEAD" });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: "GET" });
    }
    return res.status;
  } catch (e) {
    return `ERR: ${e.message}`;
  }
}

async function main() {
  const db = getAdminDb();
  const snap = await db.collection("products").get();
  console.log(`Found ${snap.size} products.\n`);

  let totalImages = 0;
  let broken = [];
  let missing = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const images = Array.isArray(data.images) ? data.images : [];
    if (images.length === 0) {
      missing.push({ id: doc.id, name: data.name || "(no name)" });
      continue;
    }
    for (const url of images) {
      totalImages++;
      const status = await head(url);
      if (status !== 200) {
        broken.push({ id: doc.id, name: data.name || "(no name)", url, status });
      }
    }
  }

  console.log(`Checked ${totalImages} image URLs across ${snap.size} products.\n`);

  if (missing.length) {
    console.log(`Products with NO images (${missing.length}):`);
    missing.forEach((p) => console.log(`  - ${p.name} (${p.id})`));
    console.log("");
  }

  if (broken.length) {
    console.log(`Broken image URLs (${broken.length}):`);
    broken.forEach((b) => console.log(`  - [${b.status}] ${b.name} (${b.id}): ${b.url}`));
  } else {
    console.log("All found image URLs returned HTTP 200.");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("Script failed:", e);
  process.exit(1);
});
