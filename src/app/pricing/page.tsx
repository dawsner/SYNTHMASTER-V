import { Check, Search } from "lucide-react";
import Link from "next/link";
import PricingCard from "@/components/PricingCard";
import { PLANS } from "@/lib/stripe";

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">תמחור פשוט ושקוף</h1>
        <p className="text-xl text-gray-400">
          הסריקה תמיד חינמית. שדרג כשאתה מוכן לצמוח.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {/* Free */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900/40 p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">חינמי</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-gray-400">/תמיד</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {[
              "דוח נראות מלא",
              "ניתוח 4 כלי AI",
              "המלצות כלליות",
              "שיתוף הדוח",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/scan"
            className="block text-center border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white py-3 rounded-xl font-semibold transition-all"
          >
            התחל בחינם
          </Link>
        </div>

        {/* Starter */}
        <PricingCard
          name={PLANS.starter.name}
          price={PLANS.starter.price}
          features={[...PLANS.starter.features]}
          plan="starter"
        />

        {/* Coach */}
        <PricingCard
          name={PLANS.coach.name}
          price={PLANS.coach.price}
          features={[...PLANS.coach.features]}
          plan="coach"
          highlighted
        />
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">שאלות נפוצות</h2>
        <div className="space-y-4">
          {[
            {
              q: "מה בדיוק הסריקה החינמית כוללת?",
              a: "סריקה מלאה של 4 כלי AI (ChatGPT, Perplexity, Gemini, Claude), ציון נראות, ממצאים מפורטים לכל כלי, והמלצות לשיפור. ללא הגבלה."
            },
            {
              q: "איך ה-AI Coach עובד?",
              a: "AI Coach מבוסס Claude שמכיר את העסק שלך ואת תוצאות הסריקה. אפשר לשאול אותו שאלות, לבקש הסברים, ולקבל הדרכה אישית צעד אחר צעד."
            },
            {
              q: "האם אפשר לבטל בכל עת?",
              a: "כן, אפשר לבטל את המנוי בכל עת. הביטול ייכנס לתוקף בסוף תקופת החיוב."
            },
            {
              q: "כיצד מחושב ציון הנראות?",
              a: "הציון מחושב לפי: האם העסק מוזכר בכלל (50%), בולטות ההזכרה (30%), ודיוק המידע (20%)."
            },
          ].map((item) => (
            <div key={item.q} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
        >
          <Search className="w-5 h-5" />
          התחל בסריקה חינמית
        </Link>
      </div>
    </div>
  );
}
