import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLANS = {
  starter: {
    name: "Starter",
    price: 5,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      "סריקה חודשית אוטומטית",
      "המלצות שיפור מפורטות",
      "תוכנית פעולה ל-AI visibility",
      "דשבורד מעקב",
    ],
  },
  coach: {
    name: "AI Coach",
    price: 29,
    priceId: process.env.STRIPE_COACH_PRICE_ID!,
    features: [
      "הכל מ-Starter",
      "AI Coach אישי 24/7",
      "יישום אוטומטי של המלצות",
      "דוחות שבועיים",
      "עדיפות תמיכה",
    ],
  },
} as const;
