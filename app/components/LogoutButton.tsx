"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "8px 12px",
        fontSize: "12px",
        background: "rgba(97, 4, 4, 0.8)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        zIndex: 9999,
      }}
    >
      Exit
    </button>
  );
}