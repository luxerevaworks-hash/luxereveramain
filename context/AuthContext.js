"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);

      if (!u) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function signup(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "customer",
      createdAt: serverTimestamp(),
    });
    return cred.user;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", cred.user.uid);
    const existing = await getDoc(userRef);

    await setDoc(
      userRef,
      {
        name: cred.user.displayName,
        email: cred.user.email,
        role: existing.exists() ? existing.data().role || "customer" : "customer",
        createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      },
      { merge: true }
    );
    return cred.user;
  }

  function logout() {
    return signOut(auth);
  }

  async function saveCheckoutDetails(details) {
    if (!auth.currentUser) return;

    const cleanAddress = {
      name: details.name?.trim() || "",
      phone: details.phone?.trim() || "",
      address: details.address?.trim() || "",
      city: details.city?.trim() || "",
      state: details.state?.trim() || "",
      pincode: details.pincode?.trim() || "",
    };
    const complete = Object.values(cleanAddress).every(Boolean);
    const existing = Array.isArray(profile?.savedAddresses) ? profile.savedAddresses : [];
    const matchingIndex = existing.findIndex((address) =>
      ["address", "city", "state", "pincode"].every((key) => address?.[key] === cleanAddress[key])
    );
    const savedAddresses = complete
      ? matchingIndex >= 0
        ? existing.map((address, index) => index === matchingIndex ? { ...address, ...cleanAddress } : address)
        : [...existing, { id: `address_${Date.now()}`, label: `Address ${existing.length + 1}`, ...cleanAddress }]
      : existing;

    await setDoc(doc(db, "users", auth.currentUser.uid), {
      name: details.name?.trim() || auth.currentUser.displayName || "",
      email: auth.currentUser.email || details.email?.trim() || "",
      phone: cleanAddress.phone,
      savedAddresses,
      defaultAddress: complete ? cleanAddress : profile?.defaultAddress || null,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setProfile((current) => current ? { ...current, savedAddresses, defaultAddress: complete ? cleanAddress : current.defaultAddress } : current);
  }

  const isAdmin = profile?.role === "admin";

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signup,
    login,
    loginWithGoogle,
    logout,
    saveCheckoutDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
