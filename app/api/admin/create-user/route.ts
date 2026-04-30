import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { username, password, role } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      role: role || "user",
    },
  });

  return NextResponse.json(user);
}