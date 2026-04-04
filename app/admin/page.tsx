"use client";

import React, { useEffect, useState } from "react";
import { Lock, Plus, Activity, FileText, Database, LogOut, ShieldAlert, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

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
  language?: string;
  category?: string;
  urgency?: string;
  isAnonymous?: boolean;
  created_at?: string;
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
  const { t } = useLanguage();
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
  const liveCenters = centers.length;
  const liveQueries = recentQueries.length;
  const liveAppointments = recentAppointments.length;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch {
      setError(t("admin.invalidCreds", "Invalid admin credentials"));
    }
  };

  const handleCenterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCenterMessage("");
    setSavingCenter(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/centers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: centerName,
          phone: centerPhone,
          address: centerAddress,
          categories: centerCategories.split(",").map((value) => value.trim()).filter(Boolean),
          languages: centerLanguages.split(",").map((value) => value.trim()).filter(Boolean),
          services: centerServices.split(",").map((value) => value.trim()).filter(Boolean),
          description: centerDescription,
          timings: centerTimings,
          emergency: centerEmergency,
          priority: centerPriority,
          freeServices: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save center");
      }

      const created = await response.json();
      setCenters((current) => [
        {
          id: created.id || `${Date.now()}`,
          name: centerName,
          address: centerAddress,
          phone: centerPhone,
          categories: centerCategories.split(",").map((value) => value.trim()).filter(Boolean),
        },
        ...current,
      ]);
      setCenterMessage(t("admin.centerSaved", "Center saved to database."));
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
    } catch {
      setCenterMessage(t("admin.centerSaveFailed", "Unable to save center right now."));
    } finally {
      setSavingCenter(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [centersResponse, queriesResponse, appointmentsResponse] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/api/centers/`),
          fetch(`${BACKEND_BASE_URL}/api/query/recent`),
          fetch(`${BACKEND_BASE_URL}/api/appointments/recent`),
        ]);

        const centersData = centersResponse.ok ? await centersResponse.json() : [];
        const queriesData = queriesResponse.ok ? await queriesResponse.json() : [];
        const appointmentsData = appointmentsResponse && appointmentsResponse.ok ? await appointmentsResponse.json() : [];

        setCenters(Array.isArray(centersData) ? centersData : []);
        setRecentQueries(Array.isArray(queriesData) ? queriesData : []);
        setRecentAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
        setCenters([]);
        setRecentQueries([]);
        setRecentAppointments([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/60 dark:border-zinc-800 max-w-sm w-full text-center p-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Lock className="w-8 h-8 text-[var(--color-deep-blue)] dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("admin.checking", "Checking access")}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t("admin.verifying", "Verifying your Firebase admin access.")}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("admin.access", "Admin Access")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t("admin.protectedDashboard", "Protected dashboard for managing centers and monitoring live queries.")}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("admin.adminEmail", "Admin Email")}
              className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("admin.password", "Password")}
              className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)] dark:focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-[var(--color-deep-blue)] text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-900 transition-colors">
              {t("admin.accessDashboard", "Access Dashboard")}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("admin.denied", "Access denied")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Your account is signed in, but it is not marked as admin.</p>
          <button onClick={logout} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-md transition-colors">
            {t("nav.signOut", "Sign out")}
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
              {t("admin.adminConsole", "Admin Console")}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t("admin.overview", "Dashboard Overview")}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">{t("admin.monitorDesc", "Monitor live queries and keep legal centers up to date from one place.")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-3 min-w-[190px]">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">{t("admin.systemStatus", "System Status")}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{loadingData ? t("admin.loadingLiveData", "Loading live data...") : t("admin.liveDataConnected", "Live data connected")}</p>
              </div>
            </div>
            <button onClick={logout} className="bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
              <LogOut className="w-4 h-4" />
              {t("nav.signOut", "Sign out")}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("admin.centers", "Centers")}</p>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{liveCenters}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("admin.liveRowsCenters", "Live rows from Firestore")}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("admin.queries", "Queries")}</p>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{liveQueries}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("admin.recentQueryRecords", "Recent query records")}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("admin.appointments", "Appointments")}</p>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{liveAppointments}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("admin.bookedRows", "Booked rows from the database")}</p>
              </div>
            </div>

            {/* Recent Queries */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[var(--color-deep-blue)] dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.recentQueries", "Recent Queries")}</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("admin.live", "Live")}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800 uppercase tracking-wide">
                      <th className="pb-3 pr-4 font-semibold">Timestamp</th>
                      <th className="pb-3 pr-4 font-semibold">{t("admin.category", "Category")}</th>
                      <th className="pb-3 pr-4 font-semibold">{t("admin.language", "Language")}</th>
                      <th className="pb-3 font-semibold">{t("admin.urgency", "Urgency")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200">
                    {recentQueries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          {t("admin.noRecentQueries", "No recent queries found.")}
                        </td>
                      </tr>
                    )}
                    {recentQueries.map((query) => (
                      <tr key={query.id} className="border-b border-gray-50 dark:border-zinc-800/80 last:border-b-0">
                        <td className="py-4 pr-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {query.created_at ? new Date(query.created_at).toLocaleString() : "Now"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-[var(--color-deep-blue)] dark:text-blue-300 px-3 py-1 font-semibold">
                            {query.category || "Unknown"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{query.language || "Unknown"}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${query.urgency === "high" ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300" : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"}`}>
                            {query.urgency || "normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[var(--color-saffron)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.recentAppointments", "Recent Appointments")}</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("admin.live", "Live")}</span>
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
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200">
                    {recentAppointments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          {t("admin.noRecentAppointments", "No recent appointments found.")}
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
                          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${appointment.status === "pending" ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300" : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"}`}>
                            {appointment.status || "pending"}
                          </span>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.manageCenters", "Manage Centers")}</h2>
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
                  {t("admin.noCentersFound", "No centers found in the database.")}
                </div>
              )}
            </div>
            
            <form className="space-y-4" onSubmit={handleCenterSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.centerName", "Center Name")}</label>
                <input required value={centerName} onChange={(e) => setCenterName(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="e.g. DLSA Borivali" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.contactSetup", "Contact Setup")}</label>
                <input required value={centerPhone} onChange={(e) => setCenterPhone(e.target.value)} type="tel" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Phone Number" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.coordinatesAddress", "Coordinates & Address")}</label>
                <textarea required value={centerAddress} onChange={(e) => setCenterAddress(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder={t("admin.fullAddress", "Full Address...")}></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.categories", "Categories")}</label>
                <input value={centerCategories} onChange={(e) => setCenterCategories(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="emergency, domestic, labor" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.languages", "Languages")}</label>
                <input value={centerLanguages} onChange={(e) => setCenterLanguages(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="en, hi, mr" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.services", "Services")}</label>
                <input value={centerServices} onChange={(e) => setCenterServices(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="free legal advice, referral" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.description", "Description")}</label>
                <textarea value={centerDescription} onChange={(e) => setCenterDescription(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="What this center specializes in..."></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.timings", "Timings")}</label>
                  <input value={centerTimings} onChange={(e) => setCenterTimings(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Mon-Sat 10AM-5PM" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">{t("admin.priority", "Priority")}</label>
                  <input value={centerPriority} onChange={(e) => setCenterPriority(Number(e.target.value))} type="number" min={0} max={100} className="w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white border border-transparent dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:focus:bg-zinc-950 focus:border-[var(--color-deep-blue)] outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input checked={centerEmergency} onChange={(e) => setCenterEmergency(e.target.checked)} type="checkbox" className="rounded border-gray-300 dark:border-zinc-700 text-[var(--color-deep-blue)] focus:ring-[var(--color-deep-blue)]" />
                {t("admin.emergencyCenter", "Emergency center")}
              </label>

              {centerMessage && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                  {centerMessage}
                </div>
              )}

              <div className="pt-2">
                <button disabled={savingCenter} className="w-full bg-black dark:bg-white dark:text-zinc-950 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-5 h-5"/> {savingCenter ? t("admin.saving", "Saving...") : t("admin.addToDatabase", "Add to Database")}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
