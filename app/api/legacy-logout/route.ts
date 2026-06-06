import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const secureCookie =
    proto === "https" ||
    proto === "https:" ||
    process.env.NEXTAUTH_URL?.startsWith("https://");
  const sessionCookieName = `${secureCookie ? "__Secure-" : ""}next-auth.session-token`;
  const callbackCookieName = `${secureCookie ? "__Secure-" : ""}next-auth.callback-url`;
  const csrfCookieName = `${secureCookie ? "__Host-" : ""}next-auth.csrf-token`;
  const res = NextResponse.redirect(new URL("/login", req.url), {
    status: 303,
  });

  for (const name of [sessionCookieName, callbackCookieName, csrfCookieName]) {
    res.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: secureCookie,
      maxAge: 0,
    });
  }

  return res;
}
