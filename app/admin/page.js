"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { formatPrice } from "@/lib/utils";

function StatCard({ label, value, helper }) {
  return (
    <div className="bg-white border border-gold/30 rounded-lg p-6">
      <p className="text-xs uppercase tracking-widest2 text-sage mb-2">{label}</p>
      <p className="text-2xl font-semibold text-brown-dark">{value}</p>
      {helper && <p className="text-xs text-brown/60 mt-2">{helper}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productsSnap, ordersSnap] = await Promise.all([
          getCountFromServer(collection(db, "products")),
          getCountFromServer(collection(db, "orders")),
        ]);

        const recentQ = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        const productsQ = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const [recentSnap, productsListSnap] = await Promise.all([
          getDocs(recentQ),
          getDocs(productsQ),
        ]);

        const orders = recentSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const loadedProducts = productsListSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRecentOrders(orders);
        setProducts(loadedProducts);

        setStats({
          products: productsSnap.data().count,
          orders: ordersSnap.data().count,
          revenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const inventory = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const stock = product.stock || 0;
        acc.units += stock;
        if (stock <= 0) acc.out += 1;
        if (stock > 0 && stock <= (product.lowStockThreshold ?? 5)) acc.low += 1;
        return acc;
      },
      { units: 0, low: 0, out: 0 }
    );
  }, [products]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
              Dashboard
            </h1>
            <p className="text-sm text-brown/60 mt-2">
              Store overview, recent orders, and quick actions.
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard label="Products" value={loading ? "..." : stats.products} />
          <StatCard label="Orders" value={loading ? "..." : stats.orders} />
          <StatCard label="Recent Revenue" value={loading ? "..." : formatPrice(stats.revenue)} helper="From latest loaded orders" />
          <StatCard label="Low Stock" value={loading ? "..." : inventory.low} helper={`${inventory.out} out of stock`} />
        </div>

        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <div>
            <h2 className="uppercase tracking-widest2 text-sm text-brown-dark mb-4">
              Recent Orders
            </h2>
            {loading ? (
              <p className="text-brown/60">Loading...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-brown/60">No orders yet.</p>
            ) : (
              <div className="bg-white border border-gold/30 rounded-lg divide-y divide-gold/20">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-brown-dark">#{order.id.slice(0, 8)}</p>
                      <p className="text-brown/60">{order.customer?.name || "Guest"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gold">{formatPrice(order.total)}</p>
                      <p className="text-xs text-sage uppercase">{order.status || "paid"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="uppercase tracking-widest2 text-sm text-brown-dark mb-4">
              Quick Actions
            </h2>
            <div className="bg-white border border-gold/30 rounded-lg p-4 grid gap-3">
              <Link href="/admin/inventory" className="btn-outline">Update Inventory</Link>
              <Link href="/admin/orders" className="btn-outline">Manage Orders</Link>
              <Link href="/admin/coupons" className="btn-outline">Create Coupon</Link>
              <Link href="/admin/settings" className="btn-outline">Store Settings</Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
