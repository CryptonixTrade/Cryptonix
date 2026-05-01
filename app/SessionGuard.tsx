"use client";

import { useEffect, useState } from "react";
import { getSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SessionGuard() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setAllowed(true);
      return;
    }

    const check = async () => {
      const session = await getSession();

      if (!session) {
        await signOut({ callbackUrl: "/login" });
      } else {
        setAllowed(true);
      }
    };

    check();
  }, [pathname]);

  // ❌ блокируем ВСЁ пока не проверили
  if (!allowed) return null;

  return null;
}