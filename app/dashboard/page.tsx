"use client";

import { useSession } from "next-auth/react";
import Cryptonix from "./Cryptonix"; // ✅ ВАЖНО: локальный импорт

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (!session) {
    window.location.href = "/login";
    return null;
  }

  return <Cryptonix />;
}