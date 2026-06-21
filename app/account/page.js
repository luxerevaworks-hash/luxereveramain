"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    router.push("/");
  }

  if (loading || !user) {
    return <p className="container-page py-20 text-center text-brown/60">Loading…</p>;
  }

  return (
    <div className="container-page py-10 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">My Account</h1>
          <p className="text-brown/70 mt-1 break-words">{user.displayName || user.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-outline flex-shrink-0">
          Sign Out
        </button>
      </div>

      {isAdmin && (
        <a href="/admin" className="btn-primary inline-block mb-8">
          Go to Admin Panel
        </a>
      )}

      <h2 className="uppercase tracking-widest2 text-sm text-brown-dark mb-4">Order History</h2>

      {ordersLoading ? (
        <p className="text-brown/60">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-brown/60">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gold/30 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-brown-dark">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-brown/60">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString()
                      : ""}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-widest2 px-3 py-1 rounded-full bg-sage/20 text-sage">
                  {order.status || "placed"}
                </span>
              </div>
              <ul className="text-sm text-brown/80 mb-2">
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.qty} × {item.name}
                    {item.variant ? ` (${item.variant.name})` : ""}
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-gold">{formatPrice(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
