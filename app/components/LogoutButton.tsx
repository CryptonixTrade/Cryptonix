"use client";

import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  // ❌ если не залогинен — НЕ показываем кнопку
  if (!session) return null;
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "8px 12px",
        fontSize: "12px",
        background: "rgba(90, 4, 4, 0.8)",
        color: "white",
        border: "none",
        borderRadius: "55px",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      Exit
    </button>
  );
}