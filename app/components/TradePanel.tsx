"use client";

import { useEffect, useState } from "react";

export default function TradePanel({
  trade,
  selected,
  onTrade,
  price,
  aiSignal
}: any) {

  const [pnl, setPnl] = useState<number | null>(null);

  function formatPrice(p: number) {
    if (!p) return "--";
    if (p < 0.001) return p.toFixed(8);
    if (p < 1) return p.toFixed(6);
    if (p < 100) return p.toFixed(4);
    if (p < 1000) return p.toFixed(3);
    return p.toFixed(2);
  }

  /* ===== PNL ===== */
  useEffect(() => {
    if (!trade || !price) {
      setPnl(null);
      return;
    }

    let result = 0;

    if (trade.type === "LONG") {
      result = ((price - trade.entry) / trade.entry) * 100;
    } else {
      result = ((trade.entry - price) / trade.entry) * 100;
    }

    setPnl(prev => {
      if (prev === null) return result;
      return prev * 0.7 + result * 0.3;
    });

  }, [price, trade]);

  const pnlColor =
    pnl === null ? "text-gray-400" : pnl >= 0 ? "text-green-400" : "text-red-400";

  const activeColor =
    selected === "LONG"
      ? "text-green-400"
      : selected === "SHORT"
      ? "text-red-400"
      : "text-gray-400";

  function handleClick(type: "LONG" | "SHORT") {
    onTrade(type);
  }

  /* ===== AI ===== */
  const aiDecision = aiSignal?.decision || "NO TRADE";
  const aiConfidence = aiSignal?.confidence || 0;
  const isBlocked = aiDecision === "NO TRADE";

  return (
    <div className="w-full lg:w-[260px] bg-[#0f0f0f] border border-[#111] rounded-xl p-4 flex flex-col gap-3">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold">
          AI Trading
        </div>
      </div>

      {/* PRICE */}
      <div className="text-center text-xl font-bold text-yellow-400">
        {formatPrice(price || 0)}
      </div>

      {/* AI STATUS */}
      <div className={`
        p-3 rounded-lg text-center text-sm border
        ${
          aiDecision === "LONG"
            ? "border-green-500/30"
            : aiDecision === "SHORT"
            ? "border-red-500/30"
            : "border-[#333]"
        }
        bg-[#111]
      `}>
        <div className={`
          font-semibold
          ${
            aiDecision === "LONG"
              ? "text-green-400"
              : aiDecision === "SHORT"
              ? "text-red-400"
              : "text-gray-400"
          }
        `}>
          {aiDecision}
        </div>

        <div className="text-xs opacity-60">
          {aiConfidence.toFixed(0)}% confidence
        </div>
      </div>

      {/* MAIN ACTION */}
      <div className="flex flex-col gap-2">

        <button
          disabled={isBlocked}
          onClick={() => handleClick(aiDecision)}
          className={`
            py-3 rounded-lg font-bold transition
            ${
              isBlocked
                ? "bg-[#222] text-gray-600 cursor-not-allowed"
                : aiDecision === "LONG"
                ? "bg-green-400 text-black hover:opacity-90"
                : "bg-red-400 text-black hover:opacity-90"
            }
          `}
        >
          {isBlocked ? "NO TRADE" : `ENTER ${aiDecision}`}
        </button>

        {!isBlocked && (
          <div className="text-[10px] text-center opacity-50">
            Based on AI signal
          </div>
        )}

      </div>

      {/* MANUAL */}
      <div className="flex gap-2 mt-1">

        <button
          onClick={() => handleClick("LONG")}
          className={`
            flex-1 py-2 text-sm rounded-md border transition
            ${
              selected === "LONG"
                ? "bg-green-400 text-black border-green-400"
                : "bg-green-500/10 text-green-400 border-green-900 hover:bg-green-500/20"
            }
          `}
        >
          LONG
        </button>

        <button
          onClick={() => handleClick("SHORT")}
          className={`
            flex-1 py-2 text-sm rounded-md border transition
            ${
              selected === "SHORT"
                ? "bg-red-400 text-black border-red-400"
                : "bg-red-500/10 text-red-400 border-red-900 hover:bg-red-500/20"
            }
          `}
        >
          SHORT
        </button>

      </div>

      {/* TRADE INFO */}
      {trade ? (
        <div className={`
          mt-2 p-3 bg-[#111] rounded-lg text-sm border
          ${
            selected === "LONG"
              ? "border-green-500/30"
              : selected === "SHORT"
              ? "border-red-500/30"
              : "border-[#333]"
          }
        `}>

          <div className={`text-center font-semibold mb-2 ${activeColor}`}>
            {trade.type}
          </div>

          <div>Entry: {formatPrice(trade.entry)}</div>

          <div className="text-green-400">
            TP: {formatPrice(trade.take)}
          </div>

          <div className="text-red-400">
            SL: {formatPrice(trade.stop)}
          </div>

          <div className={`mt-3 text-center text-lg font-bold ${pnlColor}`}>
            {pnl !== null ? pnl.toFixed(2) + "%" : "--"}
          </div>

        </div>
      ) : (
        <div className="text-xs text-center opacity-50 mt-1">
          Waiting for entry
        </div>
      )}

    </div>
  );
}