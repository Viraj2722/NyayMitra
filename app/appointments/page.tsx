"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, MapPin, Phone, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface Appointment {
  id: string;
  center_name: string;
  center_address: string;
  center_phone: string;
  date: string;
  time?: string;
  name: string;
  phone: string;
  issue_summary: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadAppointments = async () => {
      try {
        // In a real app, fetch appointments for current user from backend
        // For now, show dummy data
        setAppointments([
          {
            id: "1",
            center_name: "Delhi Women Legal Aid Center",
            center_address: "Plot 57, Sector 17, Delhi",
            center_phone: "+91-11-4141-4141",
            date: "2026-04-15",
            time: "2:30 PM",
            name: user.displayName || "User",
            phone: user.phoneNumber || "9876543210",
            issue_summary: "Workplace harassment and wage dispute",
            status: "confirmed",
            created_at: "2026-04-03"
          },
          {
            id: "2",
            center_name: "Labor Rights Collective - Mumbai",
            center_address: "123 Worli, Mumbai, Maharashtra",
            center_phone: "+91-22-6789-0123",
            date: "2026-04-20",
            time: "10:00 AM",
            name: user.displayName || "User",
            phone: user.phoneNumber || "9876543210",
            issue_summary: "Wage deduction without notice",
            status: "pending",
            created_at: "2026-04-02"
          }
        ]);
      } catch (error) {
        console.error("Error loading appointments", error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user, router]);

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
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
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
        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {t("appointments.title", "Your Appointments")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            {t("appointments.subtitle", "Track and manage your legal consultations with free legal aid centers")}
          </p>
        </div>

        {/* Appointments List */}
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
                style={{
                  animation: `slideUpFadeIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="capitalize">{appointment.status === "pending" ? t("appointments.awaiting", "Awaiting Confirmation") : t(`appointments.status.${appointment.status}`, appointment.status)}</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Center Info */}
                  <div className="lg:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.legalCenter", "Legal Center")}</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{appointment.center_name}</h3>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{appointment.center_address}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <a href={`tel:${appointment.center_phone}`} className="text-blue-600 hover:underline font-semibold">
                        {appointment.center_phone}
                      </a>
                    </div>
                  </div>

                  {/* Middle: Appointment Details */}
                  <div className="lg:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.dateTime", "Date & Time")}</p>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
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

                  {/* Right: Issue Summary */}
                  <div className="lg:col-span-1 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">{t("appointments.issueSummary", "Issue Summary")}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {appointment.issue_summary}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                        {t("appointments.viewDetails", "View Details")}
                      </button>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                        {t("appointments.cancel", "Cancel")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("appointments.bookedOn", "Booked on")} {new Date(appointment.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
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

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
