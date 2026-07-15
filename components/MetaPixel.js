"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "910455641823342";

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
  const pixelId = JSON.stringify(META_PIXEL_ID);

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${pixelId});
          (window.luxerevaFbqQueue || []).forEach(function(item) {
            fbq('track', item.event, item.data || {});
          });
          window.luxerevaFbqQueue = [];
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
