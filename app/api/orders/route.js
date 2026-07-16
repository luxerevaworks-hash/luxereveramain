import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

function orderTime(order) {
  return order.createdAt?.toMillis?.() || order.createdAt?.seconds * 1000 || 0;
}

export async function GET(request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });
    }

    const user = await getAdminAuth().verifyIdToken(token);
    const orders = new Map();
    const ordersRef = getAdminDb().collection("orders");

    // userId covers current orders. The email lookups preserve history for
    // orders created before accounts were consistently attached to checkout.
    const snapshots = await Promise.all([
      ordersRef.where("userId", "==", user.uid).get(),
      user.email ? ordersRef.where("userEmail", "==", user.email).get() : Promise.resolve(null),
      user.email ? ordersRef.where("customer.email", "==", user.email).get() : Promise.resolve(null),
    ]);

    snapshots.filter(Boolean).forEach((snapshot) => {
      snapshot.forEach((orderDoc) => {
        orders.set(orderDoc.id, { id: orderDoc.id, ...orderDoc.data() });
      });
    });

    return NextResponse.json({
      orders: Array.from(orders.values()).sort((a, b) => orderTime(b) - orderTime(a)),
    });
  } catch (error) {
    console.error("Order history error:", error);
    return NextResponse.json({ error: "Could not load order history." }, { status: 500 });
  }
}
