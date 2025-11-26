"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Heart, Activity, Calendar, HelpCircle, Globe } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    symptomCategory?: string;
    language?: string;
    urgency?: string;
  };
};

type Language = "en" | "ms";

const translations = {
  en: {
    title: "myKlinik Health Assistant",
    subtitle: "Get health guidance and book appointments at Klinik Kesihatan Petaling Jaya",
    placeholder: "Describe your symptoms or ask a health question...",
    send: "Send",
    examples: "Quick Actions:",
    exampleSymptoms: "Check symptoms",
    exampleVaccine: "Vaccination info",
    exampleHours: "Clinic hours",
    disclaimer: "⚠️ This is not a substitute for professional medical advice. For emergencies, call 999 immediately.",
  },
  ms: {
    title: "Pembantu Kesihatan myKlinik",
    subtitle: "Dapatkan panduan kesihatan dan tempah temujanji di Klinik Kesihatan Petaling Jaya",
    placeholder: "Terangkan simptom atau tanya soalan kesihatan...",
    send: "Hantar",
    examples: "Tindakan Pantas:",
    exampleSymptoms: "Semak simptom",
    exampleVaccine: "Maklumat vaksin",
    exampleHours: "Waktu klinik",
    disclaimer: "⚠️ Ini bukan pengganti nasihat perubatan profesional. Untuk kecemasan, hubungi 999 segera.",
  },
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your health assistant for Klinik Kesihatan Petaling Jaya. I can help you with symptoms, clinic information, and appointments. You can ask me in English or Bahasa Malaysia.\n\nHai! Saya pembantu kesihatan untuk Klinik Kesihatan Petaling Jaya. Saya boleh membantu dengan simptom, maklumat klinik, dan temujanji. Anda boleh bertanya dalam Bahasa Inggeris atau Bahasa Malaysia.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, quickMessage?: string) => {
    e.preventDefault();
    const messageText = quickMessage || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageText, 
          language,
          conversationId 
        }),
      });

      const data = await response.json();

      // Save conversation ID for subsequent messages
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. / Maaf, terdapat ralat semasa memproses permintaan anda.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: Activity, labelEn: "Check symptoms", labelMs: "Semak simptom", query: language === "en" ? "I have fever and cough for 2 days" : "Saya demam dan batuk selama 2 hari" },
    { icon: Heart, labelEn: "Vaccination info", labelMs: "Maklumat vaksin", query: language === "en" ? "What vaccinations are available?" : "Apakah vaksin yang tersedia?" },
    { icon: HelpCircle, labelEn: "Clinic hours", labelMs: "Waktu klinik", query: language === "en" ? "What are the clinic operating hours?" : "Apakah waktu operasi klinik?" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setLanguage(language === "en" ? "ms" : "en")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{language === "en" ? "BM" : "EN"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-88px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                {/* Metadata badges for assistant messages */}
                {message.role === "assistant" && message.metadata && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {message.metadata.symptomCategory && message.metadata.symptomCategory !== "unknown" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {message.metadata.symptomCategory}
                      </span>
                    )}
                    {message.metadata.urgency && message.metadata.urgency !== "unknown" && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        message.metadata.urgency === "emergency" 
                          ? "bg-red-100 text-red-800" 
                          : message.metadata.urgency === "high" 
                          ? "bg-orange-100 text-orange-800" 
                          : message.metadata.urgency === "medium" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {message.metadata.urgency === "emergency" ? "🚨" : message.metadata.urgency === "high" ? "⚠️" : ""} {message.metadata.urgency}
                      </span>
                    )}
                    {message.metadata.language && message.metadata.language !== "unknown" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {message.metadata.language === "en" ? "🇬🇧 EN" : "🇲🇾 MS"}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString("en-MY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{t.examples}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSubmit(e, action.query)}
                className="flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <action.icon className="w-5 h-5 text-primary-600" />
                <span className="text-xs text-gray-700 text-center">
                  {language === "en" ? action.labelEn : action.labelMs}
                </span>
              </button>
            ))}
            <a
              href="/appointment"
              className="flex flex-col items-center gap-2 p-3 bg-primary-500 text-white border border-primary-500 rounded-lg hover:bg-primary-600 transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs text-center font-medium">
                {language === "en" ? "Book Appointment" : "Tempah Temujanji"}
              </span>
            </a>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Medical Disclaimer */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {t.disclaimer}
        </div>
      </main>
    </div>
  );
}
