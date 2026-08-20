import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import MetaPixel from "@/components/MetaPixel";
import PresenceTracker from "@/components/PresenceTracker";
import CartDrawer from "@/components/CartDrawer";
import { Toaster } from "react-hot-toast";
import { FiMessageCircle } from "react-icons/fi";

const SITE_URL = (process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com").replace(/\/$/, "");

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Luxereva",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_CANONICAL_URL || "https://luxereva.com"),
  title: {
    default: "Luxereva | Premium Jewellery",
    template: "%s | Luxereva",
  },
  description:
    "Discover Luxereva's trend-inspired jewellery — necklaces, earrings, bracelets, rings and more. Premium finish, lightweight designs, best for gifting.",
  applicationName: "Luxereva",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
        />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnalyticsTracker />
              <MetaPixel />
              <PresenceTracker />
              <Navbar />
              <main className="min-h-[60vh]">{children}</main>
              <Footer />
              <a
                href="https://wa.me/918421318199?text=Hello%20Luxereva%2C%20I%20need%20help."
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Luxereva customer care on WhatsApp"
                className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brown-dark"
              >
                <FiMessageCircle className="h-7 w-7" aria-hidden="true" />
              </a>
              <CartDrawer />
              <Toaster position="bottom-center" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
