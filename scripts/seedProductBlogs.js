/**
 * Imports the six supplied product-blog Word documents into Firestore.
 * The posts use real product photography and include a direct shop link.
 *
 * Run: node scripts/seedProductBlogs.js
 * Set BLOG_SOURCE_DIR only if the documents are not in the default Downloads folder.
 */
require("dotenv").config({ path: ".env.local" });
const { execFileSync } = require("child_process");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const sourceDir = process.env.BLOG_SOURCE_DIR || "C:/Users/khushi mishra/Downloads";
const posts = [
  { file: "Luxereva 2.docx", id: "pearl-pendant-layered-necklace", productId: "pearl-bloom-butterfly-necklace", excerpt: "A delicate layered gold necklace with pearl-like accents for quietly elegant everyday styling." },
  { file: "luxereva  1.docx", id: "layered-crescent-pendant-necklace", productId: "celeste-moon-layered-necklace", excerpt: "Modern layering meets effortless everyday elegance in one coordinated crescent necklace." },
  { file: "Luxereva  6.docx", id: "double-layer-delicate-necklace-bracelet-set", productId: "zenovia-celestial-glow-set", excerpt: "A coordinated necklace and bracelet set that makes refined everyday styling beautifully simple." },
  { file: "luxereva 4.docx", id: "toggle-heart-charm-necklace", productId: "heart-link-pendant-necklace", excerpt: "A bold, romantic heart necklace designed to become the focal point of an evening look." },
  { file: "Luxereva 5.docx", id: "crystal-detail-necklace-bracelet-set", productId: "eterna-solitaire-set", excerpt: "Matching crystal-detail jewellery for an effortlessly polished look, from office hours to celebrations." },
  { file: "luxereva3.docx", id: "minimal-heart-pendant-necklace", productId: "eterna-heart-charm-necklace", excerpt: "A timeless heart pendant that brings meaning, simplicity, and elegance to every day." },
];

function extractDocxText(file) {
  const script = [
    `$file='${file.replace(/'/g, "''")}'`,
    "Add-Type -AssemblyName System.IO.Compression.FileSystem",
    "$zip=[IO.Compression.ZipFile]::OpenRead($file); $entry=$zip.GetEntry('word/document.xml'); $reader=[IO.StreamReader]::new($entry.Open()); [xml]$xml=$reader.ReadToEnd(); $reader.Close(); $zip.Dispose()",
    "$ns=[System.Xml.XmlNamespaceManager]::new($xml.NameTable); $ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')",
    "$xml.SelectNodes('//w:p',$ns) | ForEach-Object { $text=$_.SelectNodes('.//w:t',$ns) | ForEach-Object {$_.InnerText}; if($text){$text -join ''} }",
  ].join("; ");
  return execFileSync("powershell.exe", ["-NoProfile", "-Command", script], { encoding: "utf8" }).trim();
}

async function main() {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n") }) });
  const db = getFirestore();
  for (const post of posts) {
    const content = extractDocxText(path.join(sourceDir, post.file));
    const productDoc = await db.collection("products").doc(post.productId).get();
    if (!productDoc.exists) throw new Error(`Product not found: ${post.productId}`);
    const product = productDoc.data();
    const title = content.split(/\r?\n/).find(Boolean).trim();
    const images = (product.images || []).slice(0, 3);
    await db.collection("blogs").doc(post.id).set({
      title, slug: post.id, excerpt: post.excerpt, content, image: images[0] || "", images,
      product: { id: productDoc.id, slug: product.slug || productDoc.id, name: product.name, image: images[0] || "" },
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`Published: ${title}`);
  }
}
main().catch((error) => { console.error(error); process.exit(1); });
