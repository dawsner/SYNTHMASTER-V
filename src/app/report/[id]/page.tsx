import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScoreCircle from "@/components/ScoreCircle";
import ToolCard from "@/components/ToolCard";
import { ArrowLeft, CheckCircle, Lightbulb, TrendingUp } from "lucide-react";
import type { LLMToolResult } from "@/lib/scan-engine";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: { business: true },
  });

  if (!scan) notFound();

  const tools: LLMToolResult[] = JSON.parse(scan.details);
  const recommendations: string[] = JSON.parse(scan.recommendations);
  const mentionedCount = tools.filter((t) => t.mentioned).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
            <Link href="/scan" className="hover:text-white transition-colors">
              ← סריקה חדשה
            </Link>
          </div>
          <h1 className="text-2xl font-bold">דוח נראות AI</h1>
          <p className="text-gray-400">{scan.business.name}</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(scan.createdAt).toLocaleDateString("he-IL")}
        </div>
      </div>

      {/* Score overview */}
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 border border-white/10 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreCircle score={scan.score} size="lg" />
          <div className="flex-1 text-center md:text-right">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{mentionedCount}/4</div>
                <div className="text-xs text-gray-400">כלים מזכירים אותך</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(tools.reduce((a, b) => a + b.prominence, 0) / tools.length)}/10
                </div>
                <div className="text-xs text-gray-400">בולטות ממוצעת</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(tools.reduce((a, b) => a + b.accuracy, 0) / tools.length)}/10
                </div>
                <div className="text-xs text-gray-400">דיוק ממוצע</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool results */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          תוצאות לפי כלי AI
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.tool} tool={tool} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          המלצות לשיפור נראות
        </h2>
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-lg font-semibold mb-2">Starter - $5/חודש</div>
          <p className="text-sm text-gray-400 mb-4">
            קבל תוכנית פעולה מפורטת ומעקב חודשי אחרי השיפור שלך.
          </p>
          <ul className="space-y-1.5 mb-4">
            {["סריקה חודשית אוטומטית", "תוכנית פעולה מפורטת", "דשבורד מעקב"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="block text-center border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            שדרג ל-Starter
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="text-lg font-semibold mb-1">AI Coach - $29/חודש</div>
          <div className="text-xs text-purple-300 mb-3">הכי פופולרי</div>
          <p className="text-sm text-gray-400 mb-4">
            AI Coach אישי שמלווה אותך צעד אחר צעד לשיפור הנראות.
          </p>
          <ul className="space-y-1.5 mb-4">
            {["AI Coach אישי 24/7", "יישום אוטומטי של המלצות", "דוחות שבועיים"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="block text-center bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            קבל AI Coach <ArrowLeft className="inline w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
