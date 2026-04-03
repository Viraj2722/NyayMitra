"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Globe, Info, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  language?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Namaste. I am your legal assistant. How can I help you today? | नमस्ते। मैं आपका कानूनी सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
      
      // Call backend API to process the query
      const response = await fetch(`${BACKEND_BASE_URL}/api/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentInput,
          lat: null, // Use user location if available
          lng: null,
          isAnonymous: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || `I understand your concern about ${data.category || "this legal matter"}. Based on the information provided, I've identified this as a ${data.category || "general legal"} issue. Click "Next" to see your rights, nearby legal centers, and how to book a consultation.`,
        sender: "ai",
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);

      // Auto-navigate to results page after showing the response
      setTimeout(() => {
        router.push("/results");
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble processing your request. Please check your connection and try again.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Web Speech API
  const startRecording = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "English" ? "en-US" : language === "Hindi" ? "hi-IN" : "mr-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#E5DDD5] dark:bg-[#0b141a] relative overflow-hidden">
      {/* Chat header */}
      <div className="bg-[var(--color-deep-blue)] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight text-white">NyayMitra Assistant</h2>
            <p className="text-xs text-blue-100/90 dark:text-gray-400">Available 24/7</p>
          </div>
        </div>
        <div className="flex items-center bg-blue-900/50 rounded-full px-3 py-1.5 border border-white/10">
          <Globe className="w-4 h-4 mr-2" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-sm outline-none text-white appearance-none cursor-pointer"
          >
            <option className="text-black">English</option>
            <option className="text-black">Hindi</option>
            <option className="text-black">Marathi</option>
          </select>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[url('https://i.pinimg.com/originals/8f/ba/cb/8fbacbd464e996966eb9d4a6b7a9c21e.jpg')] dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-fixed bg-center relative z-0">
        {/* Semi-transparent overlay to ensure readability */}
        <div className="absolute inset-0 bg-[#E5DDD5]/90 dark:bg-[#0b141a]/85 -z-10 mix-blend-normal"></div>

        <div className="text-center mb-6">
          <span className="bg-[#D9FDD3]/70 dark:bg-[#182229] border border-transparent dark:border-white/5 text-xs text-gray-700 dark:text-[#8696a0] px-3 py-1.5 rounded-lg shadow-sm font-medium">
            Your conversations are private and protected by NyayMitra
          </span>
        </div>

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

      {/* Input area */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 flex items-end gap-2 z-10 shrink-0">
        <button className="p-3 text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <Info className="w-6 h-6" />
        </button>
        
        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl flex items-center px-2 py-1 shadow-sm border border-transparent focus-within:border-[var(--color-deep-blue)] dark:focus-within:border-blue-500 transition-colors min-h-[48px]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your problem in ${language}...`}
            className="flex-1 max-h-32 min-h-[24px] bg-transparent resize-none outline-none py-2 px-3 text-[15px] text-gray-800 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0]"
            rows={1}
          />
          <button
            onClick={isRecording ? () => {} : startRecording}
            className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
              isRecording
                ? "bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.2)] dark:shadow-[0_0_0_4px_rgba(239,68,68,0.4)] animate-pulse"
                : "text-gray-500 dark:text-[#8696a0] hover:bg-gray-100 dark:hover:bg-[#202c33]"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`p-3.5 rounded-full flex items-center justify-center transition-all ${
            input.trim()
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
