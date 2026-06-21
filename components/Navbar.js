"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiShoppingBag, FiUser, FiMenu, FiX, FiSearch } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/blogs", label: "Blogs" },
  { href: "/notifications", label: "Notifications" },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-gold/40">
      <div className="bg-brown-dark text-cream text-[11px] sm:text-xs py-1.5 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee">
          🎁 Pay online &amp; get a <span className="text-gold font-semibold">FREE gift worth ₹799+</span>
        </div>
      </div>
      <div className="container-page flex items-center justify-between py-1.5">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-32 sm:w-48 h-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-widest2 text-brown-dark">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((o) => !o)}
          >
            <FiSearch className="w-4 h-4 text-brown-dark" />
          </button>
          <Link
            href={user ? "/account" : "/login"}
            aria-label="Account"
            className="relative"
          >
            <FiUser className="w-4 h-4 text-brown-dark" />
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline text-[11px] uppercase tracking-widest2 text-rosewood font-semibold"
            >
              Admin
            </Link>
          )}
          <Link href="/cart" aria-label="Cart" className="relative">
            <FiShoppingBag className="w-4 h-4 text-brown-dark" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rosewood text-cream text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-gold/40 bg-cream">
          <form onSubmit={handleSearchSubmit} className="container-page py-3 flex gap-2">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for earrings, necklaces, rings..."
              className="input-field"
            />
            <button type="submit" className="btn-primary flex-shrink-0" aria-label="Submit search">
              <FiSearch className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {open && (
        <div className="lg:hidden border-t border-gold/40 bg-cream">
          <div className="container-page py-4 flex flex-col gap-3 text-sm uppercase tracking-widest2 text-brown-dark">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-rosewood font-semibold"
                onClick={() => setOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
