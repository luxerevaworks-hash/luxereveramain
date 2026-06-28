import { NextResponse } from "next/server";

// Meta's webhook verification handshake — configure this URL + WHATSAPP_VERIFY_TOKEN
// in the Meta App Dashboard once the site is deployed to a public HTTPS domain.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Inbound message/status webhook. Real conversational handling is out of
// scope for now — this just acknowledges receipt so Meta doesn't retry/disable
// the webhook. Extend this to react to customer replies once needed.
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("WhatsApp webhook event:", JSON.stringify(body));
  } catch (err) {
    console.error("WhatsApp webhook parse error:", err);
  }
  return NextResponse.json({ received: true });
}
