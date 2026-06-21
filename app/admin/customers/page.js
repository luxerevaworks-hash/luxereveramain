"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { formatPrice } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const customers = useMemo(() => {
    const map = new Map();
    for (const order of orders) {
      const email = order.customer?.email || `guest-${order.id}`;
      const current = map.get(email) || {
        name: order.customer?.name || "Guest",
        email: order.customer?.email || "-",
        phone: order.customer?.phone || "-",
        orders: 0,
        total: 0,
        lastOrder: null,
      };
      current.orders += 1;
      current.total += order.total || 0;
      current.lastOrder = current.lastOrder || order.createdAt;
      map.set(email, current);
    }
    return Array.from(map.values()).filter((customer) => {
      const term = search.toLowerCase();
      return (
        !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
            Customers
          </h1>
          <p className="text-sm text-brown/60 mt-2">
            Customer list built from completed store orders.
          </p>
        </div>

        <input
          className="input-field mb-6 max-w-md"
          placeholder="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-brown/60">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-brown/60">No customers yet.</p>
        ) : (
          <div className="bg-white border border-gold/30 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest2 text-sage border-b border-gold/20">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.email} className="border-b border-gold/10 last:border-0">
                    <td className="p-4">
                      <p className="font-medium text-brown-dark">{customer.name}</p>
                      <p className="text-brown/60">{customer.email}</p>
                    </td>
                    <td className="p-4">{customer.phone}</td>
                    <td className="p-4">{customer.orders}</td>
                    <td className="p-4 font-semibold text-gold">{formatPrice(customer.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
