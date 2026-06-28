import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

const COLUMNS = ["id", "title", "description", "link", "image_link", "availability", "price", "condition", "brand"];

function csvEscape(value = "") {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Public Google Merchant Center product feed (CSV). Use Merchant Center's
// "Add products from a file" > "Automatically update" > paste this URL —
// {NEXT_PUBLIC_SITE_URL}/api/merchant-feed/csv. No auth required. Merchant
// Center re-fetches it on its own schedule, so newly added products show up
// automatically without re-uploading anything.
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const rows = [COLUMNS.join(",")];

  try {
    const snap = await getAdminDb().collection("products").get();
    snap.forEach((doc) => {
      const p = doc.data();
      const price = ((p.price || 0) / 100).toFixed(2);
      const availability = (p.stock || 0) > 0 ? "in_stock" : "out_of_stock";

      rows.push(
        [
          doc.id,
          p.name,
          p.description || p.name,
          `${siteUrl}/products/${doc.id}`,
          p.images?.[0] || "",
          availability,
          `${price} INR`,
          "new",
          "Luxereva",
        ]
          .map(csvEscape)
          .join(",")
      );
    });
  } catch (err) {
    console.error("merchant-feed csv generation error:", err);
  }

  return new NextResponse(rows.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
