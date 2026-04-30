import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options"; // ❗ путь проверь

export const runtime = "nodejs";

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

    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing data" },
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
        role: role || "user",
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