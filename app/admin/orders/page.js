"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => (order.status || "paid") === statusFilter);
  }, [orders, statusFilter]);

  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
              Orders
            </h1>
            <p className="text-sm text-brown/60 mt-2">
              Review customer details, items, payment totals, and fulfillment status.
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field sm:max-w-52"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-brown/60">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-brown/60">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white border border-gold/30 rounded-lg p-4">
                <div className="flex flex-wrap justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-brown-dark">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-brown/60">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold">{formatPrice(order.total)}</p>
                    <select
                      value={order.status || "paid"}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="input-field mt-1 text-xs py-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest2 text-sage mb-1">Customer</p>
                    <p className="text-brown-dark">{order.customer?.name || "Guest"}</p>
                    <p className="text-brown/70">{order.customer?.email}</p>
                    <p className="text-brown/70">{order.customer?.phone}</p>
                    <p className="text-brown/70">
                      {order.customer?.address}, {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest2 text-sage mb-1">Items</p>
                    <ul className="text-brown-dark space-y-1">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.qty} x {item.name}
                          {item.variant ? ` (${item.variant.name})` : ""}
                        </li>
                      ))}
                    </ul>
                    {order.giftWrap && (
                      <p className="mt-2 inline-block text-xs uppercase tracking-widest2 bg-rosewood/10 text-rosewood rounded-full px-3 py-1">
                        🎁 Gift Wrap Requested
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
