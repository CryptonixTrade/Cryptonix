"use client";

export default function Header(props: any) {
  const {
    symbol = "BTCUSDT",
    price = 0,
    btcSpot = 0,
    btcFutures = 0,
  } = props;

  const change = 0.85;
  const isUp = change >= 0;

  return (
    <div className="relative mb-4 overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(12,12,14,0.72)] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.45)]">

      {/* ===== TOP GLOW ===== */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-80" />

      {/* ===== BACKGROUND LIGHT ===== */}
      <div className="absolute -left-20 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">

        {/* ======================================================
            LEFT SIDE
        ====================================================== */}
        <div className="flex items-center gap-4">

          {/* LIVE DOT */}
          <div className="relative flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_15px_rgba(255,170,0,0.9)]" />

            <div className="absolute h-3 w-3 animate-ping rounded-full bg-green-400/50" />
          </div>

          {/* BRAND + SYMBOL */}
          <div className="flex flex-col">

            <div className="flex items-center gap-2">

              <span className="text-lg font-bold tracking-[0.19em] text-orange-400 md:text-xl">
                CRYPTONIX.
              </span>

              <div className="rounded-full border border-orange-400/77 bg-orange-400/10 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-widest text-orange-300">
                LIFE
              </div>

            </div>

            <div className="mt-1 flex items-center gap-2">

              <span className="text-sm font-medium tracking-wide text-white/90 md:text-base">
                {symbol}
              </span>

              <span className="text-xs text-white/35">
                AI Trading Terminal
              </span>

            </div>

          </div>

        </div>

        {/* ======================================================
            CENTER PRICE
        ====================================================== */}
        <div className="flex flex-col items-start md:items-center">

          <div className="flex items-end gap-2">

            <div className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              $
              {price
                ? price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "--"}
            </div>

            <div
              className={`mb-1 rounded-full px-2 py-[3px] text-xs font-semibold ${
                isUp
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {isUp ? "+" : ""}
              {change}%
            </div>

          </div>

          <div className="mt-1 text-xs tracking-widest text-white/35">
            REAL-TIME MARKET DATA
          </div>

        </div>

        {/* ======================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">

          {/* SPOT */}
          <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">

            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Spot
            </div>

            <div className="mt-1 text-sm font-semibold text-green-400">
              {btcSpot
                ? btcSpot.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "--"}
            </div>

          </div>

          {/* FUTURES */}
          <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">

            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Futures
            </div>

            <div className="mt-1 text-sm font-semibold text-orange-400">
              {btcFutures
                ? btcFutures.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "--"}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}