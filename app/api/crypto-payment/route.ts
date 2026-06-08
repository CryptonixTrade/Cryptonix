import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isKnownPaymentRequest } from "@/lib/payment-config";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

function escapeHtml(value: unknown) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      plan,
      amount,
      email,
    } = body;

    if (!isKnownPaymentRequest(plan, amount)) {
      return NextResponse.json(
        {
          error: "Invalid payment plan",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          error: "Invalid email",
        },
        {
          status: 400,
        }
      );
    }

    const response = await resend.emails.send({
      from:
        "Cryptonix <onboarding@resend.dev>",
  
      to:
      "kot235235235@gmail.com",
  
      subject:
        "New Crypto Payment Request",
  
      html: `
        <h2>New Crypto Payment</h2>
  
        <p><b>Plan:</b> ${escapeHtml(plan)}</p>
  
        <p><b>Amount:</b> ${escapeHtml(amount)}</p>
  
        <p><b>Email:</b> ${escapeHtml(email)}</p>
      `,
    });

    if (response.error) {
      throw response.error;
    }

    return NextResponse.json({
      success: true,
    });

  } catch (e) {

    console.error(e);

    return NextResponse.json(
      {
        error: "Email failed",
      },
      {
        status: 500,
      }
    );
  }
}
