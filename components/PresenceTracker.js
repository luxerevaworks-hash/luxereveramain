"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionId, sendHeartbeat } from "@/lib/presence";

const HEARTBEAT_MS = 20000;

function productIdFromPath(path) {
  const match = path?.match(/^\/products\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

function PresenceHeartbeat() {
  const pathname = usePathname();
  const currentRef = useRef({ path: pathname, productId: productIdFromPath(pathname) });

  useEffect(() => {
    currentRef.current = { path: pathname, productId: productIdFromPath(pathname) };
    sendHeartbeat(currentRef.current);
  }, [pathname]);

  useEffect(() => {
    const timer = setInterval(() => sendHeartbeat(currentRef.current), HEARTBEAT_MS);

    function handleLeave() {
      const sessionId = getSessionId();
      if (!sessionId) return;
      try {
        navigator.sendBeacon?.(
          "/api/presence/leave",
          new Blob([JSON.stringify({ sessionId })], { type: "application/json" })
        );
      } catch (err) {
        console.error(err);
      }
    }

    window.addEventListener("beforeunload", handleLeave);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  return null;
}

export default function PresenceTracker() {
  return (
    <Suspense fallback={null}>
      <PresenceHeartbeat />
    </Suspense>
  );
}
