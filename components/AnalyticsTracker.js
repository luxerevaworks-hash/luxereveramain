"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const AUTOMATED_AGENT = /bot|crawler|spider|crawling|lighthouse|pagespeed|headless/i;

function canTrack() {
  return Boolean(GA_MEASUREMENT_ID) && !AUTOMATED_AGENT.test(navigator.userAgent);
}

function loadGoogleAnalytics() {
  if (!canTrack() || window.luxerevaGaLoaded) return;
  window.luxerevaGaLoaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
}

function PageViewLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!canTrack()) return;
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    loadGoogleAnalytics();
    window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: url });
    // Analytics is not needed to paint the page. Loading it here keeps the
    // Firebase analytics SDK out of the initial JavaScript bundle.
    Promise.all([import("firebase/analytics"), import("@/lib/firebase")])
      .then(([{ getAnalytics, logEvent }, { default: app }]) => {
        logEvent(getAnalytics(app), "page_view", { page_path: url });
      })
      // Measurement is optional; it must never affect the shopping experience.
      .catch(() => {});
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewLogger />
    </Suspense>
  );
}
