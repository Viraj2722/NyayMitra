"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  MapPin,
  CheckCircle,
  Shield,
  Calendar,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

type Center = {
  id: string;
  name: string;
  address: string;
  phone: string;
  categories?: string[];
  distance?: number;
  latitude?: number;
  longitude?: number;
};

export default function ResultsPage() {
  const { t } = useLanguage();
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [urgency, setUrgency] = useState<string>("normal");
  const [category, setCategory] = useState<string>(t("common.loading", "Loading..."));
  const { user } = useAuth();

  useEffect(() => {
    // Read from localStorage that was populated by app/chat/page.tsx
    try {
      const storedCategory = localStorage.getItem("nyaymitra_category");
      if (storedCategory) setCategory(storedCategory);

      const storedUrgency = localStorage.getItem("nyaymitra_urgent");
      if (storedUrgency)
        setUrgency(storedUrgency === "true" ? "high" : "normal");

      const storedCenters = localStorage.getItem("nyaymitra_centers");
      if (storedCenters) {
        setCenters(JSON.parse(storedCenters));
      } else {
        setCenters([
          {
            id: "fallback-1",
            name: "DLSA Offline Fallback",
            address: "Local Court Building",
            phone: "1800-111-111",
            distance: 2.5,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading legal centers from storage", error);
    } finally {
      setLoadingCenters(false);
    }
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const description = formData.get("description") as string;

    // Validation
    if (!name || !phone || !date || !description) {
      setError(t("results.formRequired", "Please fill in all required fields"));
      setIsSubmitting(false);
      return;
    }

    if (phone.length < 10 || phone.length > 13) {
      setError(t("results.formPhone", "Please enter a valid phone number"));
      setIsSubmitting(false);
      return;
    }

    try {
      const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
      const response = await fetch(`${BACKEND_BASE_URL}/api/appointments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user ? user.uid : "anonymous",
          center_id: selectedCenter!.id.toString(),
          center_name: selectedCenter!.name,
          center_address: selectedCenter!.address,
          center_phone: selectedCenter!.phone,
          name,
          phone,
          issue_summary: description,
          date,
          time,
          status: "pending",
        }),
      });

      if (response.ok) {
        setIsBooking(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(t("results.formSubmitError", "Failed to book appointment. Please try again."));
      }
    } catch (err) {
      console.error("Error booking appointment", err);
      setError(t("results.formUnexpected", "An unexpected error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 flex flex-col items-center">
      {urgency === "high" && (
        <div className="w-full bg-red-600 text-white font-semibold py-3 px-4 flex justify-center items-center gap-2">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <span>
            {t("results.urgent", "Need immediate help? Call Women Helpline: 181, Police: 100")}
          </span>
        </div>
      )}

      <main className="w-full max-w-4xl px-4 py-8 space-y-10">
        {/* Header & Category */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-[var(--color-deep-blue)] font-bold text-sm shadow-sm capitalize">
            <span className="w-2 h-2 rounded-full bg-[var(--color-deep-blue)]" />
            {t("results.category", "Category Detected")}: {category}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("results.title", "Your Legal Guidance")}
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            {t("results.subtitle", "Based on your description, here are your rights under Indian Law and the next steps to take.")}
          </p>
        </div>

        {/* Know Your Rights - Animated Cards */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-200">
            <Shield className="w-6 h-6 text-[var(--color-saffron)]" />
            <h2 className="text-2xl font-bold text-gray-800">
              {t("results.rights", "Know Your Rights")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: t("results.right1.title", "Right to Wages"),
                desc: t("results.right1.desc", "You are entitled to be paid within 7 days of the wage period under the Payment of Wages Act."),
              },
              {
                title: t("results.right2.title", "Protection from Unfair Dismissal"),
                desc: t("results.right2.desc", "An employer must provide proper notice before termination under the Industrial Disputes Act."),
              },
              {
                title: t("results.right3.title", "Right to Free Legal Aid"),
                desc: t("results.right3.desc", "As a worker earning less than ₹3 Lakh/year, you qualify for entirely free legal representation."),
              },
            ].map((right, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 opacity-0 relative overflow-hidden group"
                style={{
                  animation: `slideUpFadeIn 0.6s ease-out forwards`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-saffron)] transition-all group-hover:w-2" />
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {right.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {right.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Next Steps & Centers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-200">
              <CheckCircle className="w-6 h-6 text-[var(--color-deep-blue)]" />
              <h2 className="text-2xl font-bold text-gray-800">{t("results.nextSteps", "Next Steps")}</h2>
            </div>
            <ol className="space-y-6 relative border-l-2 border-blue-100 ml-3">
              <li className="pl-6 relative">
                <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[var(--color-deep-blue)] text-white flex items-center justify-center text-xs font-bold ring-4 ring-zinc-50">
                  1
                </span>
                <h4 className="font-bold text-gray-800">{t("results.gatherEvidence", "Gather Evidence")}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t("results.gatherEvidenceDesc", "Collect all employment contracts, ID cards, and WhatsApp messages with your employer.")}
                </p>
              </li>
              <li className="pl-6 relative">
                <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[var(--color-deep-blue)] text-white flex items-center justify-center text-xs font-bold ring-4 ring-zinc-50">
                  2
                </span>
                <h4 className="font-bold text-gray-800">{t("results.draftComplaint", "Draft a Complaint")}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t("results.draftComplaintDesc", "Write a simple timeline of events in your preferred language.")}
                </p>
              </li>
              <li className="pl-6 relative">
                <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[var(--color-deep-blue)] text-white flex items-center justify-center text-xs font-bold ring-4 ring-zinc-50">
                  3
                </span>
                <h4 className="font-bold text-gray-800">{t("results.visitCenter", "Visit a Free Center")}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t("results.visitCenterDesc", "Book an appointment or walk into a Legal Aid center listed below.")}
                </p>
              </li>
            </ol>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-200">
              <MapPin className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                {t("results.centers", "Nearby Legal Centers")}
              </h2>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 overflow-hidden relative shadow-inner">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Mumbai+Courts+(Legal+Centers)&amp;t=&amp;z=11&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
              ></iframe>
            </div>

            <div className="space-y-3">
              {loadingCenters && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-500 shadow-sm">
                  {t("results.loadingCenters", "Loading legal centers from the database...")}
                </div>
              )}
              {!loadingCenters && centers.length === 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-500 shadow-sm">
                  {t("results.noCenters", "No legal centers found in the database.")}
                </div>
              )}
              {centers.map((center) => (
                <div
                  key={center.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{center.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {center.address}
                      {center.distance ? ` • ${center.distance} km` : ""}
                    </p>
                    <p className="text-xs font-medium text-[var(--color-deep-blue)] mt-1">
                      {center.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCenter(center);
                      setIsBooking(true);
                    }}
                    className="flex-shrink-0 bg-blue-50 text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)] hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {t("results.book", "Book")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Basic Keyframes for Tailwind JIT */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideUpFadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />

      {/* Appointment Booking Modal */}
      {isBooking && selectedCenter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-[slideUpFadeIn_0.3s_ease-out]">
            <div className="bg-[var(--color-deep-blue)] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5"/> {t("results.bookConsultation", "Book Consultation")}</h3>
              <button onClick={() => { setIsBooking(false); setError(null); }} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("results.center", "Center")}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedCenter.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{selectedCenter.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("results.yourName", "Your Name")} <span className="text-red-500">*</span></label>
                <input 
                  required 
                  name="name" 
                  defaultValue={user?.displayName || ""} 
                  type="text" 
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  placeholder={t("results.namePlaceholder", "Ramesh Kumar")} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("results.phoneNumber", "Phone Number")} <span className="text-red-500">*</span></label>
                <input 
                  required 
                  name="phone" 
                  type="tel" 
                  pattern="[0-9]{10,13}"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  placeholder={t("results.phonePlaceholder", "9876543210")} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("results.preferredDate", "Preferred Date")} <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    name="date" 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("results.timeOptional", "Time (Optional)")}</label>
                  <input 
                    name="time" 
                    type="time" 
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("results.briefDescription", "Brief Description")} <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  name="description" 
                  rows={3} 
                  maxLength={500}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" 
                  placeholder={t("results.descriptionPlaceholder", "Explain your legal issue briefly (e.g., unpaid wages, harassment, contract dispute)...")}
                ></textarea>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("results.descriptionHelp", "This helps the legal advisor prepare for your consultation")}</p>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[var(--color-saffron)] hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
                >
                  {isSubmitting ? t("results.booking", "Booking...") : t("results.confirmBooking", "Confirm Booking")}
                </button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium flex justify-center items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5"/> {t("results.confidential", "All information is kept completely confidential.")}
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-900 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-3 animate-[slideUpFadeIn_0.3s_ease-out] z-50">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>{t("results.requestSent", "Your appointment request has been sent!")}</span>
        </div>
      )}
    </div>
  );
}
