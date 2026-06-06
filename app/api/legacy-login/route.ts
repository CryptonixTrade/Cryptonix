import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return NextResponse.redirect(new URL("/login", req.url), {
      status: 303,
    });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=CredentialsSignin", req.url), {
      status: 303,
    });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return NextResponse.redirect(new URL("/login?error=CredentialsSignin", req.url), {
      status: 303,
    });
  }

  const sessionId = randomUUID();

  await prisma.user.update({
    where: { id: user.id },
    data: { currentSessionId: sessionId },
  });

  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return NextResponse.redirect(new URL("/login?error=Configuration", req.url), {
      status: 303,
    });
  }

  const maxAge = 60 * 60 * 6;
  const token = await encode({
    secret,
    maxAge,
    token: {
      id: user.id,
      sub: user.id,
      name: user.username,
      role: user.role,
      sessionId,
      invalid: false,
    },
  });

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const secureCookie =
    proto === "https" ||
    proto === "https:" ||
    process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookieName = `${secureCookie ? "__Secure-" : ""}next-auth.session-token`;
  const redirectTo = user.role === "admin" ? "/admin/users" : "/dashboard";
  const res = NextResponse.redirect(new URL(redirectTo, req.url), {
    status: 303,
  });

  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: secureCookie,
    maxAge,
  });

  return res;
}
