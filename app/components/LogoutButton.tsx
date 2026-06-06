"use client";

import { usePathname } from "next/navigation";

export default function LogoutButton() {
  const pathname = usePathname();

  // ❌ скрываем только на login
  if (pathname === "/login") {
    return null;
  }

  return (
    <form
      action="/api/legacy-logout"
      method="post"
      style={{
        position: "fixed",

        bottom: "20px",
        right: "20px",

        zIndex: 999999,
      }}
    >
      <button
        type="submit"
      style={{
        padding: "10px 14px",

        fontSize: "12px",
        fontWeight: 700,

        letterSpacing: "0.08em",

        background:
          "linear-gradient(135deg, rgba(120,20,20,0.92), rgba(70,0,0,0.92))",

        color: "#ffffff",

        border:
          "1px solid rgba(255,255,255,0.12)",

        borderRadius: "999px",

        cursor: "pointer",

        zIndex: 999999,

        backdropFilter: "blur(14px)",

        WebkitBackdropFilter: "blur(14px)",

        boxShadow:
          "0 0 20px rgba(255,0,0,0.18)",
      }}
    >
      EXIT TERMINAL
    </button>
    </form>
  );
}
