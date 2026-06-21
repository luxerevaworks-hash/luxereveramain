"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

function stockState(product) {
  const threshold = product.lowStockThreshold ?? 5;
  if ((product.stock || 0) <= 0) return "Out of stock";
  if ((product.stock || 0) <= threshold) return "Low stock";
  return "In stock";
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const term = search.toLowerCase();
      return (
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  async function saveStock(product, stock, lowStockThreshold) {
    setSavingId(product.id);
    try {
      const payload = {
        stock: parseInt(stock, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      };
      await updateDoc(doc(db, "products", product.id), payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, ...payload } : p))
      );
      toast.success("Inventory updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update inventory");
    } finally {
      setSavingId(null);
    }
  }

  const totals = products.reduce(
    (acc, p) => {
      acc.units += p.stock || 0;
      acc.images += p.images?.length || 0;
      acc.videos += p.videos?.length || 0;
      if ((p.stock || 0) <= 0) acc.out += 1;
      if ((p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold ?? 5)) acc.low += 1;
      return acc;
    },
    { units: 0, low: 0, out: 0, images: 0, videos: 0 }
  );

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
              Inventory
            </h1>
            <p className="text-sm text-brown/60 mt-2">
              Stock levels with product listing, images, videos, and alert thresholds.
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        </div>

        <div className="grid sm:grid-cols-5 gap-4 mb-6">
          <Stat label="Units" value={totals.units} />
          <Stat label="Low Stock" value={totals.low} />
          <Stat label="Out" value={totals.out} />
          <Stat label="Images" value={totals.images} />
          <Stat label="Videos" value={totals.videos} />
        </div>

        <input
          className="input-field mb-6 max-w-md"
          placeholder="Search by product, SKU, or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-brown/60">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-brown/60">No inventory found.</p>
        ) : (
          <div className="bg-white border border-gold/30 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest2 text-sage border-b border-gold/20">
                  <th className="p-4">Product</th>
                  <th className="p-4">Media</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Alert At</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <InventoryRow
                    key={product.id}
                    product={product}
                    saving={savingId === product.id}
                    onSave={saveStock}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}

function InventoryRow({ product, saving, onSave }) {
  const [stock, setStock] = useState(product.stock || 0);
  const [threshold, setThreshold] = useState(product.lowStockThreshold ?? 5);
  const state = stockState({ ...product, stock, lowStockThreshold: threshold });

  return (
    <tr className="border-b border-gold/10 last:border-0 align-top">
      <td className="p-4">
        <div className="flex items-center gap-3 min-w-64">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt="" className="w-14 h-14 object-cover rounded border border-gold/30" />
          ) : (
            <div className="w-14 h-14 rounded border border-gold/30 bg-cream flex items-center justify-center text-[10px] text-brown/50 uppercase">
              No image
            </div>
          )}
          <div>
            <p className="font-medium text-brown-dark">{product.name}</p>
            <p className="text-xs text-brown/60 capitalize">{product.category}</p>
          </div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <p>{product.images?.length || 0} images</p>
        <p>{product.videos?.length || 0} videos</p>
      </td>
      <td className="p-4">{product.sku || "-"}</td>
      <td className="p-4">
        <span className={`text-xs uppercase tracking-widest2 ${
          state === "Low stock" ? "text-rosewood" : "text-sage"
        }`}>
          {state}
        </span>
      </td>
      <td className="p-4">
        <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="input-field w-24 py-2" />
      </td>
      <td className="p-4">
        <input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="input-field w-24 py-2" />
      </td>
      <td className="p-4 text-right">
        <button onClick={() => onSave(product, stock, threshold)} disabled={saving} className="btn-outline py-2 px-4">
          {saving ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gold/30 rounded-lg p-5">
      <p className="text-xs uppercase tracking-widest2 text-sage">{label}</p>
      <p className="text-2xl font-semibold text-brown-dark mt-2">{value}</p>
    </div>
  );
}
