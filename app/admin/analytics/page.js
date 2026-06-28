"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveSessions } from "@/lib/presence";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";

const POLL_MS = 10000;

export default function AdminAnalyticsPage() {
  const [sessions, setSessions] = useState([]);
  const [productNames, setProductNames] = useState({});
  const [loading, setLoading] = useState(true);
  const productNamesRef = useRef({});

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const active = await getActiveSessions();
        if (cancelled) return;
        setSessions(active);

        const unknownIds = [...new Set(active.map((s) => s.productId).filter(Boolean))].filter(
          (id) => !(id in productNamesRef.current)
        );
        if (unknownIds.length) {
          const entries = await Promise.all(
            unknownIds.map(async (id) => {
              try {
                const snap = await getDoc(doc(db, "products", id));
                return [id, snap.exists() ? snap.data().name : id];
              } catch {
                return [id, id];
              }
            })
          );
          if (!cancelled) {
            productNamesRef.current = { ...productNamesRef.current, ...Object.fromEntries(entries) };
            setProductNames(productNamesRef.current);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breakdown = {};
  for (const s of sessions) {
    const label = s.productId ? `Product: ${productNames[s.productId] || s.productId}` : s.path || "Unknown page";
    breakdown[label] = (breakdown[label] || 0) + 1;
  }
  const rows = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">Live Visitors</h1>
          <p className="text-sm text-brown/60 mt-2">
            Real-time count of people currently browsing the store (updates every 10s).
          </p>
        </div>

        <div className="bg-white border border-gold/30 rounded-lg p-6 mb-6 max-w-xs">
          <p className="text-xs uppercase tracking-widest2 text-sage mb-1">Active Right Now</p>
          <p className="text-4xl font-semibold text-brown-dark">{loading ? "…" : sessions.length}</p>
        </div>

        <div className="bg-white border border-gold/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-left text-xs uppercase tracking-widest2 text-brown-dark">
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3 text-right">Viewers</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-brown/60">
                    {loading ? "Loading..." : "No active visitors right now."}
                  </td>
                </tr>
              ) : (
                rows.map(([label, count]) => (
                  <tr key={label} className="border-t border-gold/20">
                    <td className="px-4 py-3 text-brown-dark">{label}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gold">{count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
