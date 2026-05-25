"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_MESSAGES = [
  "מה הדבר הכי חשוב שאני יכול לעשות עכשיו לשיפור הנראות שלי ב-AI?",
  "איך לכתוב תיאור עסקי שיקפוץ בתוצאות ChatGPT?",
  "למה Perplexity לא מוצא אותי?",
  "מה זה GEO (Generative Engine Optimization)?",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "שלום! אני AI Coach שלך לנראות ב-AI. אני כאן לעזור לך להופיע בתוצאות של ChatGPT, Perplexity, Gemini ועוד.\n\nמה מטריד אותך הכי הרבה לגבי הנראות שלך בכלי AI?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPaid] = useState(false); // TODO: check from session
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;

    if (!isPaid) {
      // Allow 3 free messages as demo
      const userMessages = messages.filter((m) => m.role === "user").length;
      if (userMessages >= 2) return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.sessionId) setSessionId(data.sessionId);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "שגיאה בתקשורת. נסה שוב." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isLocked = !isPaid && userMessageCount >= 2;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg">AI Coach</h1>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            מחובר
          </div>
        </div>
        {!isPaid && (
          <div className="mr-auto text-xs text-gray-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
            {Math.max(0, 2 - userMessageCount)} הודעות נותרו בגרסה החינמית
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-tr-sm"
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter prompts */}
      {messages.length === 1 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {STARTER_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => sendMessage(msg)}
              className="text-right text-xs text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      {/* Locked state */}
      {isLocked ? (
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4 text-center">
          <Lock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">ניצלת את הצ'אט החינמי</p>
          <p className="text-xs text-gray-400 mb-3">
            שדרג ל-AI Coach ב-$29/חודש לשיחות ללא הגבלה
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white text-sm px-5 py-2 rounded-xl font-medium transition-colors"
          >
            שדרג עכשיו - $29/חודש
          </Link>
        </div>
      ) : (
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="שאל את ה-AI Coach שלך..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
