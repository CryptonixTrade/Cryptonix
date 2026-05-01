"use client";

import { useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;

    const checkSession = async () => {
      const session = await getSession();

      if (!session) {
        await signOut({ callbackUrl: "/login" });
      }
    };

    // 🔥 мгновенная проверка
    checkSession();

    // 🔁 периодическая (1 секунда)
    const interval = setInterval(checkSession, 1);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}