"use client";

import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-6">Add Product</h1>
        <ProductForm />
      </AdminLayout>
    </AdminGuard>
  );
}
