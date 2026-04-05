"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { syncUserToDataConnect } from "@/lib/dataConnect";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { LANGUAGE_STORAGE_KEY, type AppLanguage } from "@/context/LanguageContext";

const ADMIN_EMAIL = "admin@example.com";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, n: string, m?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const getPreferredLanguage = (): AppLanguage => {
    if (typeof window === "undefined") return "English";
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
    return saved || "English";
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) {
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (currentUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        await syncUserToDataConnect({
          uid: currentUser.uid,
          name: currentUser.displayName || "Admin",
          preferredLanguage: getPreferredLanguage(),
          mobile: currentUser.phoneNumber || undefined
        });
        setLoading(false);
        return;
      }

      setIsAdmin(false);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Data Connect Mapping
      if (result.user) {
        await syncUserToDataConnect({
          uid: result.user.uid,
          name: result.user.displayName || "Unknown",
          preferredLanguage: getPreferredLanguage(),
          mobile: result.user.phoneNumber || undefined
        });
        setUser(result.user);
        setIsAdmin(result.user.email === ADMIN_EMAIL);
      }
    } catch (error) {
      // Silently ignore cancelled popup requests (user-initiated cancellations)
      const errorCode = (error as any)?.code || "";
      if (errorCode === "auth/cancelled-popup-request") {
        console.debug("User cancelled the authentication popup");
        return;
      }
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password;
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
      setUser(result.user);
      setIsAdmin(result.user.email === ADMIN_EMAIL);
    } catch (error) {
      console.error("Error signing in with Email", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string, mobile?: string) => {
    // Note: To fully create a user in Firebase Auth with email/password:
    // import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        
        // Force reload the user and manually push to React state 
        // since `updateProfile` does not automatically fire `onAuthStateChanged`.
        await auth.currentUser?.reload();
        setUser(auth.currentUser);

        await syncUserToDataConnect({
          uid: result.user.uid,
          name: name,
          preferredLanguage: getPreferredLanguage(),
          mobile: mobile || result.user.phoneNumber || undefined
        });
      }
    } catch (error) {
      console.error("Error registering", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear all local state to reset the app flow (Safety prompt, Chat Session, Results)
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("nyaymitra_safety_status");
        sessionStorage.removeItem("nyaymitra_chat_session");
        
        // Loop through localStorage to remove all cached nyaymitra keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("nyaymitra_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Globally redirect to landing page
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
