"use client";

import { useEffect, useState } from "react";

export default function TradePanel(props: any) {
  const {
    trade = null,
    price = 0,
    selected = null,
    onTrade = () => {},
    aiSignal = null,
  } = props;

  const [pnl, setPnl] = useState<number | null>(null);

  /* ======================================================
     HELPERS
  ====================================================== */

  function formatPrice(p: number) {
    if (!p) return "--";

    if (p < 0.001) return p.toFixed(8);
    if (p < 1) return p.toFixed(6);
    if (p < 100) return p.toFixed(4);
    if (p < 1000) return p.toFixed(3);

    return p.toFixed(2);
  }

  /* ======================================================
     PNL
  ====================================================== */

  useEffect(() => {
    if (!trade || !price) {
      setPnl(null);
      return;
    }

    let result = 0;

    if (trade.type === "LONG") {
      result =
        ((price - trade.entry) / trade.entry) * 100;
    } else {
      result =
        ((trade.entry - price) / trade.entry) * 100;
    }

    setPnl((prev) => {
      if (prev === null) return result;

      return prev * 0.7 + result * 0.3;
    });
  }, [price, trade]);

  /* ======================================================
     STATES
  ====================================================== */

  const pnlColor =
    pnl === null
      ? "text-gray-400"
      : pnl >= 0
      ? "text-green-400"
      : "text-red-400";

  const activeColor =
    selected === "LONG"
      ? "text-green-400"
      : selected === "SHORT"
      ? "text-red-400"
      : "text-gray-400";

  const aiDecision =
    aiSignal?.decision || "NO TRADE";

  const aiConfidence =
    aiSignal?.confidence || 0;

  const isBlocked =
    aiDecision === "NO TRADE";

  function handleClick(type: "LONG" | "SHORT") {
    onTrade(type);
  }

  const signalColor =
    aiDecision === "LONG"
      ? "#2dff87"
      : aiDecision === "SHORT"
      ? "#ff5e5e"
      : "#a1a1aa";

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(12,12,14,0.72)] p-5 backdrop-blur-xl">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute bottom-[-80px] right-[-80px] h-[180px] w-[180px] rounded-full bg-orange-500/10 blur-3xl" />

      {/* TOP LINE */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-80" />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative z-10 flex items-center justify-between">

        {/* LEFT */}
        <div>

          <div className="text-sm font-bold tracking-[0.18em] text-orange-400">
            AI TRADE PANEL
          </div>

          <div className="mt-1 text-[11px] tracking-[0.16em] text-white/35">
            EXECUTION TERMINAL
          </div>

        </div>

        {/* LIVE STATUS */}
        <div className="flex items-center gap-2 rounded-full border border-orange-400/15 bg-orange-400/10 px-3 py-[6px]">

          <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />

          <div className="text-[10px] font-semibold tracking-[0.18em] text-orange-300">
            LIVE
          </div>

        </div>

      </div>

      {/* ======================================================
          PRICE
      ====================================================== */}

      <div className="relative z-10 mt-6 text-center">

        <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
          Current Price
        </div>

        <div className="mt-2 text-3xl font-bold tracking-tight text-white">

          $
          {formatPrice(price || 0)}

        </div>

      </div>

      {/* ======================================================
          AI STATUS
      ====================================================== */}

      <div
        className="relative z-10 mt-6 overflow-hidden rounded-2xl border p-4"
        style={{
          borderColor: `${signalColor}25`,
          background: `${signalColor}08`,
        }}
      >

        {/* INNER GLOW */}
        <div
          className="pointer-events-none absolute right-[-30px] top-[-30px] h-[90px] w-[90px] rounded-full blur-2xl"
          style={{
            background: `${signalColor}25`,
          }}
        />

        <div className="relative z-10 flex items-center justify-between">

          {/* LEFT */}
          <div>

            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              AI Signal
            </div>

            <div
              className="mt-1 text-xl font-bold"
              style={{
                color: signalColor,
              }}
            >
              {aiDecision}
            </div>

          </div>

          {/* CONFIDENCE */}
          <div className="text-right">

            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Confidence
            </div>

            <div className="mt-1 text-xl font-bold text-orange-400">
              {aiConfidence.toFixed(0)}%
            </div>

          </div>

        </div>

        {/* BAR */}
        <div className="relative mt-4 h-[10px] overflow-hidden rounded-full bg-white/5">

          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${Math.min(aiConfidence, 100)}%`,
              background: `linear-gradient(to right, ${signalColor}88, ${signalColor})`,
            }}
          />

        </div>

      </div>

      {/* ======================================================
          MAIN ACTION
      ====================================================== */}

      <button
        disabled={isBlocked}
        onClick={() =>
          handleClick(aiDecision)
        }
        className={`
          relative z-10 mt-6 w-full overflow-hidden rounded-2xl py-4 text-sm font-bold tracking-[0.18em] transition-all duration-300
          ${
            isBlocked
              ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-gray-500"
              : aiDecision === "LONG"
              ? "border border-green-400/30 bg-green-400 text-black shadow-[0_0_25px_rgba(45,255,135,0.25)] hover:scale-[1.01]"
              : "border border-red-400/30 bg-red-400 text-black shadow-[0_0_25px_rgba(255,94,94,0.25)] hover:scale-[1.01]"
          }
        `}
      >
        {isBlocked
          ? "NO TRADE AVAILABLE"
          : `ENTER ${aiDecision}`}
      </button>

      {/* ======================================================
          MANUAL CONTROLS
      ====================================================== */}

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">

        {/* LONG */}
        <button
          disabled={isBlocked}
          onClick={() => handleClick("LONG")}
          className={`
            rounded-2xl border py-3 text-sm font-bold tracking-[0.16em] transition-all duration-300
            ${
              isBlocked
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-gray-600"
                : selected === "LONG"
                ? "border-green-400 bg-green-400 text-black shadow-[0_0_20px_rgba(45,255,135,0.25)]"
                : "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
            }
          `}
        >
          LONG
        </button>

        {/* SHORT */}
        <button
          disabled={isBlocked}
          onClick={() => handleClick("SHORT")}
          className={`
            rounded-2xl border py-3 text-sm font-bold tracking-[0.16em] transition-all duration-300
            ${
              isBlocked
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-gray-600"
                : selected === "SHORT"
                ? "border-red-400 bg-red-400 text-black shadow-[0_0_20px_rgba(255,94,94,0.25)]"
                : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }
          `}
        >
          SHORT
        </button>

      </div>

      {/* ======================================================
          TRADE INFO
      ====================================================== */}

      {trade ? (
        <div
          className="relative z-10 mt-5 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-4"
        >

          {/* HEADER */}
          <div className="flex items-center justify-between">

            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              Active Position
            </div>

            <div
              className={`text-sm font-bold ${activeColor}`}
            >
              {trade.type}
            </div>

          </div>

          {/* DATA */}
          <div className="mt-4 space-y-3">

            {/* ENTRY */}
            <div className="flex items-center justify-between">

              <div className="text-[11px] tracking-[0.14em] text-white/40">
                ENTRY
              </div>

              <div className="text-sm font-semibold text-white">
                {formatPrice(trade.entry)}
              </div>

            </div>

            {/* TP */}
            <div className="flex items-center justify-between">

              <div className="text-[11px] tracking-[0.14em] text-white/40">
                TAKE PROFIT
              </div>

              <div className="text-sm font-semibold text-green-400">
                {formatPrice(trade.take)}
              </div>

            </div>

            {/* SL */}
            <div className="flex items-center justify-between">

              <div className="text-[11px] tracking-[0.14em] text-white/40">
                STOP LOSS
              </div>

              <div className="text-sm font-semibold text-red-400">
                {formatPrice(trade.stop)}
              </div>

            </div>

          </div>

          {/* PNL */}
          <div className="mt-5 border-t border-white/6 pt-4 text-center">

            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Unrealized PNL
            </div>

            <div
              className={`mt-2 text-3xl font-bold ${pnlColor}`}
            >
              {pnl !== null
                ? `${pnl.toFixed(2)}%`
                : "--"}
            </div>

          </div>

        </div>
      ) : (
        <div className="relative z-10 mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">

          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            Waiting For Trade Entry
          </div>

        </div>
      )}

    </div>
  );
}
