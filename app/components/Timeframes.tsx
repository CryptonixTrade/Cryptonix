"use client";

export default function Timeframes(props: any) {
  const {
    interval = "1m",
    setIntervalState = () => {},
  } = props;

  const tf = [
    "1m",
    "3m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "12h",
    "1d",
    "1w",
    "1M",
  ];

  return (
    <div className="w-full">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-3 flex items-center justify-between">

        <div>

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Market Timeframes
          </div>

          <div className="mt-1 text-sm font-semibold text-orange-400">
            Multi-Timeframe Analysis
          </div>

        </div>

        {/* ACTIVE */}
        <div className="rounded-full border border-orange-400/15 bg-orange-400/10 px-3 py-[6px] text-[10px] font-bold tracking-[0.18em] text-orange-300">

          {interval}

        </div>

      </div>

      {/* ======================================================
          TIMEFRAMES GRID
      ====================================================== */}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-4">

        {tf.map((t) => {
          const active = interval === t;

          return (
            <button
              key={t}
              onClick={() => {
                if (t === interval) return;

                setIntervalState(t);
              }}
              disabled={active}
              className={`
                group relative overflow-hidden rounded-2xl border py-3 text-xs font-semibold tracking-[0.16em] transition-all duration-300
                ${
                  active
                    ? "border-orange-400 bg-orange-400 text-black shadow-[0_0_24px_rgba(255,170,0,0.28)]"
                    : "border-white/8 bg-white/[0.03] text-white/65 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >

              {/* GLOW */}
              {!active && (
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0" />

                </div>
              )}

              {/* ACTIVE PULSE */}
              {active && (
                <div className="absolute inset-0 animate-pulse bg-white/5" />
              )}

              {/* TEXT */}
              <span className="relative z-10">
                {t}
              </span>

            </button>
          );
        })}

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-4">

        <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Active Interval
        </div>

        <div className="text-sm font-bold text-orange-400">
          {interval}
        </div>

      </div>

    </div>
  );
}