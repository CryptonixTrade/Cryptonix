"use client";

import { useEffect } from "react";
import { getSession, signOut } from "next-auth/react";

export default function SessionGuard() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const session = await getSession();

        // ❌ если сессия умерла — выкидываем
        if (!session) {
          await signOut({ callbackUrl: "/login" });
        }
      } catch (e) {
        await signOut({ callbackUrl: "/login" });
      }
    }, 5000); // ⏱ 5 секунд

    return () => clearInterval(interval);
  }, []);

  return null;
}