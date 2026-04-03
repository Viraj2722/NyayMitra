"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { syncUserToDataConnect } from "@/lib/dataConnect";
import { User, getIdTokenResult, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from "firebase/auth";

const ADMIN_EMAIL = "admin@example.com";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, n: string) => Promise<void>;
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
          preferredLanguage: "English",
          role: "admin"
        });
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(currentUser, true);
        const claims = tokenResult.claims as { admin?: boolean; role?: string };
        setIsAdmin(claims.admin === true || claims.role === "admin");
      } catch (error) {
        console.error("Error reading Firebase custom claims", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
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
          preferredLanguage: "English",
          role: "user"
        });
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with Email", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
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
          preferredLanguage: "English",
          role: "user"
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
