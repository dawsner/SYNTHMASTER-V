"use client";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { LLMToolResult } from "@/lib/scan-engine";

const TOOL_COLORS: Record<string, string> = {
  "ChatGPT": "from-green-500/20 to-green-500/5 border-green-500/30",
  "Perplexity AI": "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  "Google Gemini": "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "Claude AI": "from-orange-500/20 to-orange-500/5 border-orange-500/30",
};

const TOOL_ICONS: Record<string, string> = {
  "ChatGPT": "🤖",
  "Perplexity AI": "🔍",
  "Google Gemini": "✨",
  "Claude AI": "🧠",
};

export default function ToolCard({ tool }: { tool: LLMToolResult }) {
  const gradient = TOOL_COLORS[tool.tool] || "from-gray-500/20 to-gray-500/5 border-gray-500/30";

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${gradient} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{TOOL_ICONS[tool.tool] || "🔧"}</span>
          <span className="font-semibold text-white">{tool.tool}</span>
        </div>
        {tool.mentioned ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">בולטות</div>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < tool.prominence ? "bg-purple-400" : "bg-gray-700"}`}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">דיוק</div>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < tool.accuracy ? "bg-blue-400" : "bg-gray-700"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {tool.snippet && (
        <p className="text-sm text-gray-300 italic mb-3 border-l-2 border-gray-600 pl-3">
          &ldquo;{tool.snippet}&rdquo;
        </p>
      )}

      {tool.issues.length > 0 && (
        <div className="space-y-1">
          {tool.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-400 shrink-0" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
