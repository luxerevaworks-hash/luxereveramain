"use client";

import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { getActiveSessions } from "@/lib/presence";

const POLL_MS = 15000;

export default function LiveViewerBadge({ productId }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const sessions = await getActiveSessions();
        if (cancelled) return;
        setCount(sessions.filter((s) => s.productId === productId).length);
      } catch (err) {
        console.error(err);
      }
    }

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [productId]);

  if (!count) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs text-rosewood mt-3">
      <FiEye className="w-3.5 h-3.5" />
      <span>
        {count} {count === 1 ? "person is" : "people are"} viewing this right now
      </span>
    </p>
  );
}
