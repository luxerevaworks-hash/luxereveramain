"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";

function PageViewLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!analytics) return;
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    logEvent(analytics, "page_view", { page_path: url });
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
