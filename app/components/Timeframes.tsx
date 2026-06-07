"use client";

import { useState } from "react";

export default function Timeframes(props: any) {
  const {
    interval = "1m",
    setIntervalState = () => {},
    signals = {},
    activeSignal = "",
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
  const primaryTf = new Set([
    "1m",
    "3m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
  ]);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="cryptonixTimeframes cxControlSurface w-full">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-4 flex items-center justify-between">

        <div>

          <div className="cxMicroLabel">
            Time horizon
          </div>

        </div>

        {/* ACTIVE */}
        <div className="cx-chip px-3 py-[6px] text-[10px]">

          {interval}

        </div>

      </div>

      {/* ======================================================
          TIMEFRAMES GRID
      ====================================================== */}

      <div
        className={`cxTimeframeRail flex flex-wrap gap-2 ${
          expanded ? "cxTimeframeRailExpanded" : "cxTimeframeRailCollapsed"
        }`}
      >

        {tf.map((t) => {
          const active = interval === t;
          const primary = primaryTf.has(t);
          const coreSignal =
            activeSignal === "LONG" || activeSignal === "SHORT"
              ? activeSignal
              : "";
          const signal = active ? coreSignal : signals?.[t];
          const signalClass =
            signal === "LONG"
              ? "cxTimeframeSignalLong"
              : signal === "SHORT"
              ? "cxTimeframeSignalShort"
              : "";

          return (
            <button
              key={t}
              onClick={() => {
                if (t === interval) return;

                setIntervalState(t);
              }}
              disabled={active}
              className={`
                ${primary || active ? "" : "cxTimeframeOptionWide"}
                cxTimeframeButton group relative flex h-[40px] min-w-[44px] items-center justify-center
                overflow-hidden rounded-full border px-3
                text-[11px] font-semibold
                transition-all duration-500
                ${
                  active
                    ? "border-white/70 bg-white text-black shadow-[0_18px_38px_rgba(255,255,255,0.16)]"
                    : "border-white/10 bg-white/[0.035] text-white/[0.58] hover:border-white/[0.22] hover:bg-white/[0.075] hover:text-white"
                }
              `}
              title={
                signal
                  ? `${t}: AI ${signal} signal`
                  : `${t}: no active AI signal`
              }
            >

              {/* GLOW */}
              {!active && (
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

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

              {signal && (
                <span
                  className={`cxTimeframeSignal ${signalClass}`}
                  aria-label={`AI ${signal} signal on ${t}`}
                />
              )}

            </button>
          );
        })}

      </div>

      <button
        type="button"
        className="cxTimeframeToggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded ? "Show fewer timeframes" : "Show all timeframes"}
      >
        <span>{expanded ? "Less" : "More"}</span>
        <span aria-hidden="true">{expanded ? "^" : "v"}</span>
      </button>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3">

        <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--cx-text-muted)]">
          Active Interval
        </div>

        <div className="text-[11px] font-bold text-[var(--cx-gold-soft)]">
          {interval}
        </div>

      </div>

    </div>
  );
}
