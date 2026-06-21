import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      customer,
      items,
      total,
    } = body;

    // 1. Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const adminDb = getAdminDb();

    // 2. Save order to Firestore
    const orderRef = await adminDb.collection("orders").add({
      userId: userId || null,
      customer,
      items,
      total,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: "paid",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Decrement stock for each purchased item (best-effort)
    for (const item of items) {
      try {
        const productRef = adminDb.collection("products").doc(item.id);
        await productRef.update({
          stock: FieldValue.increment(-item.qty),
        });
      } catch (e) {
        console.error("Stock update failed for", item.id, e);
      }
    }

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
