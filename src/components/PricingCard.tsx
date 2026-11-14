"use client";
import { Check } from "lucide-react";
import { useState } from "react";

interface Props {
  name: string;
  price: number;
  features: string[];
  plan: "starter" | "coach";
  highlighted?: boolean;
}

export default function PricingCard({ name, price, features, plan, highlighted }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div
      className={`rounded-2xl border p-8 flex flex-col ${
        highlighted
          ? "border-purple-500 bg-gradient-to-b from-purple-900/40 to-gray-900/40 relative"
          : "border-gray-700 bg-gray-900/40"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          הכי פופולרי
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${price}</span>
          <span className="text-gray-400">/חודש</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          highlighted
            ? "bg-purple-600 hover:bg-purple-500 text-white"
            : "border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? "מעביר לתשלום..." : "התחל עכשיו"}
      </button>
    </div>
  );
}
