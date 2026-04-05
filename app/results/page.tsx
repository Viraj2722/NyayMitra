"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  MapPin,
  CheckCircle,
  Shield,
  Calendar,
  X,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, type AppLanguage } from "@/context/LanguageContext";
import { createAppointmentDataConnect } from "@/lib/dataConnect";
import jsPDF from "jspdf";

type Center = {
  id: string;
  name: string;
  address: string;
  phone: string;
  categories?: string[];
  distance?: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  freeServices?: boolean;
  source?: string;
};

type UserLocation = {
  lat: number;
  lng: number;
};

type RightCard = {
  title: string;
  desc: string;
};

type StepItem = {
  title: string;
  desc: string;
};

type EmergencyNumber = {
  name: string;
  number: string;
};

type CitationItem = {
  law_name: string;
  page?: number | null;
  source_url?: string;
  excerpt?: string;
};

type SafetyStatus = "unknown" | "safe" | "unsafe";

const SAFETY_STATUS_KEY = "nyaymitra_safety_status";

const DEFAULT_EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { name: "NALSA Helpline (Free)", number: "15100" },
  { name: "Women Helpline", number: "181" },
  { name: "Police", number: "100" },
  { name: "Child Helpline", number: "1098" },
  { name: "Senior Citizen", number: "14567" },
  { name: "Mental Health (iCall)", number: "9152987821" },
];

const PDF_BTN_LABELS: Record<AppLanguage, string> = {
  English: "Download Legal Report (PDF)",
  Hindi: "कानूनी रिपोर्ट डाउनलोड करें (PDF)",
  Marathi: "कायदेशीर अहवाल डाउनलोड करा (PDF)",
  Bengali: "আইনি প্রতিবেদন ডাউনলোড করুন (PDF)",
  Gujarati: "કાનૂની અહેવાલ ડાઉનલોડ કરો (PDF)",
  Tamil: "சட்ட அறிக்கையைப் பதிவிறக்கவும் (PDF)",
  Telugu: "చట్టపరమైన నివేదికను డౌన్‌లోడ్ చేయండి (PDF)",
  Kannada: "ಕಾನೂನು ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PDF)",
  Malayalam: "നിയമ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക (PDF)",
  Punjabi: "ਕਾਨੂੰਨੀ ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ (PDF)",
  Urdu: "قانونی رپورٹ ڈاؤن لوڈ کریں (PDF)",
};

const PDF_PROGRESS_LABELS: Record<AppLanguage, string> = {
  English: "Downloading report...",
  Hindi: "रिपोर्ट डाउनलोड हो रही है...",
  Marathi: "अहवाल डाउनलोड होत आहे...",
  Bengali: "রিপোর্ট ডাউনলোড হচ্ছে...",
  Gujarati: "રિપોર્ટ ડાઉનલોડ થઈ રહ્યો છે...",
  Tamil: "அறிக்கை பதிவிறக்கப்படுகிறது...",
  Telugu: "రిపోర్ట్ డౌన్‌లోడ్ అవుతోంది...",
  Kannada: "ವರದಿ ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
  Malayalam: "റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുന്നു...",
  Punjabi: "ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਹੋ ਰਹੀ ਹੈ...",
  Urdu: "رپورٹ ڈاؤن لوڈ ہو رہی ہے...",
};

const PDF_SUCCESS_LABELS: Record<AppLanguage, string> = {
  English: "Report downloaded successfully.",
  Hindi: "रिपोर्ट सफलतापूर्वक डाउनलोड हो गई।",
  Marathi: "अहवाल यशस्वीपणे डाउनलोड झाला.",
  Bengali: "রিপোর্ট সফলভাবে ডাউনলোড হয়েছে।",
  Gujarati: "રિપોર્ટ સફળતાપૂર્વક ડાઉનલોડ થયો.",
  Tamil: "அறிக்கை வெற்றிகரமாக பதிவிறங்கியது.",
  Telugu: "రిపోర్ట్ విజయవంతంగా డౌన్‌లోడ్ అయింది.",
  Kannada: "ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಯಿತು.",
  Malayalam: "റിപ്പോർട്ട് വിജയകരമായി ഡൗൺലോഡ് ചെയ്തു.",
  Punjabi: "ਰਿਪੋਰਟ ਸਫਲਤਾਪੂਰਵਕ ਡਾਊਨਲੋਡ ਹੋ ਗਈ ਹੈ।",
  Urdu: "رپورٹ کامیابی سے ڈاؤن لوڈ ہو گئی۔",
};

const PDF_FAILED_LABELS: Record<AppLanguage, string> = {
  English: "Could not download report. Please try again.",
  Hindi: "रिपोर्ट डाउनलोड नहीं हो पाई। कृपया फिर से प्रयास करें।",
  Marathi: "अहवाल डाउनलोड होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.",
  Bengali: "রিপোর্ট ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।",
  Gujarati: "રિપોર્ટ ડાઉનલોડ થઈ શક્યો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
  Tamil: "அறிக்கையை பதிவிறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  Telugu: "రిపోర్ట్ డౌన్‌లోడ్ కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
  Kannada: "ವರದಿ ಡೌನ್‌ಲೋಡ್ ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  Malayalam: "റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
  Punjabi: "ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਨਹੀਂ ਹੋਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  Urdu: "رپورٹ ڈاؤن لوڈ نہیں ہو سکی۔ براہ کرم دوبارہ کوشش کریں۔",
};

let cachedNotoSansDevanagariBase64: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const ensureUnicodePdfFont = async (pdf: jsPDF): Promise<string> => {
  const fontFileName = "NotoSansDevanagari-Regular.ttf";
  const fontAlias = "NotoSansDevanagari";

  if (!cachedNotoSansDevanagariBase64) {
    const response = await fetch(`/fonts/${fontFileName}`);
    if (!response.ok) {
      throw new Error(`Unable to load PDF font: ${response.status}`);
    }
    cachedNotoSansDevanagariBase64 = arrayBufferToBase64(
      await response.arrayBuffer(),
    );
  }

  pdf.addFileToVFS(fontFileName, cachedNotoSansDevanagariBase64);
  pdf.addFont(fontFileName, fontAlias, "normal");
  return fontAlias;
};

const needsUnicodeFont = (text: string): boolean => /[^\u0000-\u024F]/.test(text);

const sanitizePdfText = (text: string): string =>
  String(text ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeRights = (raw: unknown): RightCard[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { title: item, desc: "" };
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const title = String(obj.title ?? obj.right ?? obj.name ?? "").trim();
        const desc = String(
          obj.desc ?? obj.description ?? obj.detail ?? "",
        ).trim();
        if (!title && !desc) return null;
        return { title: title || "Legal Right", desc };
      }
      return null;
    })
    .filter((item): item is RightCard => Boolean(item));
};

const normalizeSteps = (raw: unknown): StepItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { title: item, desc: "" };
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const title = String(obj.title ?? obj.step ?? obj.action ?? "").trim();
        const desc = String(
          obj.desc ?? obj.description ?? obj.detail ?? "",
        ).trim();
        if (!title && !desc) return null;
        return { title: title || "Step", desc };
      }
      return null;
    })
    .filter((item): item is StepItem => Boolean(item));
};

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

const toNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed)
    ? parsed
    : undefined;
};

const normalizeCenter = (raw: unknown): Center | null => {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const latitude = toNumber(obj.latitude ?? obj.lat);
  const longitude = toNumber(obj.longitude ?? obj.lng);
  const name = String(obj.name ?? "").trim();
  const address = String(obj.address ?? "").trim();
  const phone = String(obj.phone ?? "").trim();
  const id = String(obj.id ?? `${name}-${address}-${phone}`).trim();

  if (!id || !name) return null;

  const categories = Array.isArray(obj.categories)
    ? obj.categories.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    id,
    name,
    address,
    phone,
    categories,
    distance: toNumber(obj.distance),
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    freeServices:
      typeof obj.freeServices === "boolean" ? obj.freeServices : undefined,
    source: typeof obj.source === "string" ? obj.source : undefined,
  };
};

const normalizeCenterList = (raw: unknown): Center[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map(normalizeCenter)
    .filter((item): item is Center => Boolean(item));
};

const normalizeEmergencyNumbers = (raw: unknown): EmergencyNumber[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const name = String(obj.name ?? obj.title ?? obj.label ?? "").trim();
      const number = String(
        obj.number ?? obj.phone ?? obj.contact ?? "",
      ).trim();

      if (!number) return null;

      return {
        name: name || "Emergency",
        number,
      };
    })
    .filter((item): item is EmergencyNumber => Boolean(item));
};

const normalizeCitations = (raw: unknown): CitationItem[] => {
  if (!Array.isArray(raw)) return [];

  const mapped: Array<CitationItem | null> = raw.map((item) => {
    if (typeof item === "string") {
      const text = item.trim();
      if (!text) return null;
      return {
        law_name: "Unverified Source",
        excerpt: text,
      };
    }

    if (!item || typeof item !== "object") return null;

    const obj = item as Record<string, unknown>;
    const lawName = String(obj.law_name ?? obj.law ?? "").trim();
    const sourceUrl = String(obj.source_url ?? obj.url ?? "").trim();
    const excerpt = String(obj.excerpt ?? obj.quote ?? "").trim();
    const pageValue = obj.page;
    const pageNumber =
      typeof pageValue === "number"
        ? pageValue
        : typeof pageValue === "string" && pageValue.trim().length > 0
          ? Number(pageValue)
          : null;

    if (!lawName && !sourceUrl && !excerpt) return null;

    return {
      law_name: lawName || "Legal Source",
      page: Number.isFinite(pageNumber as number)
        ? (pageNumber as number)
        : null,
      source_url: sourceUrl || undefined,
      excerpt: excerpt || undefined,
    };
  });

  return mapped.filter((item): item is CitationItem => item !== null);
};

const haversineKm = (from: UserLocation, to: UserLocation): number => {
  const radiusKm = 6371;
  const lat1 = (from.lat * Math.PI) / 180;
  const lng1 = (from.lng * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const lng2 = (to.lng * Math.PI) / 180;
  const deltaLat = lat2 - lat1;
  const deltaLng = lng2 - lng1;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const parseUserLocation = (raw: string | null): UserLocation | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { userLat?: unknown; userLng?: unknown };
    const lat = toNumber(parsed.userLat);
    const lng = toNumber(parsed.userLng);
    if (typeof lat === "number" && typeof lng === "number") {
      return { lat, lng };
    }
  } catch {
    return null;
  }

  return null;
};

const buildMapsQuery = (
  center: Center | null,
  userLocation: UserLocation | null,
): string => {
  if (center?.latitude != null && center?.longitude != null) {
    return `${center.latitude},${center.longitude}`;
  }

  if (center?.name) {
    return center.name;
  }

  if (userLocation) {
    return `${userLocation.lat},${userLocation.lng}`;
  }

  return "Nearby Legal Aid Center";
};

const getSafetyCopy = (language: string) => {
  const normalized = (language || "English").toLowerCase();

  if (
    normalized.includes("hindi") ||
    normalized.includes("हिंदी") ||
    normalized.includes("हिन्दी")
  ) {
    return {
      title: "सुरक्षा जांच",
      question: "क्या आप अभी सुरक्षित हैं?",
      subtitle:
        "यदि आप तुरंत खतरे में हैं, तो 'नहीं' दबाएं और तुरंत इमरजेंसी सहायता को कॉल करें।",
      yes: "हाँ",
      no: "नहीं",
      emergencyTitle: "तुरंत सहायता",
      emergencyAction: "आपने बताया कि आप सुरक्षित नहीं हैं। अभी कॉल करें।",
      forLabel: "के लिए",
      callNow: "अभी कॉल करें",
    };
  }

  if (normalized.includes("marathi") || normalized.includes("मराठी")) {
    return {
      title: "सुरक्षितता तपासणी",
      question: "तुम्ही आत्ता सुरक्षित आहात का?",
      subtitle:
        "तुम्हाला तात्काळ धोका असल्यास, 'नाही' निवडा आणि लगेच आपत्कालीन मदतला कॉल करा.",
      yes: "हो",
      no: "नाही",
      emergencyTitle: "आपत्कालीन मदत",
      emergencyAction: "तुम्ही सुरक्षित नसल्याचे सांगितले आहे. आत्ता कॉल करा.",
      forLabel: "साठी",
      callNow: "आत्ता कॉल करा",
    };
  }

  return {
    title: "Safety Check",
    question: "Are you safe right now?",
    subtitle:
      "If you are in immediate danger, tap No and call emergency support right away.",
    yes: "Yes",
    no: "No",
    emergencyTitle: "Emergency Support",
    emergencyAction: "You marked that you are not safe. Call now.",
    forLabel: "For",
    callNow: "Call Now",
  };
};

export default function ResultsPage() {
  const { t, language } = useLanguage();
  const selectedLanguage = language as AppLanguage;
  const { user } = useAuth();

  const getCategoryLabel = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("labor") || c.includes("work"))
      return t("intake.labor.label", "Work / Salary issue");
    if (c.includes("domestic"))
      return t("intake.domestic.label", "Domestic Violence");
    if (c.includes("tenancy") || c.includes("rent"))
      return t("intake.tenancy.label", "Renting / Housing");
    if (c.includes("consumer") || c.includes("bill"))
      return t("intake.consumer.label", "Consumer Complaint");
    if (c.includes("family") || c.includes("marriage"))
      return t("intake.family.label", "Family / Marriage");
    if (c.includes("land") || c.includes("property"))
      return t("intake.land.label", "Land Dispute");
    return cat;
  };

  const [dateStr, setDateStr] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [urgency, setUrgency] = useState<string>("normal");
  const [category, setCategory] = useState<string>(
    t("common.loading", "Loading..."),
  );
  const [rights, setRights] = useState<RightCard[]>([
    {
      title: t("results.right1.title", "Right to Wages"),
      desc: t(
        "results.right1.desc",
        "You are entitled to be paid within 7 days of the wage period under the Payment of Wages Act.",
      ),
    },
    {
      title: t("results.right2.title", "Protection from Unfair Dismissal"),
      desc: t(
        "results.right2.desc",
        "An employer must provide proper notice before termination under the Industrial Disputes Act.",
      ),
    },
    {
      title: t("results.right3.title", "Right to Free Legal Aid"),
      desc: t(
        "results.right3.desc",
        "As a worker earning less than ₹3 Lakh/year, you qualify for entirely free legal representation.",
      ),
    },
  ]);
  const [nextSteps, setNextSteps] = useState<StepItem[]>([
    {
      title: t("results.gatherEvidence", "Gather Evidence"),
      desc: t(
        "results.gatherEvidenceDesc",
        "Collect all employment contracts, ID cards, and WhatsApp messages with your employer.",
      ),
    },
    {
      title: t("results.draftComplaint", "Draft a Complaint"),
      desc: t(
        "results.draftComplaintDesc",
        "Write a simple timeline of events in your preferred language.",
      ),
    },
    {
      title: t("results.visitCenter", "Visit a Free Center"),
      desc: t(
        "results.visitCenterDesc",
        "Book an appointment or walk into a Legal Aid center listed below.",
      ),
    },
  ]);
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumber[]>(
    [],
  );
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>("unknown");
  const [showSafetyPrompt, setShowSafetyPrompt] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCenters = async () => {
      try {
        const storedCategory = localStorage.getItem("nyaymitra_category");
        if (storedCategory) setCategory(storedCategory);

        const storedSession = sessionStorage.getItem("nyaymitra_chat_session");
        const parsedLocation = parseUserLocation(storedSession);
        if (parsedLocation) {
          setUserLocation(parsedLocation);
        }

        const storedSafetyStatus = sessionStorage.getItem(SAFETY_STATUS_KEY);
        if (storedSafetyStatus === "safe" || storedSafetyStatus === "unsafe") {
          setSafetyStatus(storedSafetyStatus);
          setShowSafetyPrompt(false);
        } else {
          setShowSafetyPrompt(true);
        }

        const storedUrgency = localStorage.getItem("nyaymitra_urgent");
        if (storedUrgency) {
          setUrgency(storedUrgency === "true" ? "high" : "normal");
        }

        const storedRights = localStorage.getItem("nyaymitra_rights");
        if (storedRights) {
          const parsedRights = normalizeRights(JSON.parse(storedRights));
          if (parsedRights.length > 0) {
            setRights(parsedRights);
          }
        }

        const storedSteps = localStorage.getItem("nyaymitra_next_steps");
        if (storedSteps) {
          const parsedSteps = normalizeSteps(JSON.parse(storedSteps));
          if (parsedSteps.length > 0) {
            setNextSteps(parsedSteps);
          }
        }

        const storedEmergency = localStorage.getItem(
          "nyaymitra_emergency_numbers",
        );
        if (storedEmergency) {
          const parsedEmergency = normalizeEmergencyNumbers(
            JSON.parse(storedEmergency),
          );
          if (parsedEmergency.length > 0) {
            setEmergencyNumbers(parsedEmergency);
          } else {
            setEmergencyNumbers(DEFAULT_EMERGENCY_NUMBERS);
          }
        } else {
          setEmergencyNumbers(DEFAULT_EMERGENCY_NUMBERS);
        }

        const storedMapQuery = localStorage.getItem(
          "nyaymitra_map_search_query",
        );
        const storedCitations = localStorage.getItem("nyaymitra_citations");
        const storedCenters = localStorage.getItem("nyaymitra_centers");
        const normalizedStoredCenters = storedCenters
          ? normalizeCenterList(JSON.parse(storedCenters))
          : [];

        const withDistances = normalizedStoredCenters.map((center) => {
          if (
            userLocation &&
            typeof center.latitude === "number" &&
            typeof center.longitude === "number"
          ) {
            return {
              ...center,
              distance: haversineKm(userLocation, {
                lat: center.latitude,
                lng: center.longitude,
              }),
            };
          }

          return center;
        });

        withDistances.sort(
          (a, b) =>
            (a.distance ?? Number.POSITIVE_INFINITY) -
            (b.distance ?? Number.POSITIVE_INFINITY),
        );

        if (withDistances.length > 0) {
          setCenters(withDistances);
        } else {
          const response = await fetch(`${BACKEND_BASE_URL}/api/centers/`);
          if (response.ok) {
            const liveCenters = normalizeCenterList(await response.json()).map(
              (center) => {
                if (
                  userLocation &&
                  typeof center.latitude === "number" &&
                  typeof center.longitude === "number"
                ) {
                  return {
                    ...center,
                    distance: haversineKm(userLocation, {
                      lat: center.latitude,
                      lng: center.longitude,
                    }),
                  };
                }

                return center;
              },
            );
            liveCenters.sort(
              (a, b) =>
                (a.distance ?? Number.POSITIVE_INFINITY) -
                (b.distance ?? Number.POSITIVE_INFINITY),
            );
            setCenters(liveCenters);
          } else {
            setCenters([]);
          }
        }

        if (storedMapQuery && storedMapQuery.trim().length > 0) {
          setMapSearchQuery(storedMapQuery);
        } else if (withDistances[0]) {
          setMapSearchQuery(buildMapsQuery(withDistances[0], userLocation));
        } else if (storedCategory && storedCategory.trim().length > 0) {
          setMapSearchQuery(`Nearest ${storedCategory} legal aid center`);
        }

        if (storedCitations) {
          const parsedCitations = normalizeCitations(
            JSON.parse(storedCitations),
          );
          setCitations(parsedCitations);
        }
      } catch (error) {
        console.error("Error loading legal centers from storage", error);
        setCenters([]);
      } finally {
        if (mounted) {
          setLoadingCenters(false);
        }
      }
    };

    void loadCenters();

    setDateStr(new Date().toLocaleDateString());

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userLocation || centers.length === 0) return;

    const sortedCenters = centers
      .map((center) => {
        if (
          typeof center.latitude === "number" &&
          typeof center.longitude === "number"
        ) {
          return {
            ...center,
            distance: haversineKm(userLocation, {
              lat: center.latitude,
              lng: center.longitude,
            }),
          };
        }

        return center;
      })
      .sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) -
          (b.distance ?? Number.POSITIVE_INFINITY),
      );

    setCenters(sortedCenters);

    const nearestCenter = sortedCenters[0] ?? null;
    setMapSearchQuery(buildMapsQuery(nearestCenter, userLocation));
  }, [userLocation]);

  const handleSafetySelection = (isSafe: boolean) => {
    const nextStatus: SafetyStatus = isSafe ? "safe" : "unsafe";
    setSafetyStatus(nextStatus);
    setShowSafetyPrompt(false);
    sessionStorage.setItem(SAFETY_STATUS_KEY, nextStatus);
  };

  const emergencyActions =
    emergencyNumbers.length > 0 ? emergencyNumbers : DEFAULT_EMERGENCY_NUMBERS;

  const primaryEmergencyContact =
    emergencyActions.find((item) => item.number === "112") ||
    emergencyActions[0];
  const safetyCopy = getSafetyCopy(language);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    setPdfStatusMessage(
      PDF_PROGRESS_LABELS[selectedLanguage] || "Downloading report...",
    );

    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginL = 14;
      const marginR = 14;
      const contentW = pageWidth - marginL - marginR;
      let y = 0;

      let unicodeFontAlias: string | null = null;
      try {
        unicodeFontAlias = await ensureUnicodePdfFont(pdf);
      } catch {
        unicodeFontAlias = null;
      }

      const setSmartFont = (style: "normal" | "bold" = "normal", text = "") => {
        if (unicodeFontAlias && needsUnicodeFont(text)) {
          pdf.setFont(unicodeFontAlias, "normal");
          return;
        }
        pdf.setFont("helvetica", style);
      };

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - 12) {
          pdf.addPage();
          y = 16;
        }
      };

      const writeText = (
        text: string,
        options: {
          size?: number;
          bold?: boolean;
          color?: [number, number, number];
          indent?: number;
          gap?: number;
          maxWidth?: number;
        } = {},
      ) => {
        const {
          size = 10.5,
          bold = false,
          color = [30, 30, 30],
          indent = 0,
          gap = 3.5,
          maxWidth,
        } = options;

        const clean = sanitizePdfText(text);
        if (!clean) return;

        pdf.setFontSize(size);
        setSmartFont(bold ? "bold" : "normal", clean);
        pdf.setTextColor(...color);

        const wrapWidth = (maxWidth ?? contentW) - indent;
        const lines = pdf.splitTextToSize(clean, wrapWidth);
        const lineH = size * 0.3528 * 1.55;
        const blockH = lines.length * lineH + gap;

        ensureSpace(blockH + 2);
        pdf.text(lines, marginL + indent, y);
        y += blockH;
      };

      const drawHRule = (
        color: [number, number, number] = [220, 220, 220],
        weight = 0.3,
      ) => {
        ensureSpace(4);
        pdf.setDrawColor(...color);
        pdf.setLineWidth(weight);
        pdf.line(marginL, y, pageWidth - marginR, y);
        y += 4;
      };

      const drawSectionHeading = (title: string) => {
        ensureSpace(16);
        y += 4;
        drawHRule([200, 200, 200], 0.25);
        writeText(title, { size: 13, bold: true, color: [10, 25, 47], gap: 5 });
      };

      pdf.setFillColor(10, 25, 47);
      pdf.rect(0, 0, pageWidth, 28, "F");
      y = 10;

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(240, 165, 0);
      pdf.text("NYAYMITRA", marginL, y);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(200, 210, 230);
      pdf.text("Official Legal Guidance Report", marginL, y + 8);

      const badgeLabel = `URGENCY: ${String(urgency).toUpperCase()}`;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      const badgeW = pdf.getTextWidth(badgeLabel) + 6;
      const badgeX = pageWidth - marginR - badgeW;
      const badgeY = 6;
      const badgeColor: [number, number, number] =
        urgency === "high" ? [220, 38, 38] : [22, 163, 74];
      pdf.setFillColor(...badgeColor);
      pdf.roundedRect(badgeX, badgeY, badgeW, 7, 1.5, 1.5, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.text(badgeLabel, badgeX + 3, badgeY + 4.8);

      y = 34;

      pdf.setFillColor(247, 248, 250);
      pdf.rect(marginL, y, contentW, 28, "F");
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.rect(marginL, y, contentW, 28, "S");

      const metaY = y + 5;
      const col2X = marginL + contentW / 2;
      const labelColor: [number, number, number] = [115, 115, 115];
      const valueColor: [number, number, number] = [25, 25, 25];
      const leftValueX = marginL + 4;
      const rightValueX = col2X;
      const valueWidth = contentW / 2 - 8;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...labelColor);
      pdf.text("GENERATED FOR", marginL + 4, metaY);
      pdf.text("DATE ISSUED", col2X, metaY);
      pdf.text("CATEGORY", marginL + 4, metaY + 9);
      pdf.text("CONTACT", col2X, metaY + 9);

      const drawMetaValue = (
        value: string,
        x: number,
        baselineY: number,
        fontSize = 9,
      ) => {
        const clean = sanitizePdfText(value);
        const lines = pdf.splitTextToSize(clean, valueWidth);
        pdf.setFontSize(fontSize);
        setSmartFont("normal", clean);
        pdf.setTextColor(...valueColor);
        pdf.text(lines, x, baselineY);
      };

      drawMetaValue(user?.displayName || "Anonymous User", leftValueX, metaY + 4.5, 9.5);
      drawMetaValue(dateStr, rightValueX, metaY + 4.5, 9.5);
      drawMetaValue(getCategoryLabel(category), leftValueX, metaY + 13.5, 9.5);
      drawMetaValue(user?.email || "N/A", rightValueX, metaY + 13.5, 9);

      y += 34;

      drawSectionHeading("Know Your Rights");
      if (rights.length === 0) {
        writeText("No rights available.", {
          size: 10,
          color: [120, 120, 120],
          gap: 4,
        });
      } else {
        rights.forEach((right, i) => {
          ensureSpace(24);
          pdf.setFillColor(10, 25, 47);
          pdf.circle(marginL + 4, y + 3.5, 3.5, "F");
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
          pdf.text(String(i + 1), marginL + 4, y + 4.6, { align: "center" });

          writeText(right.title, {
            size: 11.5,
            bold: true,
            color: [10, 25, 47],
            indent: 11,
            gap: 2.5,
          });
          writeText(right.desc || "-", {
            size: 10,
            color: [60, 60, 60],
            indent: 11,
            gap: 2.5,
          });

          const citation = citations[i];
          if (citation) {
            const citText = `${citation.law_name}${
              typeof citation.page === "number" ? ` (Page ${citation.page})` : ""
            }${citation.source_url ? ` | ${citation.source_url}` : ""}`;
            const citLines = pdf.splitTextToSize(sanitizePdfText(citText), contentW - 19);
            const citH = citLines.length * 3.9 + 7;
            ensureSpace(citH + 2);
            pdf.setFillColor(255, 251, 235);
            pdf.setDrawColor(245, 158, 11);
            pdf.setLineWidth(0.25);
            pdf.roundedRect(marginL + 11, y, contentW - 11, citH, 1.5, 1.5, "FD");
            pdf.setFontSize(8.5);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(120, 80, 0);
            pdf.text("SOURCE:", marginL + 14, y + 4.5);
            pdf.setFontSize(8.5);
            setSmartFont("normal", citText);
            pdf.setTextColor(100, 70, 0);
            pdf.text(citLines, marginL + 14, y + 8.5);
            y += citH + 3;
          }

          y += 4;
        });
      }

      drawSectionHeading("Next Steps");
      if (nextSteps.length === 0) {
        writeText("No next steps available.", {
          size: 9.5,
          color: [120, 120, 120],
          gap: 4,
        });
      } else {
        nextSteps.forEach((step, i) => {
          const pillW = 22;
          const contentIndent = 28;
          const stepTitle = sanitizePdfText(step.title || `Step ${i + 1}`);
          const stepDesc = sanitizePdfText(step.desc || "");

          // Reserve enough space for badge + wrapped title/description block.
          ensureSpace(stepDesc ? 28 : 20);

          pdf.setFillColor(240, 165, 0);
          pdf.roundedRect(marginL, y + 1, pillW, 6.5, 1.5, 1.5, "F");
          pdf.setFontSize(7.5);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(10, 25, 47);
          pdf.text(`STEP ${i + 1}`, marginL + pillW / 2, y + 5.5, {
            align: "center",
          });

          writeText(stepTitle, {
            size: 11.5,
            bold: true,
            color: [10, 25, 47],
            indent: contentIndent,
            gap: 2,
          });

          if (stepDesc) {
            writeText(stepDesc, {
              size: 10,
              color: [70, 70, 70],
              indent: contentIndent,
              gap: 4.5,
            });
          } else {
            y += 2;
          }

          if (i < nextSteps.length - 1) {
            drawHRule([235, 235, 235], 0.2);
          }
        });
      }

      drawSectionHeading("Emergency Contacts");
      if (emergencyActions.length === 0) {
        writeText("No emergency contacts available.", {
          size: 9.5,
          color: [120, 120, 120],
          gap: 4,
        });
      } else {
        const colW = (contentW - 4) / 2;
        const startX = marginL;
        let colIdx = 0;
        let rowStartY = y;
        let rowMaxHeight = 0;

        emergencyActions.forEach((item, i) => {
          const xPos = startX + (colIdx === 0 ? 0 : colW + 4);
          const nameLines = pdf.splitTextToSize(sanitizePdfText(item.name), colW - 6);
          const cardH = Math.max(16, nameLines.length * 3.8 + 9.5);

          if (colIdx === 0) {
            rowStartY = y;
            ensureSpace(cardH + 2);
            rowMaxHeight = cardH;
          } else {
            rowMaxHeight = Math.max(rowMaxHeight, cardH);
          }

          pdf.setFillColor(254, 242, 242);
          pdf.setDrawColor(254, 202, 202);
          pdf.setLineWidth(0.25);
          pdf.roundedRect(xPos, rowStartY, colW, cardH, 2, 2, "FD");

          pdf.setFontSize(8);
          setSmartFont("bold", item.name);
          pdf.setTextColor(153, 27, 27);
          pdf.text(nameLines, xPos + 3, rowStartY + 5.5);

          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(185, 28, 28);
          pdf.text(sanitizePdfText(item.number), xPos + 3, rowStartY + cardH - 3.5);

          colIdx++;
          if (colIdx === 2 || i === emergencyActions.length - 1) {
            y = rowStartY + rowMaxHeight + 3;
            colIdx = 0;
          }
        });
      }

      drawSectionHeading("Nearby Legal Aid Centers");
      if (centers.length === 0) {
        writeText("No legal aid centers found.", {
          size: 9.5,
          color: [120, 120, 120],
          gap: 4,
        });
      } else {
        centers.forEach((center, i) => {
          const titleBase = `${i + 1}. ${center.name}`;
          const distanceSuffix =
            typeof center.distance === "number"
              ? ` - ${center.distance.toFixed(2)} km away`
              : "";
          const fullTitle = sanitizePdfText(`${titleBase}${distanceSuffix}`);
          const titleLines = pdf.splitTextToSize(fullTitle, contentW - 8);
          const addrLines = pdf.splitTextToSize(
            sanitizePdfText(center.address || "Address not available"),
            contentW - 8,
          );
          const cardH = titleLines.length * 4.2 + addrLines.length * 3.8 + 11;

          ensureSpace(cardH + 2);
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(210, 218, 230);
          pdf.setLineWidth(0.25);
          pdf.roundedRect(marginL, y, contentW, cardH, 2, 2, "FD");
          pdf.setFillColor(10, 25, 47);
          pdf.rect(marginL, y, 2.5, cardH, "F");

          pdf.setFontSize(10.5);
          setSmartFont("bold", fullTitle);
          pdf.setTextColor(10, 25, 47);
          pdf.text(titleLines, marginL + 6, y + 5.5);

          let cardY = y + 5.5 + titleLines.length * 4.2;
          pdf.setFontSize(9);
          setSmartFont("normal", center.address || "Address not available");
          pdf.setTextColor(80, 80, 80);
          pdf.text(addrLines, marginL + 6, cardY);
          cardY += addrLines.length * 3.8 + 1;

          if (center.phone) {
            const phoneLabel = `Phone: ${center.phone}`;
            pdf.setFontSize(9);
            setSmartFont("bold", phoneLabel);
            pdf.setTextColor(10, 100, 180);
            pdf.text(sanitizePdfText(phoneLabel), marginL + 6, cardY);
          }

          y += cardH + 3;
        });
      }

      ensureSpace(18);
      y += 2;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(marginL, y, contentW, 16, "F");
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(100, 100, 100);
      pdf.text("LEGAL NOTICE", marginL + 4, y + 5);
      pdf.setFontSize(7.5);
      const disclaimer =
        "This document is AI-generated simplified guidance and does not constitute formal legal counsel. Always consult a certified legal professional. Brought to you by NyayMitra.";
      setSmartFont("normal", disclaimer);
      pdf.setTextColor(120, 120, 120);
      const dLines = pdf.splitTextToSize(sanitizePdfText(disclaimer), contentW - 8);
      pdf.text(dLines, marginL + 4, y + 9);

      const internalApi = pdf.internal as unknown as { getNumberOfPages: () => number };
      const totalPages = internalApi.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        const footerY = pageHeight - 6;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(marginL, footerY - 2, pageWidth - marginR, footerY - 2);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(160, 160, 160);
        pdf.text("NyayMitra - Confidential Legal Guidance", marginL, footerY);
        pdf.text(`Page ${p} of ${totalPages}`, pageWidth - marginR, footerY, {
          align: "right",
        });
      }

      const safeDate = (dateStr || new Date().toLocaleDateString()).replace(
        /[\/\s]/g,
        "_",
      );
      pdf.save(`NyayMitra_Report_${safeDate}.pdf`);
      setPdfStatusMessage(
        PDF_SUCCESS_LABELS[selectedLanguage] || "Report downloaded successfully.",
      );
    } catch (err) {
      console.error("PDF Generation failed", err);
      setPdfStatusMessage(
        PDF_FAILED_LABELS[selectedLanguage] ||
          "Could not download report. Please try again.",
      );
    } finally {
      setIsGeneratingPDF(false);
      setTimeout(() => setPdfStatusMessage(null), 3500);
    }
  };

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
      const saved = await createAppointmentDataConnect({
        userId: user ? user.uid : "anonymous",
        legalAidCenterId: selectedCenter!.id,
        centerName: selectedCenter!.name,
        centerAddress: selectedCenter!.address,
        centerPhone: selectedCenter!.phone,
        centerLatitude: selectedCenter!.latitude,
        centerLongitude: selectedCenter!.longitude,
        centerCategories: selectedCenter!.categories,
        userName: name,
        userContact: phone,
        problemSummary: description,
        preferredDate: date,
        preferredTime: time,
        status: "pending",
      });

      if (saved) {
        setIsBooking(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(
          t(
            "results.formSubmitError",
            "Failed to book appointment. Please try again.",
          ),
        );
      }
    } catch (err) {
      console.error("Error booking appointment", err);
      setError(
        t(
          "results.formUnexpected",
          "An unexpected error occurred. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center text-zinc-900 dark:text-zinc-100 print:block print:h-auto print:min-h-0 print:overflow-visible print:!bg-white print:!text-black">
      {urgency === "high" && (
        <div className="w-full bg-red-600 text-white font-semibold py-3 px-4 flex justify-center items-center gap-2">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <span>
            {t(
              "results.urgent",
              "Need immediate help? Call Women Helpline: 181, Police: 100",
            )}
          </span>
        </div>
      )}

      {/* Remove explicit w-full in print so browser sets width, avoiding scrollbar bleeds */}
      <main className="w-full max-w-4xl px-4 py-8 space-y-10 print:max-w-none print:w-auto print:px-8 print:py-4 print:space-y-8 print:!bg-white print:!text-black print:overflow-visible print:break-words font-sans">
        {showSafetyPrompt && (
          <section className="print:hidden w-full bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/40 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-red-700 mb-1">
              {safetyCopy.title}
            </p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {safetyCopy.question}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {safetyCopy.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSafetySelection(true)}
                className="px-4 py-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-900 font-semibold"
              >
                {safetyCopy.yes}
              </button>
              <button
                onClick={() => handleSafetySelection(false)}
                className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold"
              >
                {safetyCopy.no}
              </button>
            </div>
          </section>
        )}

        {safetyStatus === "unsafe" && primaryEmergencyContact && (
          <section className="print:hidden w-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/70 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
              {safetyCopy.emergencyTitle}
            </p>
            <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-3">
              {safetyCopy.emergencyAction}
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emergencyActions.map((item) => (
                <div
                  key={`${item.name}-${item.number}-unsafe`}
                  className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 rounded-xl p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                    {safetyCopy.forLabel}: {item.name}
                  </p>
                  <p className="mt-1 text-base font-bold text-red-800 dark:text-red-200">
                    {item.number}
                  </p>
                  <a
                    href={`tel:${item.number}`}
                    className="mt-2 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {safetyCopy.callNow}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Header & Category - WEB ONLY */}
        <div className="text-center space-y-4 print:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[var(--color-deep-blue)] dark:text-blue-300 font-bold text-sm shadow-sm capitalize">
            <span className="w-2 h-2 rounded-full bg-[var(--color-deep-blue)]" />
            {t("results.category", "Category Detected")}:{" "}
            {getCategoryLabel(category)}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("results.title", "Your Legal Guidance")}
          </h1>
          <p className="text-gray-500 dark:text-gray-300 max-w-lg mx-auto">
            {t(
              "results.subtitle",
              "Based on your description, here are your rights under Indian Law and the next steps to take.",
            )}
          </p>
          <div className="pt-4">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-[var(--color-deep-blue)] hover:bg-blue-900 disabled:bg-gray-400 text-white font-bold py-2.5 px-6 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" />{" "}
              {isGeneratingPDF
                ? PDF_PROGRESS_LABELS[selectedLanguage] || "Downloading report..."
                : PDF_BTN_LABELS[selectedLanguage] || "Download Legal Report (PDF)"}
            </button>
            {pdfStatusMessage && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 font-medium text-center">
                {pdfStatusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Print only header - PRINT ONLY */}
        <div className="hidden print:block mb-6 border-b-2 border-gray-400 pb-5">
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">
            NYAYMITRA
          </h1>
          <h2 className="text-xl font-bold text-gray-800 uppercase mt-1">
            Official Legal Guidance Report
          </h2>
          <div className="mt-4 flex flex-col gap-1.5 text-sm text-black">
            <p>
              <span className="font-semibold">Generated For:</span>{" "}
              {user?.displayName || "Anonymous User"}{" "}
              {user?.email ? `(${user.email})` : ""}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {dateStr}
            </p>
            <p>
              <span className="font-semibold">Legal Issue Category:</span>{" "}
              <span className="uppercase">{getCategoryLabel(category)}</span>
            </p>
            <p>
              <span className="font-semibold">Assessment Urgency:</span>{" "}
              <span className="uppercase text-red-600 font-bold">
                {urgency}
              </span>
            </p>
          </div>
        </div>

        {/* Know Your Rights - Animated Cards */}
        <section className="print:!bg-white print:!text-black">
          <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-200 print:border-gray-500">
            <Shield className="w-6 h-6 text-[var(--color-saffron)] print:!text-black" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white print:!text-black">
              {t("results.rights", "Know Your Rights")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print:grid-cols-1 print:gap-4 print:block">
            {rights.map((right, i) =>
              (() => {
                const citation = citations[i];
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 opacity-0 relative overflow-hidden group print:!bg-white print:!text-black print:opacity-100 print:!border-gray-400 print:border print:shadow-none print:break-inside-avoid print:mb-6 print:p-6 print:![animation:none] print:w-full print:box-border"
                    style={{
                      animation: `slideUpFadeIn 0.6s ease-out forwards`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-saffron)] transition-all group-hover:w-2 print:hidden" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 print:!text-black">
                      {right.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed print:!text-black print:whitespace-normal print:break-words">
                      {right.desc}
                    </p>
                    <div className="mt-3 rounded-lg border border-amber-200/70 bg-amber-50/60 dark:border-zinc-700 dark:bg-zinc-800/60 p-3 text-xs">
                      {citation ? (
                        <>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {citation.law_name}
                            {typeof citation.page === "number"
                              ? ` (Page ${citation.page})`
                              : ""}
                          </p>
                          {citation.excerpt && (
                            <p className="mt-1 line-clamp-4 text-zinc-600 dark:text-zinc-300">
                              {citation.excerpt}
                            </p>
                          )}
                          {citation.source_url && (
                            <a
                              href={citation.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200 font-semibold"
                            >
                              Open document
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-zinc-600 dark:text-zinc-300">
                          No verified source found for this right yet.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })(),
            )}
          </div>
        </section>

        {/* Next Steps & Centers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1 print:block print:!bg-white print:!text-black">
          <div className="print:mb-8">
            <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-200 print:border-gray-500">
              <CheckCircle className="w-6 h-6 text-[var(--color-deep-blue)] print:!text-black" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white print:!text-black">
                {t("results.nextSteps", "Next Steps")}
              </h2>
            </div>
            <ol className="space-y-6 relative border-l-2 border-blue-100 print:border-l-0 print:ml-0 print:space-y-6 ml-3">
              {nextSteps.map((step, index) => (
                <li
                  key={`${step.title}-${index}`}
                  className="pl-6 relative print:static print:border print:border-gray-400 print:rounded-xl print:p-6 print:break-inside-avoid print:box-border print:w-full print:block"
                >
                  <div className="hidden print:block font-bold text-sm text-[var(--color-deep-blue)] mb-2 uppercase tracking-wider">
                    Step {index + 1}
                  </div>
                  <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[var(--color-deep-blue)] text-white flex items-center justify-center text-xs font-bold ring-4 ring-zinc-50 print:hidden">
                    {index + 1}
                  </span>
                  <h4 className="font-bold text-gray-800 dark:text-white print:!text-black text-lg mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 print:!text-black print:whitespace-normal print:break-words leading-relaxed">
                    {step.desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-200 print:hidden">
              <MapPin className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t("results.centers", "Nearby Legal Centers")}
              </h2>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-48 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-4 overflow-hidden relative shadow-inner print:hidden">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodeURIComponent(mapSearchQuery || "Nearby Legal Aid Center")}&t=&z=13&ie=UTF8&iwloc=B&output=embed`}
              ></iframe>
            </div>

            {emergencyNumbers.length > 0 && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-xl p-3 print:hidden">
                <p className="text-sm font-semibold text-red-700 mb-3 print:!text-black">
                  Emergency Numbers
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:flex print:flex-col print:gap-4">
                  {emergencyNumbers.map((item) => (
                    <a
                      key={`${item.name}-${item.number}`}
                      href={`tel:${item.number}`}
                      className="text-sm bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors print:!bg-white print:!border-gray-400 print:!text-black print:p-4 print:block print:w-full print:rounded-lg"
                    >
                      <span className="font-medium text-gray-800 dark:text-zinc-100 print:!text-black block mb-1">
                        {item.name}
                      </span>
                      <span className="text-red-700 print:!text-black font-bold text-lg">
                        {item.number}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 print:hidden">
              {loadingCenters && (
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 text-sm text-gray-500 dark:text-gray-300 shadow-sm">
                  {t(
                    "results.loadingCenters",
                    "Loading legal centers from the database...",
                  )}
                </div>
              )}
              {!loadingCenters && centers.length === 0 && (
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 text-sm text-gray-500 dark:text-gray-300 shadow-sm">
                  {t(
                    "results.noCenters",
                    "No legal centers found in the database.",
                  )}
                </div>
              )}
              {centers.map((center) => (
                <div
                  key={center.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {center.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
                      {center.address}
                      {typeof center.distance === "number"
                        ? ` • ${center.distance.toFixed(2)} km`
                        : ""}
                    </p>
                    <p className="text-xs font-medium text-[var(--color-deep-blue)] mt-1">
                      {center.phone}
                    </p>
                    {typeof center.latitude === "number" &&
                      typeof center.longitude === "number" && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold mt-1 inline-block print:hidden"
                        >
                          Open exact location
                        </a>
                      )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCenter(center);
                      setIsBooking(true);
                    }}
                    className="flex-shrink-0 bg-blue-50 text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)] hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors print:hidden"
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
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />{" "}
                {t("results.bookConsultation", "Book Consultation")}
              </h3>
              <button
                onClick={() => {
                  setIsBooking(false);
                  setError(null);
                }}
                className="text-blue-200 hover:text-white transition-colors"
              >
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("results.center", "Center")}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedCenter.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {selectedCenter.phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("results.yourName", "Your Name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("results.phoneNumber", "Phone Number")}{" "}
                  <span className="text-red-500">*</span>
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("results.preferredDate", "Preferred Date")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("results.timeOptional", "Time (Optional)")}
                  </label>
                  <input
                    name="time"
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("results.briefDescription", "Brief Description")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  name="description"
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder={t(
                    "results.descriptionPlaceholder",
                    "Explain your legal issue briefly (e.g., unpaid wages, harassment, contract dispute)...",
                  )}
                ></textarea>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t(
                    "results.descriptionHelp",
                    "This helps the legal advisor prepare for your consultation",
                  )}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--color-saffron)] hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
                >
                  {isSubmitting
                    ? t("results.booking", "Booking...")
                    : t("results.confirmBooking", "Confirm Booking")}
                </button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium flex justify-center items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />{" "}
                  {t(
                    "results.confidential",
                    "All information is kept completely confidential.",
                  )}
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
          <span>
            {t(
              "results.requestSent",
              "Your appointment request has been sent!",
            )}
          </span>
        </div>
      )}
      {/* HIDDEN INVISIBLE PDF TEMPLATE */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none z-[-1]">
        <div
          id="pdf-export-canvas"
          className="bg-white text-black font-sans box-border relative flex flex-col"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header Bar */}
          <div className="w-full bg-[#0a192f] p-8 text-white">
            <h1 className="text-4xl font-extrabold uppercase tracking-widest text-[#f0a500]">
              NyayMitra
            </h1>
            <p className="text-xl font-bold uppercase mt-2">Official Legal Guidance Report</p>
          </div>

          <div className="p-10 flex-1 flex flex-col">
            {/* Metadata Seal */}
            <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-8">
              <div className="space-y-2 text-sm">
                <p><span className="font-bold text-gray-500 uppercase">Generated For:</span> <span className="font-semibold text-lg">{user?.displayName || "Anonymous User"}</span></p>
                <p><span className="font-bold text-gray-500 uppercase">Date Issued:</span> {dateStr}</p>
                <p><span className="font-bold text-gray-500 uppercase">Contact ID:</span> {user?.email ? user.email : "N/A"}</p>
              </div>
              <div className="text-right">
                <div className="border border-red-500 text-red-600 px-4 py-2 font-black uppercase text-xl inline-block tracking-widest transform rotate-3">
                  Urgency: {urgency}
                </div>
                <p className="mt-4 font-bold text-gray-800 text-lg uppercase bg-gray-100 px-3 py-1 rounded inline-block">{getCategoryLabel(category)}</p>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#0a192f] mb-4 border-b border-gray-200 pb-2">Your Verified Rights</h2>
              <div className="grid grid-cols-2 gap-6 mb-10">
                {rights.map((right, i) => (
                  <div key={i} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#f0a500] rounded-l-lg"></div>
                    <h3 className="text-lg font-bold text-[#0a192f] mb-2">{right.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{right.desc}</p>
                    {citations[i] && (
                      <div className="mt-3 bg-white p-3 rounded border border-gray-200 text-xs text-gray-500 font-semibold italic">
                        {citations[i].law_name} {typeof citations[i].page === "number" ? `(Page ${citations[i].page})` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-black uppercase tracking-widest text-[#0a192f] mb-4 border-b border-gray-200 pb-2">Recommended Course of Action</h2>
              <div className="space-y-6 flex-1">
                {nextSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-[#0a192f] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                      <p className="text-gray-700 mt-1 pb-4 border-b border-gray-100">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Footer */}
          <div className="bg-gray-100 p-6 text-center text-xs text-gray-500 font-semibold border-t border-gray-200">
            This document is AI-generated simplified guidance and does not constitute formal legal counsel. <br/>
            Always consult a certified legal professional. Brought to you by NyayMitra.
          </div>
        </div>
      </div>
    </div>
  );
}
