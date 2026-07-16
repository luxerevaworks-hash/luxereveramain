"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function PageViewLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
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
