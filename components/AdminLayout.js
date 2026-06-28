"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Live Visitors" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="container-page py-8 grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8">
      <aside className="bg-white border border-gold/30 rounded-lg p-4 h-fit">
        <h2 className="uppercase tracking-widest2 text-xs text-sage mb-4">
          Admin Panel
        </h2>
        <nav className="flex flex-col gap-2 text-sm">
          {LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-brown text-cream"
                    : "text-brown-dark hover:bg-gold/20"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="px-3 py-2 rounded-lg text-brown/60 hover:bg-gold/20 mt-4"
          >
            Back to Store
          </Link>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
