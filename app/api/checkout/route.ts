import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

  });

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type PlanType = "monthly" | "quarterly" | "yearly";

const PRICE_MAP: Record<PlanType, string> = {
  monthly: "price_1TTelkGuIvCF91z3REES1nr4",
  quarterly: "price_1TTenWGuIvCF91z3xMmbvLHL",
  yearly: "price_1TTetgGuIvCF91z3V4z3H5wo",
};

export async function POST(req: Request) {
    try {
      const { plan, }: {
          plan: PlanType;
      } = await req.json();

    const priceId = PRICE_MAP[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",


      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        plan,
      },

      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return NextResponse.json({
      url: session.url,
    });

} catch (error: any) {
    console.log("FULL STRIPE ERROR:");
    console.log(error);
  
    return NextResponse.json(
      {
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
