import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Best-effort cleanup, called via navigator.sendBeacon on page unload.
export async function POST(req) {
  try {
    const text = await req.text();
    const { sessionId } = JSON.parse(text || "{}");
    if (sessionId) {
      await getAdminDb().collection("presence").doc(sessionId).delete();
    }
  } catch (err) {
    console.error("presence leave error:", err);
  }
  return NextResponse.json({ ok: true });
}
