"use client";

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">

      {/* ======================================================
          BASE GRADIENT
      ====================================================== */}

      <div className="absolute inset-0 bg-[#060606]" />

      {/* ======================================================
          TOP ORANGE GLOW
      ====================================================== */}

      <div
        className="
          absolute
          left-[-220px]
          top-[-220px]
          h-[520px]
          w-[520px]
          rounded-full
          bg-orange-500/10
          blur-3xl
          animate-pulse
        "
        style={{
          animationDuration: "7s",
        }}
      />

      {/* ======================================================
          RIGHT GOLD LIGHT
      ====================================================== */}

      <div
        className="
          absolute
          right-[-180px]
          top-[10%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-yellow-400/10
          blur-3xl
          animate-pulse
        "
        style={{
          animationDuration: "10s",
        }}
      />

      {/* ======================================================
          BOTTOM RED GLOW
      ====================================================== */}

      <div
        className="
          absolute
          bottom-[-240px]
          left-[20%]
          h-[520px]
          w-[520px]
          rounded-full
          bg-red-500/5
          blur-3xl
          animate-pulse
        "
        style={{
          animationDuration: "12s",
        }}
      />

      {/* ======================================================
          CENTER LIGHT
      ====================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[320px]
          w-[320px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white/[0.015]
          blur-3xl
        "
      />

      {/* ======================================================
          GRID OVERLAY
      ====================================================== */}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ======================================================
          NOISE TEXTURE
      ====================================================== */}

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* ======================================================
          FLOATING PARTICLES
      ====================================================== */}

      {/* PARTICLE 1 */}
      <div
        className="
          absolute
          left-[12%]
          top-[18%]
          h-2
          w-2
          rounded-full
          bg-orange-400
          blur-[1px]
          animate-ping
        "
        style={{
          animationDuration: "4s",
        }}
      />

      {/* PARTICLE 2 */}
      <div
        className="
          absolute
          right-[18%]
          top-[28%]
          h-2
          w-2
          rounded-full
          bg-yellow-300
          blur-[1px]
          animate-ping
        "
        style={{
          animationDuration: "6s",
        }}
      />

      {/* PARTICLE 3 */}
      <div
        className="
          absolute
          bottom-[22%]
          left-[30%]
          h-2
          w-2
          rounded-full
          bg-red-400
          blur-[1px]
          animate-ping
        "
        style={{
          animationDuration: "8s",
        }}
      />

      {/* PARTICLE 4 */}
      <div
        className="
          absolute
          bottom-[15%]
          right-[26%]
          h-2
          w-2
          rounded-full
          bg-orange-300
          blur-[1px]
          animate-ping
        "
        style={{
          animationDuration: "5s",
        }}
      />

    </div>
  );
}41