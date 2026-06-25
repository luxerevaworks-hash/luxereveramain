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
import { slugify } from "@/lib/utils";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", image: "" });

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `blogs/${nanoid()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((f) => ({ ...f, image: url }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function addPost(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, "blogs"), {
        title: form.title.trim(),
        slug: slugify(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        image: form.image || "",
        createdAt: serverTimestamp(),
      });
      toast.success("Blog post added");
      setForm({ title: "", excerpt: "", content: "", image: "" });
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add blog post");
    } finally {
      setSaving(false);
    }
  }

  async function removePost(id) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await deleteDoc(doc(db, "blogs", id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Blog post deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog post");
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
            Blogs
          </h1>
          <p className="text-sm text-brown/60 mt-2">
            Write and publish journal posts shown on the storefront Blogs page.
          </p>
        </div>

        <form onSubmit={addPost} className="bg-white border border-gold/30 rounded-lg p-5 space-y-4 mb-8">
          <h2 className="text-sm uppercase tracking-widest2 text-brown-dark">Add Blog Post</h2>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Title</label>
            <input
              className="input-field mt-1"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Excerpt</label>
            <textarea
              className="input-field mt-1"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="A short teaser shown on the blog listing card"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Content</label>
            <textarea
              className="input-field mt-1"
              rows={8}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Full post content"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Cover Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block text-sm" />
            {uploading && <p className="text-xs text-brown/60 mt-1">Uploading...</p>}
            {form.image && (
              <img src={form.image} alt="" className="w-32 h-20 object-cover rounded-lg mt-2 border border-gold/30" />
            )}
          </div>
          <button disabled={saving || uploading} className="btn-primary">
            {saving ? "Saving..." : "Publish Post"}
          </button>
        </form>

        {loadingPosts ? (
          <p className="text-brown/60">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-brown/60">No blog posts yet.</p>
        ) : (
          <div className="bg-white border border-gold/30 rounded-lg divide-y divide-gold/20">
            {posts.map((post) => (
              <div key={post.id} className="p-4 flex gap-4">
                {post.image && (
                  <img src={post.image} alt="" className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brown-dark">{post.title}</p>
                    <button onClick={() => removePost(post.id)} className="text-rosewood text-sm font-medium">
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-brown/70 mt-1">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
