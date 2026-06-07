import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";

const ALLOWED_ROLES = new Set(["admin", "user"]);

export async function POST(req: Request) {
  try {
    // 🔐 проверка админа
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";
    const role =
      typeof body?.role === "string" && ALLOWED_ROLES.has(body.role)
        ? body.role
        : "user";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Weak password" },
        { status: 400 }
      );
    }

    if (body?.role && !ALLOWED_ROLES.has(body.role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
        role,
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
