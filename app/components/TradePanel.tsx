"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/price-format";

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
    <div className="cryptonixTradePanel cx-panel relative overflow-hidden p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="cryptonixTradePanelHeader relative z-10 flex items-center justify-between">

        {/* LEFT */}
        <div>

          <div className="text-xl font-semibold text-white">
            Execution AI
          </div>

          <div className="mt-1 text-[11px] tracking-[0.14em] text-[var(--cx-text-muted)]">
            Signal-controlled entry layer
          </div>

        </div>

        {/* LIVE STATUS */}
        <div className="cxLivePill">

          <span />
          Live

        </div>

      </div>

      {/* ======================================================
          PRICE
      ====================================================== */}

      <div className="cryptonixTradePanelPrice relative z-10 mt-6 text-center">

        <div className="cxMicroLabel">
          Current Price
        </div>

        <div className="mt-3 text-5xl font-semibold tracking-normal text-white">

          $
          {formatPrice(price || 0)}

        </div>

      </div>

      {/* ======================================================
          AI STATUS
      ====================================================== */}

      <div
        className="cryptonixTradePanelStatus cxSignalModule relative z-10 mt-7 overflow-hidden rounded-[26px] border p-5"
        style={{
          borderColor: `${signalColor}25`,
          background: `${signalColor}08`,
        }}
      >

        {/* INNER GLOW */}
        <div className="relative z-10 flex items-center justify-between">

          {/* LEFT */}
          <div>

            <div className="cxMicroLabel">
              AI Signal
            </div>

            <div
              className="mt-2 text-3xl font-semibold"
              style={{
                color: signalColor,
              }}
            >
              {aiDecision}
            </div>

          </div>

          {/* CONFIDENCE */}
          <div className="text-right">

            <div className="cxMicroLabel">
              Confidence
            </div>

            <div className="mt-2 text-3xl font-semibold text-white">
              {aiConfidence.toFixed(0)}%
            </div>

          </div>

        </div>

        {/* BAR */}
        <div className="relative mt-5 h-[8px] overflow-hidden rounded-full bg-white/[0.07]">

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
          cryptonixTradeMainAction relative z-10 mt-7 w-full overflow-hidden rounded-full py-4 text-sm font-semibold tracking-[0.08em] transition-all duration-500
          ${
            isBlocked
              ? "cursor-not-allowed border border-white/10 bg-white/[0.035] text-gray-500"
              : aiDecision === "LONG"
              ? "border border-green-300/40 bg-green-300 text-black shadow-[0_18px_38px_rgba(45,255,135,0.18)] hover:scale-[1.01]"
              : "border border-red-300/40 bg-red-300 text-black shadow-[0_18px_38px_rgba(255,94,94,0.18)] hover:scale-[1.01]"
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

      <div className="cryptonixTradeManualControls relative z-10 mt-4 grid grid-cols-2 gap-3">

        {/* LONG */}
        <button
          disabled={isBlocked}
          onClick={() => handleClick("LONG")}
          className={`
            rounded-full border py-3 text-sm font-semibold tracking-[0.08em] transition-all duration-500
            ${
              isBlocked
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-gray-600"
                : selected === "LONG"
                ? "border-green-300 bg-green-300 text-black shadow-[0_16px_30px_rgba(45,255,135,0.16)]"
                : "border-white/10 bg-white/[0.035] text-green-300 hover:border-green-300/30 hover:bg-green-300/10"
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
            rounded-full border py-3 text-sm font-semibold tracking-[0.08em] transition-all duration-500
            ${
              isBlocked
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-gray-600"
                : selected === "SHORT"
                ? "border-red-300 bg-red-300 text-black shadow-[0_16px_30px_rgba(255,94,94,0.16)]"
                : "border-white/10 bg-white/[0.035] text-red-300 hover:border-red-300/30 hover:bg-red-300/10"
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
          className="cryptonixTradeInfo relative z-10 mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] p-5"
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
        <div className="cryptonixTradeWaiting relative z-10 mt-5 rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] p-6 text-center">

          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            Waiting For Trade Entry
          </div>

        </div>
      )}

    </div>
  );
}
