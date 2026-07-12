"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const requestedDestination = searchParams.get("redirect");
  const destination =
    requestedDestination?.startsWith("/") && !requestedDestination.startsWith("//")
      ? requestedDestination
      : "/account";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.replace(destination);
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.replace(destination);
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark text-center mb-8">
        Sign In
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gold/40" />
        <span className="text-xs text-brown/60">OR</span>
        <div className="flex-1 h-px bg-gold/40" />
      </div>

      <button onClick={handleGoogle} disabled={loading} className="btn-outline w-full">
        Continue with Google
      </button>

      <p className="text-center text-sm text-brown/70 mt-6">
        Don&apos;t have an account?{" "}
        <Link href={`/signup?redirect=${encodeURIComponent(destination)}`} className="text-rosewood font-semibold">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
