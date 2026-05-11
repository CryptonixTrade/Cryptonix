"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Cryptonix from "./Cryptonix";

export default function Dashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  /* ======================================================
     LOADING SCREEN
  ====================================================== */

  if (status === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505]">

        {/* BACKGROUND GLOW */}
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />

        {/* CARD */}
        <div className="glass-card gold-glow relative z-10 flex w-[320px] flex-col items-center justify-center gap-5 px-8 py-10">

          {/* LOGO */}
          <div className="relative flex items-center justify-center">

            <div className="absolute h-20 w-20 rounded-full border border-orange-400/20" />

            <div className="absolute h-28 w-28 rounded-full border border-orange-400/10" />

            <div className="h-4 w-4 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(255,160,0,0.95)] animate-pulse" />

          </div>

          {/* TITLE */}
          <div className="flex flex-col items-center">

            <div className="text-2xl font-bold tracking-[0.22em] text-orange-400">
              CRYPTONIX
            </div>

            <div className="mt-2 text-xs uppercase tracking-[0.35em] text-white/35">
              AI Trading Terminal
            </div>

          </div>

          {/* LOADING BAR */}
          <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white/5">

            <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-orange-500 to-yellow-300" />

          </div>

          {/* TEXT */}
          <div className="text-xs tracking-[0.18em] text-white/40">
            INITIALIZING SESSION
          </div>

        </div>

        {/* KEYFRAMES */}
        <style jsx>{`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(220%);
            }
          }
        `}</style>

      </div>
    );
  }

  /* ======================================================
     UNAUTHENTICATED
  ====================================================== */

  if (!session) {
    return null;
  }

  /* ======================================================
     DASHBOARD
  ====================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* AMBIENT LIGHTS */}
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-[360px] w-[360px] rounded-full bg-yellow-500/10 blur-3xl" />

      {/* MAIN TERMINAL */}
      <div className="relative z-10">
        <Cryptonix />
      </div>

    </div>
  );
}