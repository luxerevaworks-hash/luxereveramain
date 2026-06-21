import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9jWXO77-ek8Uvte0OUQjmcySod3MCtXc",
  authDomain: "luxerevamain.firebaseapp.com",
  projectId: "luxerevamain",
  storageBucket: "luxerevamain.firebasestorage.app",
  messagingSenderId: "327937927877",
  appId: "1:327937927877:web:ce34a484ff2ee24e2cdeac",
  measurementId: "G-G237MTRDCN",
};

// Avoid re-initializing the app on hot reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;
export default app;
