"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LogOut, User as UserIcon, Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  // Keep initial render deterministic to avoid hydration mismatch.
  const [theme, setTheme] = useState<"light" | "dark" | "unset">("unset");

  useEffect(() => {
    // Detect system preference and set accordingly
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
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
            
            {/* Contact Information */}
            <div className="hidden lg:block text-right mr-1 border-r border-gray-200 dark:border-zinc-700 pr-5 print:hidden">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Contact Us</div>
              <div className="text-xs font-semibold text-[var(--color-deep-blue)] dark:text-blue-300 flex items-center gap-1.5">
                <a href="tel:18001112222" className="hover:underline transition-all">1800-111-2222</a>
                <span className="opacity-40">•</span>
                <a href="mailto:admin@example.com" className="hover:underline transition-all">admin@example.com</a>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title={t("nav.toggleTheme", "Toggle Dark Mode")}
            >
              {theme === "unset" ? (
                <Sun className="w-5 h-5" />
              ) : theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1">
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="text-sm text-gray-700 dark:text-gray-200 hover:text-[var(--color-deep-blue)] dark:hover:text-blue-400 font-medium px-3 py-1.5 rounded-md transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/chat"
                        className="text-sm text-gray-700 dark:text-gray-200 hover:text-[var(--color-deep-blue)] dark:hover:text-blue-400 font-medium px-3 py-1.5 rounded-md transition-colors"
                      >
                        {t("nav.ask", "Ask")}
                      </Link>
                      <Link
                        href="/appointments"
                        className="text-sm text-gray-700 dark:text-gray-200 hover:text-[var(--color-deep-blue)] dark:hover:text-blue-400 font-medium px-3 py-1.5 rounded-md transition-colors"
                      >
                        {t("nav.appointments", "Appointments")}
                      </Link>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[var(--color-deep-blue)] dark:text-blue-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline">{isAdmin ? "Admin" : user.displayName || t("nav.user", "User")}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title={t("nav.signOut", "Sign out")}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[13px] font-semibold text-white bg-[var(--color-deep-blue)] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-1.5 rounded-md shadow-sm transition-all active:scale-95"
              >
                {t("nav.signIn", "Sign In")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
