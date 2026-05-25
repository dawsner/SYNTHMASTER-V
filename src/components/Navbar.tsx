"use client";
import Link from "next/link";
import { Brain } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Brain className="w-6 h-6 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            SynthMaster
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/scan" className="text-gray-400 hover:text-white transition-colors">
            סריקה חינמית
          </Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
            תמחור
          </Link>
          <Link
            href="/scan"
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            התחל סריקה
          </Link>
        </div>
      </div>
    </nav>
  );
}
