"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, ShieldAlert, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check initial system preference or localStorage
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-[var(--color-deep-blue)] dark:text-blue-400 font-extrabold text-xl tracking-tight">
                Nyay<span className="text-[var(--color-saffron)]">Mitra</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title="Toggle Dark Mode"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setAnonymousMode(!anonymousMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                anonymousMode
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500/20"
                  : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {anonymousMode ? (
                <>
                  <Shield className="w-4 h-4" />
                  Protected
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Anonymous: OFF
                </>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[var(--color-deep-blue)] dark:text-blue-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline">{user.displayName || "User"}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[13px] font-semibold text-white bg-[var(--color-deep-blue)] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-1.5 rounded-md shadow-sm transition-all active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
