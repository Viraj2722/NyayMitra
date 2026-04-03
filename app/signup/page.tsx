"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function SignupPage() {
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await registerWithEmail(email, password, name);
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err) {
      setError("Google sign up failed.");
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex justify-center items-center p-4 overflow-y-auto selection:bg-orange-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[360px] p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 relative z-10 transition-colors my-auto">
        
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 mb-3">
            <ShieldAlert className="w-5 h-5 text-[var(--color-saffron)]" />
          </div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-1">Create Account</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Join NyayMitra to securely access legal aid</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium mb-6 text-center border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 transition-all text-sm text-zinc-900 dark:text-white"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 transition-all text-sm text-zinc-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 transition-all text-sm text-zinc-900 dark:text-white"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--color-saffron)] hover:bg-orange-600 text-white font-bold py-2 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-2 text-sm"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
          <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase">Or continue with</span>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          type="button"
          className="w-full flex justify-center items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold py-2 rounded-lg shadow-sm transition-all active:scale-95 mb-4 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-center text-zinc-600 dark:text-zinc-400 text-xs font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-deep-blue)] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold ml-1 transition-colors">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
