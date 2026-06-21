"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { nanoid } from "nanoid";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, text: "", photo: "" });

  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs
        .map((d) => ({ id: d.id, name: d.data().name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setProducts(list);
      if (list.length) setProductId(list[0].id);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (!productId) return;
    loadReviews(productId);
  }, [productId]);

  async function loadReviews(pid) {
    setLoadingReviews(true);
    try {
      const q = query(
        collection(db, "products", pid, "reviews"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `products/reviews/${nanoid()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((f) => ({ ...f, photo: url }));
      toast.success("Photo uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function addReview(e) {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "products", productId, "reviews"), {
        name: form.name.trim(),
        rating: Number(form.rating) || 5,
        text: form.text.trim(),
        photo: form.photo || "",
        createdAt: serverTimestamp(),
      });
      toast.success("Review added");
      setForm({ name: "", rating: 5, text: "", photo: "" });
      loadReviews(productId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add review");
    } finally {
      setSaving(false);
    }
  }

  async function removeReview(id) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, "products", productId, "reviews", id));
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review");
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
            Reviews
          </h1>
          <p className="text-sm text-brown/60 mt-2">
            Add or remove customer reviews per product, including photos.
          </p>
        </div>

        <div className="bg-white border border-gold/30 rounded-lg p-5 mb-8">
          <label className="text-xs uppercase tracking-widest2 text-brown-dark">Product</label>
          <select
            className="input-field mt-1"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <form onSubmit={addReview} className="bg-white border border-gold/30 rounded-lg p-5 space-y-4 mb-8">
          <h2 className="text-sm uppercase tracking-widest2 text-brown-dark">Add Review</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Customer Name</label>
              <input
                className="input-field mt-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Rating</label>
              <select
                className="input-field mt-1"
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} stars</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Review Text</label>
            <textarea
              className="input-field mt-1"
              rows={3}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-1 block text-sm" />
            {uploading && <p className="text-xs text-brown/60 mt-1">Uploading...</p>}
            {form.photo && (
              <img src={form.photo} alt="" className="w-20 h-20 object-cover rounded-lg mt-2 border border-gold/30" />
            )}
          </div>
          <button disabled={saving || uploading} className="btn-primary">
            {saving ? "Saving..." : "Add Review"}
          </button>
        </form>

        {loadingReviews ? (
          <p className="text-brown/60">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-brown/60">No reviews for this product yet.</p>
        ) : (
          <div className="bg-white border border-gold/30 rounded-lg divide-y divide-gold/20">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 flex gap-4">
                {r.photo && (
                  <img src={r.photo} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brown-dark">{r.name}</p>
                    <button onClick={() => removeReview(r.id)} className="text-rosewood text-sm font-medium">
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  <p className="text-sm text-brown/80 mt-1">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
