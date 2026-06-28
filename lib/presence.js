import { collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { nanoid } from "nanoid";

const SESSION_KEY = "luxereva_session_id";
const ACTIVE_WINDOW_MS = 60000; // a session counts as "active" if seen in the last 60s

export function getSessionId() {
  if (typeof window === "undefined") return null;
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = nanoid();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function sendHeartbeat({ path, productId }) {
  const sessionId = getSessionId();
  if (!sessionId) return;
  try {
    await setDoc(
      doc(db, "presence", sessionId),
      { path, productId: productId || null, lastSeen: Timestamp.now() },
      { merge: true }
    );
  } catch (err) {
    console.error("presence heartbeat failed:", err);
  }
}

// Returns every presence doc seen in the last ACTIVE_WINDOW_MS — a single
// range filter on lastSeen, no composite index required.
export async function getActiveSessions() {
  const cutoff = Timestamp.fromMillis(Date.now() - ACTIVE_WINDOW_MS);
  const snap = await getDocs(query(collection(db, "presence"), where("lastSeen", ">", cutoff)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
