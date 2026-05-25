import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Search, Bot, Calendar } from "lucide-react";
import ScoreCircle from "@/components/ScoreCircle";

// Demo dashboard - shows recent scans
export default async function DashboardPage() {
  const recentScans = await prisma.scan.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">דשבורד</h1>
          <p className="text-gray-400 text-sm">מעקב אחרי נראות AI לאורך זמן</p>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          סריקה חדשה
        </Link>
      </div>

      {recentScans.length === 0 ? (
        <div className="text-center py-20">
          <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">עדיין לא ביצעת סריקות</h2>
          <p className="text-gray-400 mb-6">התחל בסריקה חינמית של העסק שלך</p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            סרוק עכשיו - חינם
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentScans.map((scan) => {
            const tools = JSON.parse(scan.details) as { tool: string; mentioned: boolean }[];
            const mentioned = tools.filter((t) => t.mentioned).length;
            return (
              <Link
                key={scan.id}
                href={`/report/${scan.id}`}
                className="block bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-center gap-5">
                  <ScoreCircle score={scan.score} size="sm" />
                  <div className="flex-1">
                    <div className="font-semibold">{scan.business.name}</div>
                    <div className="text-sm text-gray-400">{scan.business.industry}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{mentioned}/4</div>
                    <div className="text-xs text-gray-500">כלים</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(scan.createdAt).toLocaleDateString("he-IL")}
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Upgrade prompt */}
      <div className="mt-10 bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="font-semibold mb-1">שדרג לסריקה אוטומטית</div>
          <div className="text-sm text-gray-400">קבל סריקה חודשית אוטומטית ותכנית פעולה מפורטת</div>
        </div>
        <Link
          href="/pricing"
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
        >
          $5/חודש
        </Link>
      </div>
    </div>
  );
}
