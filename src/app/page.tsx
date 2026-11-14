import Link from "next/link";
import { Brain, Search, TrendingUp, Bot, ArrowLeft, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-32">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-sm text-purple-300 mb-6">
            <Brain className="w-4 h-4" />
            <span>גלה את הנראות שלך ב-AI - בחינם</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              הלקוחות שלך
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              שואלים AI
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              האם הם מוצאים אותך?
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            מעל 50% מהחיפושים עוברים היום דרך ChatGPT, Perplexity וכלי AI נוספים.
            סרוק את הנראות שלך ב-4 כלים בחינם תוך 60 שניות.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              <Search className="w-5 h-5" />
              סרוק את העסק שלי - חינם
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              ראה תכניות
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          {[
            { label: "עסקים נסרקו", value: "2,400+" },
            { label: "ממוצע ציון נראות", value: "23/100" },
            { label: "שיפור אחרי תיקון", value: "71%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: "1",
                title: "מזין פרטים על העסק",
                desc: "שם, אתר, תעשייה ותיאור קצר. לוקח פחות מדקה.",
              },
              {
                icon: Brain,
                step: "2",
                title: "AI סורק 4 כלים",
                desc: "Claude מדמה מה ChatGPT, Perplexity, Gemini ו-Claude עצמו אומרים על העסק שלך.",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: "מקבל דוח מפורט",
                desc: "ציון נראות, ממצאים לכל כלי, והמלצות ספציפיות לשיפור.",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <item.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing preview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">מסלולים לשיפור נראות</h2>
          <p className="text-center text-gray-400 mb-12">הסריקה תמיד חינמית. שדרג לתיקון ולייעוץ.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "חינמי",
                price: "0",
                features: ["דוח נראות מלא", "ניתוח 4 כלי AI", "המלצות כלליות"],
                cta: "התחל עכשיו",
                href: "/scan",
                highlight: false,
              },
              {
                name: "Starter",
                price: "5",
                features: ["הכל מהחינמי", "סריקה חודשית אוטומטית", "תוכנית פעולה מפורטת", "דשבורד מעקב"],
                cta: "שדרג ל-$5",
                href: "/pricing",
                highlight: false,
              },
              {
                name: "AI Coach",
                price: "29",
                features: ["הכל מ-Starter", "AI Coach אישי 24/7", "יישום אוטומטי", "דוחות שבועיים"],
                cta: "קבל AI Coach",
                href: "/pricing",
                highlight: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlight
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-gray-700 bg-white/5"
                }`}
              >
                <div className="mb-4">
                  <div className="text-lg font-semibold mb-1">{plan.name}</div>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm text-gray-400 font-normal">/חודש</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${
                    plan.highlight
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-2xl p-12">
          <Bot className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">מוכן לגלות את הנראות שלך?</h2>
          <p className="text-gray-400 mb-6">סריקה חינמית. אין צורך ב-credit card. תוצאות תוך 60 שניות.</p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            התחל סריקה חינמית
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
