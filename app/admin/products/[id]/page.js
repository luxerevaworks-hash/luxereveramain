"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <AdminGuard>
      <AdminLayout>
        <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-6">Edit Product</h1>
        {loading ? (
          <p className="text-brown/60">Loading…</p>
        ) : product ? (
          <ProductForm initialData={product} />
        ) : (
          <p className="text-brown/60">Product not found.</p>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
