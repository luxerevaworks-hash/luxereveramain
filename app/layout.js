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
import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-RVZPZZSJSS";

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnalyticsTracker />
              <MetaPixel />
              <PresenceTracker />
              <Navbar />
              <main className="min-h-[60vh]">{children}</main>
              <Footer />
              <CartDrawer />
              <Toaster position="bottom-center" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
