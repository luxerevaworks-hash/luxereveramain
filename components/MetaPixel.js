"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const AUTOMATED_AGENT = /bot|crawler|spider|crawling|lighthouse|pagespeed|headless/i;

export function getCurrentEventUrl() {
  if (typeof window === "undefined") return undefined;
  return window.location.href;
}

function withEventUrl(data = {}) {
  const eventUrl = getCurrentEventUrl();
  return eventUrl ? { ...data, event_source_url: eventUrl } : data;
}

export function fbqTrack(event, data) {
  if (typeof window === "undefined") return;

  const payload = withEventUrl(data);

  if (typeof window.fbq === "function") {
    window.fbq("track", event, payload);
    return;
  }

  window.luxerevaFbqQueue = window.luxerevaFbqQueue || [];
  window.luxerevaFbqQueue.push({ event, data: payload });
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrl = useRef(null);
  const queryString = searchParams.toString();
  const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    if (!META_PIXEL_ID || AUTOMATED_AGENT.test(navigator.userAgent)) return;
    if (previousUrl.current === currentUrl) return;

    const fullUrl = window.location.href;
    if (window.luxerevaLastPageViewUrl === fullUrl) return;

    window.luxerevaLastPageViewUrl = fullUrl;
    fbqTrack("PageView", { event_source_url: fullUrl });
    previousUrl.current = currentUrl;
  }, [currentUrl]);

  return null;
}

export default function MetaPixel() {
  useEffect(() => {
    if (!META_PIXEL_ID || AUTOMATED_AGENT.test(navigator.userAgent) || window.fbq) return;
    const fbq = function fbq(...args) { fbq.queue.push(args); };
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    fbq("init", META_PIXEL_ID);
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }, []);

  if (!META_PIXEL_ID) return null;
  return <Suspense fallback={null}><PageViewTracker /></Suspense>;
}
