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

      <div className="mb-1 flex items-center justify-between">

        <div>

          <div className="text-[8px] uppercase tracking-[0.18em] text-white/35">
            Market Timeframes
          </div>

          <div className="mt-[2px] text-[11px] font-semibold text-orange-400">
            Multi-Timeframe Analysis
          </div>

        </div>

        {/* ACTIVE */}
        <div className="rounded-full border border-orange-400/15 bg-orange-400/10 px-2 py-[2px] text-[8px] font-bold tracking-[0.16em] text-orange-300">

          {interval}

        </div>

      </div>

      {/* ======================================================
          TIMEFRAMES GRID
      ====================================================== */}

      <div className="flex flex-wrap gap-2">

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
                group relative flex h-[34px] w-[34px] items-center justify-center
                overflow-hidden rounded-full border
                text-[9px] font-bold
                transition-all duration-300
                ${
                  active
                    ? "border-orange-400 bg-orange-400 text-black shadow-[0_0_18px_rgba(255,170,0,0.22)]"
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

      <div className="mt-1 flex items-center justify-between border-t border-white/6 pt-1">

        <div className="text-[8px] uppercase tracking-[0.16em] text-white/30">
          Active Interval
        </div>

        <div className="text-[11px] font-bold text-orange-400">
          {interval}
        </div>

      </div>

    </div>
  );
}