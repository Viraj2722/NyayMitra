"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Mic, Info, Scale, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserQuery } from "@dataconnect/my-app";
import { dataConnect } from "@/lib/firebase";
import { useLanguage, type AppLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileByUid, syncUserToDataConnect } from "@/lib/dataConnect";

type IntakeCategory =
  | "labor"
  | "domestic"
  | "tenancy"
  | "consumer"
  | "family"
  | "land";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

const LANG_META: Record<AppLanguage, { label: string; speechTag: string }> = {
  English: { label: "English", speechTag: "en-IN" },
  Hindi: { label: "हिन्दी", speechTag: "hi-IN" },
  Marathi: { label: "मराठी", speechTag: "mr-IN" },
  Bengali: { label: "বাংলা", speechTag: "bn-IN" },
  Gujarati: { label: "ગુજરાતી", speechTag: "gu-IN" },
  Tamil: { label: "தமிழ்", speechTag: "ta-IN" },
  Telugu: { label: "తెలుగు", speechTag: "te-IN" },
  Kannada: { label: "ಕನ್ನಡ", speechTag: "kn-IN" },
  Malayalam: { label: "മലയാളം", speechTag: "ml-IN" },
  Punjabi: { label: "ਪੰਜਾਬੀ", speechTag: "pa-IN" },
  Urdu: { label: "اردو", speechTag: "ur-IN" },
};

const INTAKE_FLOW: Record<
  IntakeCategory,
  { buttonLabel: string; followUpQuestion: string }
> = {
  labor: {
    buttonLabel: "Work / Salary issue",
    followUpQuestion: "Have you been employed here for more than 3 months?",
  },
  domestic: {
    buttonLabel: "Domestic Violence",
    followUpQuestion: "Are you currently in a safe place?",
  },
  tenancy: {
    buttonLabel: "Renting / Housing",
    followUpQuestion: "Do you have a written rental agreement?",
  },
  consumer: {
    buttonLabel: "Consumer Complaint",
    followUpQuestion: "Do you have a bill or receipt for the purchase?",
  },
  family: {
    buttonLabel: "Family / Marriage",
    followUpQuestion: "Is there a court case already filed?",
  },
  land: {
    buttonLabel: "Land Dispute",
    followUpQuestion: "Do you have any ownership documents?",
  },
};

const LOCALIZED_FALLBACK_RESPONSE: Record<AppLanguage, (category: string) => string> = {
  English: (category) => `I understood your issue and prepared guidance for ${category}.`,
  Hindi: (category) => `मैंने आपकी समस्या समझ ली है और ${category} के लिए मार्गदर्शन तैयार किया है।`,
  Marathi: (category) => `मी तुमची समस्या समजून घेतली आहे आणि ${category} साठी मार्गदर्शन तयार केले आहे.`,
  Bengali: (category) => `আমি আপনার সমস্যা বুঝেছি এবং ${category} এর জন্য নির্দেশনা প্রস্তুত করেছি।`,
  Gujarati: (category) => `મેં તમારી સમસ્યા સમજી લીધી છે અને ${category} માટે માર્ગદર્શન તૈયાર કર્યું છે.`,
  Tamil: (category) => `நான் உங்கள் பிரச்சினையைப் புரிந்துகொண்டேன், ${category} க்கான வழிகாட்டுதலைத் தயார் செய்துள்ளேன்.`,
  Telugu: (category) => `నేను మీ సమస్యను అర్థం చేసుకున్నాను మరియు ${category} కోసం మార్గదర్శకాన్ని సిద్ధం చేశాను.`,
  Kannada: (category) => `ನಾನು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ${category}ಗಾಗಿ ಮಾರ್ಗದರ್ಶನವನ್ನು ತಯಾರಿಸಿದ್ದೇನೆ.`,
  Malayalam: (category) => `ഞാൻ നിങ്ങളുടെ പ്രശ്നം മനസ്സിലാക്കി, ${category}യ്ക്കായി മാർഗനിർദേശം തയ്യാറാക്കി.`,
  Punjabi: (category) => `ਮੈਂ ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਸਮਝ ਲਈ ਹੈ ਅਤੇ ${category} ਲਈ ਮਾਰਗਦਰਸ਼ਨ ਤਿਆਰ ਕੀਤਾ ਹੈ।`,
  Urdu: (category) => `میں نے آپ کا مسئلہ سمجھ لیا ہے اور ${category} کے لیے رہنمائی تیار کی ہے۔`,
};

const RESULTS_BUTTON_LABELS: Record<AppLanguage, string> = {
  English: "View Results",
  Hindi: "परिणाम देखें",
  Marathi: "निकाल पहा",
  Bengali: "ফলাফল দেখুন",
  Gujarati: "પરિણામ જુઓ",
  Tamil: "முடிவுகளைப் பார்க்கவும்",
  Telugu: "ఫలితాలను చూడండి",
  Kannada: "ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ",
  Malayalam: "ഫലങ്ങൾ കാണുക",
  Punjabi: "ਨਤੀਜੇ ਵੇਖੋ",
  Urdu: "نتائج دیکھیں",
};

const CHAT_SESSION_KEY = "nyaymitra_chat_session";

type ChatSessionState = {
  messages: Message[];
  selectedCategory: IntakeCategory | null;
  followUpAnswer: "yes" | "no" | null;
  selectedLanguage: AppLanguage;
  userLat: number | null;
  userLng: number | null;
};

function getLanguageGreeting(language: AppLanguage): string {
  if (language === "Hindi") {
    return "नमस्ते। मैं आपका कानूनी सहायक हूं। पहले नीचे दिए गए विकल्प चुनें, फिर अपनी समस्या लिखें।";
  }
  if (language === "Marathi") {
    return "नमस्कार. मी तुमचा कायदेशीर सहाय्यक आहे. आधी खालील पर्याय निवडा, मग तुमची समस्या लिहा.";
  }
  return "Namaste. I am your legal assistant. First select the intake options below, then type your issue.";
}

export default function ChatPage() {
  const { language, t } = useLanguage();
  const { user, loading } = useAuth();
  const selectedLanguage = language;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<IntakeCategory | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<"yes" | "no" | null>(
    null,
  );
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [mobileInput, setMobileInput] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "unsupported"
  >("idle");
  const [locationAsked, setLocationAsked] = useState(false);
  const [hasInitializedSession, setHasInitializedSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedSession = sessionStorage.getItem(CHAT_SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession) as Partial<ChatSessionState>;
        if (parsed.selectedLanguage === selectedLanguage && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setSelectedCategory(parsed.selectedCategory ?? null);
          setFollowUpAnswer(parsed.followUpAnswer ?? null);
          if (typeof parsed.userLat === "number") {
            setUserLat(parsed.userLat);
          }
          if (typeof parsed.userLng === "number") {
            setUserLng(parsed.userLng);
          }
          setHasInitializedSession(true);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to restore chat session", error);
    }

    setMessages([
      {
        id: "1",
        text: getLanguageGreeting(selectedLanguage),
        sender: "ai",
      },
    ]);
    setSelectedCategory(null);
    setFollowUpAnswer(null);
    setHasInitializedSession(true);
  }, [selectedLanguage]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!user) return;

      const profile = await getUserProfileByUid(user.uid);
      const existingMobile = profile?.mobile || "";
      const cachedMobile =
        typeof window !== "undefined"
          ? localStorage.getItem("nyaymitra_mobile") || ""
          : "";
      setProfileId(profile?.id || null);

      if (!existingMobile && cachedMobile) {
        await syncUserToDataConnect({
          id: profile?.id || undefined,
          uid: user.uid,
          name: user.displayName || "User",
          preferredLanguage: selectedLanguage,
          mobile: cachedMobile,
        });
        setShowMobilePopup(false);
      } else if (!existingMobile) {
        setShowMobilePopup(true);
      } else {
        localStorage.setItem("nyaymitra_mobile", existingMobile);
        setShowMobilePopup(false);
      }

      // Keep preferred language synced to selected app language.
      await syncUserToDataConnect({
        id: profile?.id || undefined,
        uid: user.uid,
        name: user.displayName || "User",
        preferredLanguage: selectedLanguage,
        mobile: existingMobile || undefined,
      });

      setProfileLoaded(true);
    };

    if (user) {
      syncUserProfile();
    }
  }, [user, selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!hasInitializedSession || typeof window === "undefined") return;

    const sessionState: ChatSessionState = {
      messages,
      selectedCategory,
      followUpAnswer,
      selectedLanguage,
      userLat,
      userLng,
    };

    sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(sessionState));
  }, [messages, selectedCategory, followUpAnswer, selectedLanguage, hasInitializedSession]);

  const speechLang = useMemo(() => {
    if (!selectedLanguage) return "en-IN";
    return LANG_META[selectedLanguage].speechTag;
  }, [selectedLanguage]);

  const intakeContext = useMemo(() => {
    if (!selectedCategory || !followUpAnswer) return null;
    return {
      category: selectedCategory,
      followUpQuestion: INTAKE_FLOW[selectedCategory].followUpQuestion,
      followUpAnswer,
    };
  }, [selectedCategory, followUpAnswer]);

  const canType = Boolean(
    intakeContext && user && profileLoaded && !showMobilePopup,
  );

  const requestUserLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    if (canType && !locationAsked) {
      setLocationAsked(true);
      requestUserLocation();
    }
  }, [canType, locationAsked]);

  const handleSaveMobile = async () => {
    if (!user) return;

    const cleaned = mobileInput.trim();
    if (!/^\d{10,13}$/.test(cleaned)) {
      alert(
        t(
          "chat.mobileValidation",
          "Please enter a valid mobile number (10 to 13 digits)",
        ),
      );
      return;
    }

    await syncUserToDataConnect({
      id: profileId || undefined,
      uid: user.uid,
      name: user.displayName || "User",
      preferredLanguage: selectedLanguage,
      mobile: cleaned,
    });

    localStorage.setItem("nyaymitra_mobile", cleaned);
    setShowMobilePopup(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !intakeContext || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const BACKEND_BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

      const response = await fetch(`${BACKEND_BASE_URL}/api/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentInput,
          lat: userLat,
          lng: userLng,
          isAnonymous: false,
          userId: user.uid,
          selectedLanguage,
          intakeContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || LOCALIZED_FALLBACK_RESPONSE[selectedLanguage](data.category || "general"),
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);

      localStorage.setItem(
        "nyaymitra_category",
        data.category || intakeContext.category,
      );
      localStorage.setItem(
        "nyaymitra_centers",
        JSON.stringify(data.centers || []),
      );
      localStorage.setItem("nyaymitra_urgent", String(data.urgent || false));
      localStorage.setItem(
        "nyaymitra_detected_lang",
        data.detected_language || selectedLanguage,
      );
      localStorage.setItem(
        "nyaymitra_rights",
        JSON.stringify(data.rights || []),
      );
      localStorage.setItem(
        "nyaymitra_next_steps",
        JSON.stringify(data.next_steps || []),
      );
      localStorage.setItem(
        "nyaymitra_emergency_numbers",
        JSON.stringify(data.emergency_numbers || []),
      );
      localStorage.setItem(
        "nyaymitra_map_search_query",
        data.map_search_query || "",
      );

      try {
        await createUserQuery(dataConnect, {
          userId: profileId || null,
          queryText: currentInput,
          detectedLanguage: data.detected_language || selectedLanguage,
          selectedResponseLanguage: selectedLanguage,
          legalCategoryDetected: data.category || intakeContext.category,
          intakeFollowUpQuestion: intakeContext.followUpQuestion,
          intakeFollowUpAnswer: intakeContext.followUpAnswer,
          isUrgent: data.urgent || false,
          isAnonymous: false,
          aiResponse: data.response,
        });
      } catch (dbError) {
        console.error("Failed to store in Data Connect:", dbError);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t(
          "chat.processingError",
          "Sorry, I am having trouble processing your request. Please try again.",
        ),
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = () => {
    const SpeechRecognition =
      (
        window as Window & {
          SpeechRecognition?: SpeechRecognitionConstructor;
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        t(
          "chat.speechUnsupported",
          "Speech recognition is not supported in this browser. Please use Chrome.",
        ),
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleOpenResults = () => {
    router.push("/results");
  };

  const showResultsButton =
    messages.length > 1 && messages[messages.length - 1]?.sender === "ai" && !isLoading;

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t("chat.signInRequired", "Please sign in to access chat...")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#E5DDD5] dark:bg-[#0b141a] relative overflow-hidden">
      {showMobilePopup && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("chat.addMobileTitle", "Add mobile number")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(
                "chat.addMobileSubtitle",
                "Please add your mobile number before starting chat. We save it in your Data Connect profile.",
              )}
            </p>
            <input
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              placeholder="9876543210"
              className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSaveMobile}
              className="w-full bg-[var(--color-deep-blue)] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg"
            >
              {t("chat.saveContinue", "Save and Continue")}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-deep-blue)] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight text-white">
              NyayMitra Assistant
            </h2>
            <p className="text-xs text-blue-100/90 dark:text-gray-400">
              {`${t("chat.language", "Language")}: ${LANG_META[selectedLanguage].label}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[url('https://i.pinimg.com/originals/8f/ba/cb/8fbacbd464e996966eb9d4a6b7a9c21e.jpg')] dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-fixed bg-center relative z-0">
        <div className="absolute inset-0 bg-[#E5DDD5]/90 dark:bg-[#0b141a]/85 -z-10 mix-blend-normal"></div>

        <div className="text-center mb-2">
          <span className="bg-[#D9FDD3]/70 dark:bg-[#182229] text-xs text-gray-700 dark:text-[#8696a0] px-3 py-1.5 rounded-lg shadow-sm font-medium">
            {t(
              "chat.privacy",
              "Your conversations are private and protected by NyayMitra",
            )}
          </span>
        </div>

        {selectedLanguage && !selectedCategory && (
          <div className="bg-white dark:bg-[#202c33] rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 shadow-sm space-y-3">
            <p className="font-semibold text-gray-900 dark:text-white">
              {t("chat.selectIssue", "Select your issue type first:")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(INTAKE_FLOW) as IntakeCategory[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className="text-left p-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-medium transition-colors"
                >
                  {t(`intake.${key}.label`, INTAKE_FLOW[key].buttonLabel)}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCategory && !followUpAnswer && (
          <div className="bg-white dark:bg-[#202c33] rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 shadow-sm space-y-3">
            <p className="font-semibold text-gray-900 dark:text-white">
              {t(
                `intake.${selectedCategory}.question`,
                INTAKE_FLOW[selectedCategory].followUpQuestion,
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setFollowUpAnswer("yes")}
                className="px-4 py-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-900 font-semibold"
              >
                {t("common.yes", "Yes")}
              </button>
              <button
                onClick={() => setFollowUpAnswer("no")}
                className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold"
              >
                {t("common.no", "No")}
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} w-full`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-[15px] shadow-sm relative leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#dcf8c6] dark:bg-[#005c4b] text-black dark:text-[#e9edef] rounded-tr-none"
                  : "bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {showResultsButton && (
          <div className="flex justify-center w-full pt-2 pb-1">
            <button
              onClick={handleOpenResults}
              className="px-5 py-2.5 rounded-full bg-[var(--color-deep-blue)] text-white font-semibold shadow-md hover:brightness-110 transition-colors"
            >
              {RESULTS_BUTTON_LABELS[selectedLanguage]}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-4 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 flex items-end gap-2 z-10 shrink-0">
        {canType && locationStatus !== "granted" && (
          <div className="absolute bottom-24 left-3 right-3 md:left-6 md:right-6 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <MapPin className="w-4 h-4" />
              <span>
                {locationStatus === "loading"
                  ? "Detecting your location..."
                  : "Share location to find nearest legal center/advocate."}
              </span>
            </div>
            {locationStatus !== "loading" && (
              <button
                onClick={requestUserLocation}
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold"
              >
                Allow
              </button>
            )}
          </div>
        )}

        <button className="p-3 text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <Info className="w-6 h-6" />
        </button>

        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl flex items-center px-2 py-1 shadow-sm border border-transparent focus-within:border-[var(--color-deep-blue)] dark:focus-within:border-blue-500 transition-colors min-h-[48px]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canType}
            placeholder={
              canType
                ? `Type your problem in ${selectedLanguage}...`
                : t(
                    "chat.completeIntake",
                    "Complete language + intake questions first",
                  )
            }
            className="flex-1 max-h-32 min-h-[24px] bg-transparent resize-none outline-none py-2 px-3 text-[15px] text-gray-800 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] disabled:opacity-60"
            rows={1}
          />
          <button
            onClick={isRecording ? () => {} : startRecording}
            disabled={!canType}
            className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
              isRecording
                ? "bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.2)] dark:shadow-[0_0_0_4px_rgba(239,68,68,0.4)] animate-pulse"
                : "text-gray-500 dark:text-[#8696a0] hover:bg-gray-100 dark:hover:bg-[#202c33]"
            } disabled:opacity-50`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || !canType}
          className={`p-3.5 rounded-full flex items-center justify-center transition-all ${
            input.trim() && canType
              ? "bg-[#00a884] shadow-md text-white hover:scale-105 active:scale-95"
              : "bg-gray-300 dark:bg-[#2a3942] text-gray-500 dark:text-[#8696a0]"
          }`}
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
