"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiShoppingBag, FiUser, FiMenu, FiX, FiSearch, FiHeart } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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

const SHOP_LINKS = [
  { href: "/products?category=necklaces", label: "Necklaces" },
  { href: "/products?category=earrings", label: "Earrings" },
  { href: "/products?category=bracelets", label: "Bracelets" },
  { href: "/products?category=rings", label: "Rings" },
];

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
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
          🚚 <span className="text-gold font-semibold">FREE delivery on all products</span>
          {" "}• 🎁 Pay online &amp; get a <span className="text-gold font-semibold">FREE gift worth ₹799+</span>
        </div>
      </div>
      <div className="container-page flex min-h-16 items-center justify-between gap-3 py-2 sm:min-h-[72px]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="lg:hidden -ml-1 p-1"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu className="h-6 w-6 text-brown-dark" />
          </button>
          <Link href="/" className="flex min-w-0 items-center">
            <Logo className="h-auto w-36 sm:w-48" />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-5 text-[11px] font-semibold uppercase tracking-widest2 text-brown-dark">
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

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((o) => !o)}
            className="hidden lg:block"
          >
            <FiSearch className="w-4 h-4 text-brown-dark" />
          </button>
          <Link
            href={user ? "/account" : "/login"}
            aria-label="Account"
            className="relative"
          >
            <FiUser className="w-5 h-5 text-brown-dark" />
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline text-[11px] uppercase tracking-widest2 text-rosewood font-semibold"
            >
              Admin
            </Link>
          )}
          <Link href="/wishlist" aria-label="Wishlist" className="relative">
            <FiHeart className="w-5 h-5 text-brown-dark" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rosewood text-cream text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button type="button" onClick={openCart} aria-label="Open cart" className="relative">
            <FiShoppingBag className="w-5 h-5 text-brown-dark" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rosewood text-cream text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="container-page flex gap-2 border-t border-gold/30 py-2 lg:hidden">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jewellery..."
          className="input-field h-10 text-sm"
          aria-label="Search products"
        />
        <button type="submit" className="btn-primary flex-shrink-0 px-4" aria-label="Submit search">
          <FiSearch className="w-4 h-4" />
        </button>
      </form>

      {searchOpen && (
        <div className="hidden border-t border-gold/40 bg-cream lg:block">
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
        <div className="lg:hidden fixed inset-0 z-[60] bg-brown-dark/35" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-full overflow-y-auto bg-cream px-5 py-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between border-b border-gold/30 pb-5">
              <Logo className="h-auto w-40" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <FiX className="h-6 w-6 text-brown-dark" />
              </button>
            </div>
            <nav className="py-3">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block border-b border-gold/20 py-4 text-sm font-medium uppercase tracking-widest2 text-brown-dark">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-y border-gold/30 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest2 text-rosewood">Shop by category</p>
              {SHOP_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-2 text-sm text-brown-dark">
                  {link.label}<span aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
            <div className="pt-4 space-y-3 text-sm text-brown-dark">
              <Link href={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="flex items-center gap-3"><FiUser />{user ? "My Account" : "Sign In / Register"}</Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-3"><FiHeart />My Wishlist</Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
