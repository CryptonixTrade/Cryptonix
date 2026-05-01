"use client";

import { useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // ❌ НЕ запускаем на странице логина
    if (pathname === "/login") return;

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
    }, 5000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}