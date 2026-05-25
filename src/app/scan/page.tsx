"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Loader2, Building2 } from "lucide-react";

const INDUSTRIES = [
  "שיווק דיגיטלי",
  "פיתוח תוכנה",
  "ייעוץ עסקי",
  "רפואה ובריאות",
  "משפטים",
  "נדל\"ן",
  "חינוך",
  "מסעדנות ואוכל",
  "קמעונאות",
  "בנייה ושיפוצים",
  "יופי וטיפוח",
  "כספים וחשבונאות",
  "אחר",
];

export default function ScanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "scanning">("form");
  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "",
    description: "",
    location: "",
  });

  const scanMessages = [
    "מנתח את הפרופיל העסקי שלך...",
    "שואל את ChatGPT על העסק שלך...",
    "בודק נראות ב-Perplexity AI...",
    "סורק את Google Gemini...",
    "בודק ב-Claude AI...",
    "מחשב ציון נראות...",
    "מכין המלצות...",
  ];

  const [scanStep, setScanStep] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.industry || !form.description) {
      setError("נא למלא את כל השדות החובה");
      return;
    }
    setError("");
    setLoading(true);
    setStep("scanning");

    const interval = setInterval(() => {
      setScanStep((s) => (s < scanMessages.length - 1 ? s + 1 : s));
    }, 1200);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      clearInterval(interval);
      if (data.scanId) {
        router.push(`/report/${data.scanId}`);
      } else {
        setError("הסריקה נכשלה. נסה שוב.");
        setStep("form");
        setLoading(false);
      }
    } catch {
      clearInterval(interval);
      setError("שגיאה בחיבור. נסה שוב.");
      setStep("form");
      setLoading(false);
    }
  }

  if (step === "scanning") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto">
              <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">סורק נראות AI...</h2>
          <p className="text-purple-300 mb-8 h-6 transition-all">
            {scanMessages[scanStep]}
          </p>
          <div className="flex justify-center gap-1">
            {scanMessages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= scanStep ? "bg-purple-400 w-6" : "bg-gray-700 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4">
          <Building2 className="w-7 h-7 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">סרוק את הנראות שלך ב-AI</h1>
        <p className="text-gray-400">מלא פרטים על העסק וקבל דוח מלא תוך 60 שניות - בחינם</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            שם העסק <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="לדוגמה: ישראל טק בע&quot;מ"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            אתר אינטרנט
          </label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            תעשייה <span className="text-red-400">*</span>
          </label>
          <select
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
          >
            <option value="" className="bg-gray-900">בחר תעשייה...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind} className="bg-gray-900">{ind}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            תיאור העסק <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="תאר את השירותים שלך, קהל היעד, ומה מייחד אותך..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
          <div className="text-xs text-gray-500 mt-1">{form.description.length}/500 תווים</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            מיקום
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="תל אביב, ישראל"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          {loading ? "סורק..." : "הפעל סריקת AI - חינם"}
        </button>

        <p className="text-center text-xs text-gray-500">
          אין צורך ב-credit card. הנתונים שלך מאובטחים.
        </p>
      </form>
    </div>
  );
}
