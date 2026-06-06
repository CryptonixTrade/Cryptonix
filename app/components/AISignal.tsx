"use client";

import { useEffect, useRef, useState } from "react";
import {
  calculateAiSignal,
  decisionFromScore,
  getSignalTtl,
  smoothSignalScore,
} from "@/lib/signal-engine";

type Decision = "LONG" | "SHORT" | "NO TRADE" | "EXPIRED";

type Signal = {
  score: number;
  decision: Decision;
  confidence: number;
  entryTime: number;
  expiryTime: number;
  hold: string;
  entryPrice: number;
};

type AISignalProps = {
  candles: any[];
  onSignal: (signal: any) => void;
  flow: any;
  orderBook?: {
    imbalance: number;
    bidVolume: number;
    askVolume: number;
  };
  interval: string;
  techSignal: any;
};

export default function AISignal(props: AISignalProps) {
  const {
    candles = [],
    onSignal,
    flow,
    orderBook,
    interval = "1m",
    techSignal,
  } = props;

  const [signal, setSignal] = useState<Signal | null>(null);

  const lastCandleRef = useRef<number | null>(null);
  const scoreRef = useRef<number | null>(null);

  /* ======================================================
     SIGNAL GENERATION
  ====================================================== */

  useEffect(() => {
    if (!candles.length) return;

    const last = candles.at(-1);

    if (!last) return;

    if (last.time === lastCandleRef.current) return;

    lastCandleRef.current = last.time;

    const engineSignal = calculateAiSignal({
      candles,
      flow,
      orderBook,
      techSignal,
    });

    if (!engineSignal) return;

    const smooth = smoothSignalScore(scoreRef.current, engineSignal.score);

    scoreRef.current = smooth;

    const decision = decisionFromScore(smooth);

    const prev = candles[candles.length - 5];

    if (!prev) return;

    const volatility = Math.abs(last.close - prev.close) / last.close;
    const ttl = getSignalTtl(interval, volatility);
    const confidence =
      decision === "NO TRADE"
        ? 0
        : Math.min(
            100,
            engineSignal.confidence + Math.abs(smooth - engineSignal.score) * 0.35
          );

    const now = Date.now();

    const newSignal: Signal = {
      score: smooth,
      decision,
      confidence,
      entryTime: now,
      expiryTime: now + ttl * 60000,
      hold: `${ttl} min`,
      entryPrice: last.close,
    };

    setSignal(newSignal);

    onSignal?.(newSignal);
  }, [candles, flow, orderBook, interval, techSignal, onSignal]);

  /* ======================================================
     EMPTY
  ====================================================== */

  if (!signal) return null;

  /* ======================================================
     STATES
  ====================================================== */

  const expired = Date.now() > signal.expiryTime;

  const decision = expired
    ? "EXPIRED"
    : signal.decision;

  const color =
    decision === "LONG"
      ? "#2dff87"
      : decision === "SHORT"
      ? "#ff5e5e"
      : "#a1a1aa";

  const glow =
    decision === "LONG"
      ? "0 0 30px rgba(45,255,135,0.15)"
      : decision === "SHORT"
      ? "0 0 30px rgba(255,94,94,0.15)"
      : "0 0 30px rgba(255,255,255,0.05)";

  function getTimeLeft(expiry: number) {
    const diff = expiry - Date.now();

    if (diff <= 0) return "expired";

    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${m}m ${s}s`;
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="w-full min-w-0">
    <div
      className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[rgba(12,12,14,0.72)] p-[10px] backdrop-blur-xl transition-all duration-300"
      style={{
        boxShadow: glow,
      }}
    >

      {/* BACKGROUND GLOW */}
      <div
        className="pointer-events-none absolute right-[-60px] top-[-60px] h-[80px] w-[80px] rounded-full blur-3xl"
        style={{
          background:
            decision === "LONG"
              ? "rgba(45,255,135,0.10)"
              : decision === "SHORT"
              ? "rgba(255,94,94,0.10)"
              : "rgba(255,170,0,0.08)",
        }}
      />

      {/* TOP LINE */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative z-10 flex items-start justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-1">

          {/* SIGNAL DOT */}
          <div className="relative flex items-center justify-center">

            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 16px ${color}`,
              }}
            />

            <div
              className="absolute h-3 w-3 animate-ping rounded-full opacity-40"
              style={{
                background: color,
              }}
            />

          </div>

          {/* TITLES */}
          <div>

            <div className="text-[10px] font-bold tracking-[0.18em] text-orange-400">
              CRYPTONIX AI
            </div>

            <div className="mt-[2px] text-[10px] tracking-[0.08em] text-white/35">
              {interval} • AI SIGNAL
            </div>

          </div>

        </div>

        {/* DECISION */}
        <div
          className="rounded-full border px-2 py-[4px] text-[10px] font-semibold tracking-[0.16em]"
          style={{
            color,
            borderColor: `${color}30`,
            background: `${color}10`,
          }}
        >
          {decision}
        </div>

      </div>

      {/* ======================================================
          SCORE BAR
      ====================================================== */}

      <div className="relative z-10 mt-3">

        {/* LABELS */}
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.10em] text-white/35">

          <span>Bearish</span>

          <span>AI Confidence</span>

          <span>Bullish</span>

        </div>

        {/* BAR */}
        <div className="relative h-[10px] overflow-hidden rounded-full bg-white/5">

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-zinc-700 to-green-400 opacity-80" />

          {/* POINTER */}
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-black"
            style={{
              left: `calc(${signal.score}% - 6px)`,
              background: color,
              boxShadow: `0 0 18px ${color}`,
            }}
          />

        </div>

      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">

        {/* SCORE */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-2">

          <div className="text-[8px] uppercase tracking-[0.18em] text-white/35">
            Score
          </div>

          <div
            className="mt-1 text-[15px] font-bold"
            style={{ color }}
          >
            {signal.score.toFixed(0)}%
          </div>

        </div>

        {/* CONFIDENCE */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Confid.
          </div>

          <div className="mt-1 text-[15px] font-bold text-orange-400">
            {signal.confidence.toFixed(0)}%
          </div>

        </div>

        {/* HOLD */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Hold
          </div>

          <div className="mt-1 text-[15px] font-bold text-white">
            {signal.hold}
          </div>

        </div>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="relative z-10 mt-2 flex items-center justify-between border-t border-white/6 pt-2">

        <div className="text-[9px] tracking-[0.14em] text-white/35">
          ENTRY:{" "}
          <span className="text-white/80">
            {signal.entryPrice.toFixed(2)}
          </span>
        </div>

        <div
          className={`text-[11px] tracking-[0.14em] ${
            expired
              ? "text-red-400"
              : "text-white/45"
          }`}
        >
          {getTimeLeft(signal.expiryTime)}
          </div>

</div>

</div>

</div>

);
}
