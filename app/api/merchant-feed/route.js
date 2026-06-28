import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Public Google Merchant Center product feed (RSS 2.0 + g: namespace).
// Once a production domain exists, point Merchant Center's "Scheduled fetch"
// at {NEXT_PUBLIC_SITE_URL}/api/merchant-feed.
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let items = "";
  try {
    const snap = await getAdminDb().collection("products").get();
    snap.forEach((doc) => {
      const p = doc.data();
      const price = ((p.price || 0) / 100).toFixed(2);
      const availability = (p.stock || 0) > 0 ? "in_stock" : "out_of_stock";

      items += `
        <item>
          <g:id>${doc.id}</g:id>
          <title>${escapeXml(p.name)}</title>
          <description>${escapeXml(p.description || p.name)}</description>
          <link>${siteUrl}/products/${doc.id}</link>
          <g:image_link>${escapeXml(p.images?.[0] || "")}</g:image_link>
          <g:availability>${availability}</g:availability>
          <g:price>${price} INR</g:price>
          <g:condition>new</g:condition>
          <g:brand>Luxereva</g:brand>
        </item>`;
    });
  } catch (err) {
    console.error("merchant-feed generation error:", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Luxereva Product Feed</title>
    <link>${siteUrl}</link>
    <description>Luxereva product feed for Google Merchant Center</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
