"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, Plus, Activity, Database, LogOut, ShieldAlert, Calendar, BarChart3, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createLegalAidCenterDataConnect } from "@/lib/dataConnect";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";

type Center = {
  id: string;
  name: string;
  address: string;
  phone: string;
  categories?: string[];
};

type QueryRow = {
  id: string;
  translated_keywords?: string;
  detectedLanguage?: string;
  selectedResponseLanguage?: string;
  language?: string;
  category?: string;
  urgency?: string;
  isAnonymous?: boolean;
  created_at?: string;
  queryText?: string;
};

type AppointmentRow = {
  id: string;
  user_id?: string;
  center_id?: string;
  center_name?: string;
  center_address?: string;
  center_phone?: string;
  name?: string;
  phone?: string;
  issue_summary?: string;
  date?: string;
  time?: string;
  status?: string;
  created_at?: string;
};

export default function AdminPage() {
  const { user, isAdmin, loading, signInWithEmail, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [centerName, setCenterName] = useState("");
  const [centerPhone, setCenterPhone] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerCategories, setCenterCategories] = useState("emergency, general");
  const [centerLanguages, setCenterLanguages] = useState("en, hi");
  const [centerServices, setCenterServices] = useState("free legal advice, referral");
  const [centerDescription, setCenterDescription] = useState("");
  const [centerTimings, setCenterTimings] = useState("Mon-Sat 10AM-5PM");
  const [centerEmergency, setCenterEmergency] = useState(true);
  const [centerPriority, setCenterPriority] = useState(10);
  const [centerMessage, setCenterMessage] = useState("");
  const [savingCenter, setSavingCenter] = useState(false);
  const [centers, setCenters] = useState<Center[]>([]);
  const [recentQueries, setRecentQueries] = useState<QueryRow[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<AppointmentRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [adminActionMessage, setAdminActionMessage] = useState("");
  const liveCenters = centers.length;
  const liveQueries = recentQueries.length;
  const liveAppointments = recentAppointments.length;

  const queryAnalytics = useMemo(() => {
    const total = recentQueries.length;
    const categoryCounts: Record<string, number> = {};
    let highUrgency = 0;

    for (const row of recentQueries) {
      const category = (row.category || "Unknown").trim();
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      if ((row.urgency || "normal") === "high") {
        highUrgency += 1;
      }
    }

    const categories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));

    const highUrgencyPercent = total > 0 ? Math.round((highUrgency / total) * 100) : 0;

    return {
      total,
      categories,
      highUrgency,
      highUrgencyPercent,
    };
  }, [recentQueries]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch {
      setError("Invalid admin credentials");
    }
  };

  const handleCenterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCenterMessage("");
    setSavingCenter(true);

    try {
      const categories = centerCategories
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const languages = centerLanguages
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const services = centerServices
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const created = await createLegalAidCenterDataConnect({
        name: centerName,
        phone: centerPhone,
        address: centerAddress,
        categories,
        languages,
        services,
        description: centerDescription,
        timings: centerTimings,
        emergency: centerEmergency,
        priority: centerPriority,
        freeServices: true,
        latitude: 0,
        longitude: 0,
      });

      if (!created.ok) {
        throw new Error(created.error || "Failed to save center");
      }

      setCenterMessage(
        created.mode === "dataconnect"
          ? created.mirrored
            ? "Center saved to Data Connect and mirrored to Firestore dashboard."
            : "Center saved to Data Connect, but the Firestore mirror could not be verified."
          : "Data Connect create op was unavailable, so the center was saved to the Firestore mirror instead.",
      );
      setCenterName("");
      setCenterPhone("");
      setCenterAddress("");
      setCenterCategories("emergency, general");
      setCenterLanguages("en, hi");
      setCenterServices("free legal advice, referral");
      setCenterDescription("");
      setCenterTimings("Mon-Sat 10AM-5PM");
      setCenterEmergency(true);
      setCenterPriority(10);
    } catch (err) {
      if (err instanceof Error) {
        setCenterMessage(err.message);
      } else {
        setCenterMessage("Unable to save the center right now.");
      }
    } finally {
      setSavingCenter(false);
    }
  };

  const normalizeTimestamp = (value: unknown) => {
    if (value instanceof Timestamp) {
      return value.toDate().toISOString();
    }

    if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }

    if (typeof value === "string") {
      return value;
    }

    return undefined;
  };

  const normalizeAppointmentStatus = (value: unknown): "pending" | "confirmed" | "completed" => {
    const normalized = String(value || "pending").toLowerCase();
    if (normalized === "confirmed" || normalized === "completed") {
      return normalized;
    }
    return "pending";
  };

  const getAppointmentStatusClass = (status?: string) => {
    const normalized = normalizeAppointmentStatus(status);
    if (normalized === "pending") {
      return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
    }
    if (normalized === "confirmed") {
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    }
    return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300";
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: "pending" | "confirmed" | "completed",
  ) => {
    try {
      setUpdatingAppointmentId(appointmentId);
      setError("");
      setAdminActionMessage("");

      await updateDoc(doc(db, "appointments", appointmentId), {
        status,
        updated_at: serverTimestamp(),
      });

      setAdminActionMessage(`Appointment updated to ${status}.`);
    } catch (actionError) {
      console.error("Failed to update appointment status", actionError);
      setError("Unable to update appointment status right now.");
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const confirmed = window.confirm("Delete this appointment permanently?");
      if (!confirmed) {
        return;
      }

      setDeletingAppointmentId(appointmentId);
      setError("");
      setAdminActionMessage("");
      await deleteDoc(doc(db, "appointments", appointmentId));
      setAdminActionMessage("Appointment deleted successfully.");
    } catch (actionError) {
      console.error("Failed to delete appointment", actionError);
      setError("Unable to delete appointment right now.");
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  const loadData = useCallback(() => {
    const centersQuery = query(collection(db, "centers"));
    const liveQueriesQuery = query(collection(db, "live_queries"), orderBy("created_at", "desc"), limit(10));
    const appointmentsQuery = query(collection(db, "appointments"), orderBy("created_at", "desc"), limit(10));

    const unsubscribeCenters = onSnapshot(
      centersQuery,
      (snapshot) => {
        const centerRows = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Center, "id">),
        }));
        centerRows.sort((left, right) => {
          const leftEmergency = Boolean((left as { emergency?: boolean }).emergency);
          const rightEmergency = Boolean((right as { emergency?: boolean }).emergency);
          if (leftEmergency !== rightEmergency) {
            return leftEmergency ? -1 : 1;
          }
          const leftPriority = Number((left as { priority?: number }).priority || 0);
          const rightPriority = Number((right as { priority?: number }).priority || 0);
          if (leftPriority !== rightPriority) {
            return rightPriority - leftPriority;
          }
          return (left.name || "").localeCompare(right.name || "");
        });
        setCenters(centerRows);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoadingData(false);
        setError("");
      },
      (listenerError) => {
        console.error("Failed to load live centers", listenerError);
        setError("Live Firestore data is unavailable. Check Firestore rules and refresh this page.");
        setLoadingData(false);
      },
    );

    const unsubscribeQueries = onSnapshot(
      liveQueriesQuery,
      (snapshot) => {
        const queryRows = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            translated_keywords: data.translated_keywords,
            detectedLanguage: data.detectedLanguage,
            selectedResponseLanguage: data.selectedResponseLanguage,
            language: data.detectedLanguage || data.selectedResponseLanguage || "Unknown",
            category: data.legalCategoryDetected || data.category || "Unknown",
            urgency: data.isUrgent ? "high" : "normal",
            isAnonymous: data.isAnonymous,
            created_at: normalizeTimestamp(data.created_at),
            queryText: data.queryText,
          };
        });

        setRecentQueries(queryRows);
        setLastUpdated(new Date().toLocaleTimeString());
      },
      (listenerError) => {
        console.error("Failed to load live queries", listenerError);
        setError("Live query data is unavailable right now.");
      },
    );

    const unsubscribeAppointments = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const appointmentRows = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (String(data.status || "pending").toLowerCase() === "cancelled") {
              return null;
            }

            return {
              id: doc.id,
              user_id: data.user_id,
              center_id: data.center_id,
              center_name: data.center_name,
              center_address: data.center_address,
              center_phone: data.center_phone,
              name: data.name,
              phone: data.phone,
              issue_summary: data.issue_summary,
              date: data.date,
              time: data.time,
              status: normalizeAppointmentStatus(data.status),
              created_at: normalizeTimestamp(data.created_at),
            };
          })
          .filter((row): row is AppointmentRow => Boolean(row));

        setRecentAppointments(appointmentRows);
        setLastUpdated(new Date().toLocaleTimeString());
      },
      (listenerError) => {
        console.error("Failed to load live appointments", listenerError);
        setError("Live appointment data is unavailable right now.");
      },
    );

    return () => {
      unsubscribeCenters();
      unsubscribeQueries();
      unsubscribeAppointments();
    };
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    const cleanup = loadData();

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [user, isAdmin, loadData]);

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/60 dark:border-zinc-800 max-w-sm w-full text-center p-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Lock className="w-8 h-8 text-[var(--color-deep-blue)] dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checking access</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Verifying your Firebase admin access.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 bg-gradient-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-8 rounded-3xl shadow-xl border border-white/60 dark:border-zinc-800 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[var(--color-deep-blue)] dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Protected dashboard for managing centers and monitoring live queries.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-[var(--color-deep-blue)] text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-900 transition-colors">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 bg-gradient-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-8 rounded-3xl shadow-xl border border-white/60 dark:border-zinc-800 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access denied</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Your account is signed in, but it is not marked as admin.</p>
          <button onClick={logout} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-md transition-colors">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-zinc-50 via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        <header className="rounded-3xl border border-white/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur shadow-sm p-5 md:p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[var(--color-deep-blue)] dark:text-blue-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
              Admin Console
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">Monitor live queries and keep legal centers up to date from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-3 min-w-[190px]">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">System Status</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{loadingData ? "Loading live data..." : "Live data connected"}</p>
              </div>
            </div>
            <button onClick={logout} className="bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {error}
          </div>
        )}

        {adminActionMessage && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            {adminActionMessage}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
          <span>Live Firestore listeners active.</span>
          <span>{lastUpdated ? `Last updated at ${lastUpdated}` : "Waiting for first snapshot..."}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Centers</p>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{liveCenters}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Live rows from Firestore</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Queries</p>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{liveQueries}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recent query records</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Appointments</p>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{liveAppointments}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Booked rows from the database</p>
              </div>
            </div>

            {/* Query Analytics */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[var(--color-deep-blue)] dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Query Analytics</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Live</span>
              </div>

              {queryAnalytics.total === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No recent queries found.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-4">
                      <p className="text-[11px] uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">Total Queries</p>
                      <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{queryAnalytics.total}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-4">
                      <p className="text-[11px] uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">High Urgency</p>
                      <p className="mt-2 text-3xl font-extrabold text-red-700 dark:text-red-300">{queryAnalytics.highUrgency}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-4">
                      <p className="text-[11px] uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">Urgency Rate</p>
                      <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{queryAnalytics.highUrgencyPercent}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Top Categories</h3>
                      <div className="space-y-3">
                        {queryAnalytics.categories.map((item) => {
                          const percent = Math.max(6, Math.round((item.count / queryAnalytics.total) * 100));
                          return (
                            <div key={`cat-${item.label}`}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                                <span className="text-gray-500 dark:text-gray-400">{item.count}</span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                <div className="h-full rounded-full bg-[var(--color-deep-blue)]" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[var(--color-saffron)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Appointments</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Live</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800 uppercase tracking-wide">
                      <th className="pb-3 pr-4 font-semibold">Timestamp</th>
                      <th className="pb-3 pr-4 font-semibold">User</th>
                      <th className="pb-3 pr-4 font-semibold">Center</th>
                      <th className="pb-3 pr-4 font-semibold">Date</th>
                      <th className="pb-3 pr-4 font-semibold">Status</th>
                      <th className="pb-3 pr-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200">
                    {recentAppointments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No recent appointments found.
                        </td>
                      </tr>
                    )}
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-gray-50 dark:border-zinc-800/80 last:border-b-0">
                        <td className="py-4 pr-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {appointment.created_at ? new Date(appointment.created_at).toLocaleString() : "Now"}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{appointment.name || "Anonymous"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{appointment.phone || "No phone"}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{appointment.center_name || appointment.center_id || "Unknown center"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{appointment.center_address || ""}</div>
                        </td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{appointment.date || "Unknown"}{appointment.time ? `, ${appointment.time}` : ""}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold capitalize ${getAppointmentStatusClass(appointment.status)}`}>
                            {normalizeAppointmentStatus(appointment.status)}
                          </span>
                        </td>
                        <td className="py-4 pr-0 text-right">
                          <div className="inline-flex items-center gap-2">
                            {normalizeAppointmentStatus(appointment.status) === "pending" && (
                              <button
                                type="button"
                                onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                disabled={updatingAppointmentId === appointment.id || deletingAppointmentId === appointment.id}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 disabled:opacity-60"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Confirm
                              </button>
                            )}
                            {normalizeAppointmentStatus(appointment.status) === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                disabled={updatingAppointmentId === appointment.id || deletingAppointmentId === appointment.id}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 disabled:opacity-60"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                              </button>
                            )}
                            {normalizeAppointmentStatus(appointment.status) === "completed" && (
                              <button
                                type="button"
                                onClick={() => updateAppointmentStatus(appointment.id, "pending")}
                                disabled={updatingAppointmentId === appointment.id || deletingAppointmentId === appointment.id}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/20 disabled:opacity-60"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reopen
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteAppointment(appointment.id)}
                              disabled={updatingAppointmentId === appointment.id || deletingAppointmentId === appointment.id}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingAppointmentId === appointment.id ? "Deleting" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Legal Center Form (UI Only) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 self-start sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Database className="w-6 h-6 text-[var(--color-saffron)]" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Centers</h2>
            </div>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {centers.map((center) => (
                <div key={center.id} className="bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-3 transition-colors">
                  <div className="font-semibold text-gray-900 dark:text-white">{center.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{center.address}</div>
                  <div className="text-xs text-[var(--color-deep-blue)] dark:text-blue-300 mt-1">{center.phone}</div>
                </div>
              ))}
              {!loadingData && centers.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 p-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50/60 dark:bg-zinc-950/60">
                  No centers found in the database.
                </div>
              )}
            </div>
            
            <form className="space-y-4" onSubmit={handleCenterSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Center Name</label>
                <input required value={centerName} onChange={(e) => setCenterName(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="e.g. DLSA Borivali" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Contact Setup</label>
                <input required value={centerPhone} onChange={(e) => setCenterPhone(e.target.value)} type="tel" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Phone Number" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Address</label>
                <textarea required value={centerAddress} onChange={(e) => setCenterAddress(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Full address..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Categories</label>
                <input value={centerCategories} onChange={(e) => setCenterCategories(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="emergency, domestic, labor" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Languages</label>
                <input value={centerLanguages} onChange={(e) => setCenterLanguages(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="en, hi, mr" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Services</label>
                <input value={centerServices} onChange={(e) => setCenterServices(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="free legal advice, referral" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Description</label>
                <textarea value={centerDescription} onChange={(e) => setCenterDescription(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="What this center specializes in..."></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Timings</label>
                  <input value={centerTimings} onChange={(e) => setCenterTimings(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Mon-Sat 10AM-5PM" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">Priority</label>
                  <input value={centerPriority} onChange={(e) => setCenterPriority(Number(e.target.value))} type="number" min={0} max={100} className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input checked={centerEmergency} onChange={(e) => setCenterEmergency(e.target.checked)} type="checkbox" className="rounded border-gray-300 dark:border-zinc-700 text-[var(--color-deep-blue)] focus:ring-[var(--color-deep-blue)]" />
                Emergency center
              </label>

              {centerMessage && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                  {centerMessage}
                </div>
              )}

              <div className="pt-2">
                <button disabled={savingCenter} className="w-full bg-black dark:bg-white dark:text-zinc-950 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-5 h-5"/> {savingCenter ? "Saving..." : "Add to Database"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
