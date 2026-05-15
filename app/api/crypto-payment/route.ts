import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      plan,
      amount,
      email,
    } = body;

    const response =
    await resend.emails.send({
      from:
        "Cryptonix <onboarding@resend.dev>",
  
      to:
      "cryptonix.life@gmail.com",
  
      subject:
        "New Crypto Payment Request",
  
      html: `
        <h2>New Crypto Payment</h2>
  
        <p><b>Plan:</b> ${plan}</p>
  
        <p><b>Amount:</b> ${amount}</p>
  
        <p><b>Email:</b> ${email}</p>
      `,
    });
  
  console.log(response);

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