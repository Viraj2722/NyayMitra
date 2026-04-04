"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, MapPin, Phone, AlertCircle, ArrowRight, X, Navigation, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface Appointment {
  id: string;
  center_name?: string;
  center_address?: string;
  center_phone?: string;
  date: string;
  time?: string;
  name: string;
  phone: string;
  issue_summary?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at?: string;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const cacheKey = user?.uid ? `nyaymitra_appointments_${user.uid}` : null;

  const readCachedAppointments = useCallback(() => {
    if (!cacheKey || typeof window === "undefined") {
      return [] as Appointment[];
    }

    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        return [] as Appointment[];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as Appointment[];
    }
  }, [cacheKey]);

  const persistAppointments = useCallback((rows: Appointment[]) => {
    if (!cacheKey || typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify(rows));
    } catch {
      // Ignore storage failures in private mode or on constrained devices.
    }
  }, [cacheKey]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadAppointments = async () => {
      try {
        setError(null);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/appointments/mine?user_id=${encodeURIComponent(user.uid)}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Appointment load failed with status ${response.status}`);
          }

          const data = await response.json();
          const nextAppointments = Array.isArray(data) ? data : [];
          setAppointments(nextAppointments);
          persistAppointments(nextAppointments);
        } finally {
          window.clearTimeout(timeoutId);
        }
      } catch {
        const cachedAppointments = readCachedAppointments();
        if (cachedAppointments.length > 0) {
          setAppointments(cachedAppointments);
          setError(t("appointments.offlineFallback", "Live data is unavailable right now, so saved appointments are shown instead."));
        } else {
          setAppointments([]);
          setError(t("appointments.loadError", "Failed to load appointments. Please try again."));
        }
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user, router, t, persistAppointments, readCachedAppointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-green-200 text-green-700";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const updateAppointmentInState = (updated: Appointment) => {
    const nextAppointments = appointments.map((item) => (item.id === updated.id ? updated : item));
    setAppointments(nextAppointments);
    persistAppointments(nextAppointments);
    setSelectedAppointment(updated);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      setError(t("appointments.cannotCancel", "This appointment can no longer be cancelled."));
      return;
    }

    const confirmed = window.confirm(t("appointments.cancelConfirm", "Cancel this appointment request?"));
    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(appointment.id);
      setError(null);
      setActionMessage(null);

      const response = await fetch(`${BACKEND_BASE_URL}/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      const updated = (await response.json()) as Appointment;
      updateAppointmentInState(updated);
      setActionMessage(t("appointments.cancelled", "Appointment cancelled successfully."));
    } catch {
      setError(t("appointments.cancelFailed", "Unable to cancel this appointment right now."));
    } finally {
      setCancellingId(null);
    }
  };

  const openDirections = (appointment: Appointment) => {
    const query = encodeURIComponent(appointment.center_address || appointment.center_name || "legal aid center");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-zinc-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-blue-100 rounded-full animate-spin">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">{t("appointments.loading", "Loading your appointments...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-zinc-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-3 pt-4">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {t("appointments.title", "Your Appointments")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            {t("appointments.subtitle", "Track and manage your legal consultations with free legal aid centers")}
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-blue-200 dark:border-gray-700 p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("appointments.none", "No appointments yet")}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("appointments.noneDesc", "Submit a legal query and book an appointment with a legal aid center to get started.")}
            </p>
            <button
              onClick={() => router.push("/chat")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors mt-4"
            >
              {t("appointments.submitQuery", "Submit Legal Query")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-l-4 border-blue-600"
                style={{ animation: `slideUpFadeIn 0.5s ease-out ${index * 0.1}s both` }}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="capitalize">
                    {appointment.status === "pending"
                      ? t("appointments.awaiting", "Awaiting Confirmation")
                      : t(`appointments.status.${appointment.status}`, appointment.status)}
                  </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.legalCenter", "Legal Center")}</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{appointment.center_name}</h3>
                    </div>
                    {appointment.center_address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 dark:text-gray-300">{appointment.center_address}</p>
                      </div>
                    )}
                    {appointment.center_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <a href={`tel:${appointment.center_phone}`} className="text-blue-600 hover:underline font-semibold">
                          {appointment.center_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.dateTime", "Date & Time")}</p>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {new Date(appointment.date).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                        </p>
                        {appointment.time && (
                          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {appointment.time}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.yourDetails", "Your Details")}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.phone}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.issueSummary", "Issue Summary")}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {appointment.issue_summary || t("appointments.noSummary", "No summary provided")}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(appointment)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        {t("appointments.viewDetails", "View Details")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appointment)}
                        disabled={cancellingId === appointment.id || appointment.status === "cancelled" || appointment.status === "completed"}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        {cancellingId === appointment.id ? t("appointments.cancelling", "Cancelling...") : t("appointments.cancel", "Cancel")}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {appointment.center_phone && (
                        <a
                          href={`tel:${appointment.center_phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold py-2 rounded-lg transition-colors text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          {t("appointments.callCenter", "Call Center")}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => openDirections(appointment)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        {t("appointments.directions", "Directions")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("appointments.bookedOn", "Booked on")} {appointment.created_at ? new Date(appointment.created_at).toLocaleDateString("en-IN") : t("common.now", "Now")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-300">
            {actionMessage}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 dark:text-white">{t("appointments.important", "Important Information")}</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-1">
                <li>{t("appointments.tip1", "✓ Arrive 15 minutes before your scheduled time")}</li>
                <li>{t("appointments.tip2", "✓ Bring relevant documents (employment contract, ID, etc.)")}</li>
                <li>{t("appointments.tip3", "✓ All consultations are confidential and free")}</li>
                <li>{t("appointments.tip4", "✓ Call the center ahead if you need to reschedule")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100">{t("appointments.details", "Appointment Details")}</p>
                <h3 className="text-xl font-bold">{selectedAppointment.center_name || t("appointments.legalCenter", "Legal Center")}</h3>
              </div>
              <button type="button" onClick={() => setSelectedAppointment(null)} className="rounded-full p-2 hover:bg-white/15 transition-colors" aria-label={t("common.close", "Close")}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("appointments.dateTime", "Date & Time")}</p>
                  <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{new Date(selectedAppointment.date).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAppointment.time || t("appointments.timeFlexible", "Flexible time")}</p>
                </div>

                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("appointments.statusLabel", "Status")}</p>
                  <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedAppointment.status}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAppointment.created_at ? new Date(selectedAppointment.created_at).toLocaleString("en-IN") : t("common.now", "Now")}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("appointments.yourDetails", "Your Details")}</p>
                  <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{selectedAppointment.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAppointment.phone}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("appointments.issueSummary", "Issue Summary")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{selectedAppointment.issue_summary || t("appointments.noSummary", "No summary provided")}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("appointments.legalCenter", "Legal Center")}</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedAppointment.center_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAppointment.center_address}</p>
                {selectedAppointment.center_phone && (
                  <a href={`tel:${selectedAppointment.center_phone}`} className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
                    <Phone className="w-4 h-4" />
                    {selectedAppointment.center_phone}
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleCancelAppointment(selectedAppointment)}
                  disabled={cancellingId === selectedAppointment.id || selectedAppointment.status === "cancelled" || selectedAppointment.status === "completed"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-3 font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingId === selectedAppointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("appointments.cancel", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => openDirections(selectedAppointment)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
                >
                  <Navigation className="w-4 h-4" />
                  {t("appointments.directions", "Directions")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUpFadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
