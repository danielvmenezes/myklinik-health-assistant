"use client";

import { useState } from "react";
import { Calendar, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

type Language = "en" | "ms";

const translations = {
  en: {
    title: "Book Appointment",
    subtitle: "Schedule your visit to Klinik Kesihatan Petaling Jaya",
    back: "Back to Chat",
    name: "Full Name",
    namePlaceholder: "Ahmad bin Ali",
    phone: "Phone Number",
    phonePlaceholder: "0123456789 or +60123456789",
    date: "Preferred Date",
    time: "Preferred Time",
    timeMorning: "Morning (8 AM - 12 PM)",
    timeAfternoon: "Afternoon (2 PM - 5 PM)",
    reason: "Reason for Visit",
    reasonPlaceholder: "e.g., Fever and cough, Vaccination, Health screening",
    submit: "Book Appointment",
    submitting: "Booking...",
    successTitle: "Appointment Request Received!",
    successSubtitle: "We will contact you within 24 hours to confirm.",
    bookAnother: "Book Another Appointment",
  },
  ms: {
    title: "Tempah Temujanji",
    subtitle: "Jadualkan lawatan anda ke Klinik Kesihatan Petaling Jaya",
    back: "Kembali ke Chat",
    name: "Nama Penuh",
    namePlaceholder: "Ahmad bin Ali",
    phone: "Nombor Telefon",
    phonePlaceholder: "0123456789 atau +60123456789",
    date: "Tarikh Pilihan",
    time: "Masa Pilihan",
    timeMorning: "Pagi (8 pagi - 12 tengah hari)",
    timeAfternoon: "Petang (2 petang - 5 petang)",
    reason: "Sebab Lawatan",
    reasonPlaceholder: "contoh: Demam dan batuk, Vaksinasi, Saringan kesihatan",
    submit: "Tempah Temujanji",
    submitting: "Menempah...",
    successTitle: "Permohonan Temujanji Diterima!",
    successSubtitle: "Kami akan menghubungi anda dalam 24 jam untuk pengesahan.",
    bookAnother: "Tempah Temujanji Lain",
  },
};

export default function AppointmentPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    preferredDate: "",
    preferredTime: "morning",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, language }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setConfirmation(data.confirmation);
      } else {
        alert(data.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setConfirmation("");
    setFormData({
      patientName: "",
      phoneNumber: "",
      preferredDate: "",
      preferredTime: "morning",
      reason: "",
    });
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h1>
          <p className="text-gray-600 mb-6">{t.successSubtitle}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{confirmation}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              {t.bookAnother}
            </button>
            <Link
              href="/"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors inline-block text-center"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setLanguage(language === "en" ? "ms" : "en")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            {language === "en" ? "BM" : "EN"}
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.phone} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder={t.phonePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.date} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.time} <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            >
              <option value="morning">{t.timeMorning}</option>
              <option value="afternoon">{t.timeAfternoon}</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.reason} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t.reasonPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-gray-900"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>

          <p className="text-xs text-gray-500 text-center">
            📞 Contact: 03-7956 2424 | Emergency: 999
          </p>
        </form>
      </main>
    </div>
  );
}
