"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { formatPrice } from "@/lib/utils";
import { getBadgeConfig } from "@/lib/badges";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((p) => (
      !term ||
      p.name?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    ));
  }, [products, search]);

  async function handleDelete(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted");
      setProducts((p) => p.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  }

  const totals = products.reduce(
    (acc, product) => {
      acc.images += product.images?.length || 0;
      acc.videos += product.videos?.length || 0;
      if ((product.stock || 0) <= 0) acc.out += 1;
      return acc;
    },
    { images: 0, videos: 0, out: 0 }
  );

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
              Products
            </h1>
            <p className="text-sm text-brown/60 mt-2">
              Product listing with pricing, inventory, images, videos, and publish status.
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <AdminStat label="Products" value={products.length} />
          <AdminStat label="Images" value={totals.images} />
          <AdminStat label="Videos" value={totals.videos} />
          <AdminStat label="Out of Stock" value={totals.out} />
        </div>

        <input
          className="input-field mb-6 max-w-md"
          placeholder="Search products, SKU, or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-brown/60">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-brown/60">No products found.</p>
        ) : (
          <div className="bg-white border border-gold/30 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest2 text-sage border-b border-gold/20">
                  <th className="p-4">Product</th>
                  <th className="p-4">Media</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gold/10 last:border-0 align-top">
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-64">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded border border-gold/30" />
                        ) : (
                          <div className="w-14 h-14 rounded border border-gold/30 bg-cream flex items-center justify-center text-[10px] text-brown/50 uppercase">
                            No image
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-brown-dark">{p.name}</p>
                          <p className="text-xs text-brown/60 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 whitespace-nowrap">
                        <p>{p.images?.length || 0} images</p>
                        <p>{p.videos?.length || 0} videos</p>
                      </div>
                    </td>
                    <td className="p-4">{p.sku || "-"}</td>
                    <td className="p-4 capitalize">{p.category}</td>
                    <td className="p-4">
                      {formatPrice(p.price)}
                      {p.originalPrice > p.price && (
                        <span className="block text-xs text-brown/40 line-through">
                          {formatPrice(p.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-40">
                        {(p.badges || []).map((key) => {
                          const badge = getBadgeConfig(key);
                          if (!badge) return null;
                          return (
                            <span
                              key={key}
                              className={`${badge.className} text-white text-[9px] font-semibold uppercase tracking-widest2 px-2 py-0.5 rounded-full`}
                            >
                              {badge.label}
                            </span>
                          );
                        })}
                        {(!p.badges || p.badges.length === 0) && (
                          <span className="text-xs text-brown/40">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4 capitalize">{p.status || "active"}</td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <Link href={`/admin/products/${p.id}`} className="text-rosewood font-medium">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="text-brown/60 hover:text-rosewood">
                        Delete
                      </button>
                    </td>
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

function AdminStat({ label, value }) {
  return (
    <div className="bg-white border border-gold/30 rounded-lg p-5">
      <p className="text-xs uppercase tracking-widest2 text-sage">{label}</p>
      <p className="text-2xl font-semibold text-brown-dark mt-2">{value}</p>
    </div>
  );
}
