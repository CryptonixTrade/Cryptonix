"use client";

import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  /* ======================================================
     HIDE IF NOT AUTHORIZED
  ====================================================== */

  if (!session) return null;

  /* ======================================================
     UI
  ====================================================== */

  return (
    <button
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
      className="
        group relative overflow-hidden
        rounded-full
        border border-red-500/15
        bg-red-500/10
        px-5 py-3
        text-xs font-bold
        tracking-[0.18em]
        text-red-300
        transition-all duration-300
        hover:border-red-400/30
        hover:bg-red-500/15
        hover:text-white
        hover:shadow-[0_0_24px_rgba(255,70,70,0.18)]
        active:scale-[0.98]
      "
    >

      {/* GLOW */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">

        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0" />

      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex items-center gap-2">

        {/* DOT */}
        <div className="relative flex items-center justify-center">

          <div className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(255,70,70,0.8)]" />

          <div className="absolute h-2 w-2 animate-ping rounded-full bg-red-400/40" />

        </div>

        {/* TEXT */}
        <span>
          EXIT TERMINAL
        </span>

      </div>

    </button>
  );
}