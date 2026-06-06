"use client";

import { useEffect, useRef, useState } from "react";
import { calculateTechnicalSignal } from "@/lib/signal-engine";

/* ======================================================
   TYPES
====================================================== */

export type Decision =
  | "LONG"
  | "SHORT"
  | "NO TRADE";

export type Signal = {
  score: number;
  decision: Decision;
};

type Candle = {
  time: number;
  close: number;
  volume: number;
};

type Props = {
  candles: Candle[];
  interval: string;
  onSignal?: (signal: Signal) => void;
};

export default function TechnicalSignal(props: Props) {
  const {
    candles = [],
    interval = "1m",
    onSignal,
  } = props;

  const lastRef = useRef<number | null>(null);

  const [signal, setSignal] =
    useState<Signal | null>(null);

  /* ======================================================
     SIGNAL ENGINE
  ====================================================== */

  useEffect(() => {
    if (!candles || candles.length < 60) return;

    const last = candles.at(-1);

    if (!last) return;

    if (last.time === lastRef.current) return;

    lastRef.current = last.time;

    const newSignal = calculateTechnicalSignal(candles);

    if (!newSignal) return;

    setSignal(newSignal);

    onSignal?.(newSignal);
  }, [candles, interval, onSignal]);

  /* ======================================================
     UI
  ====================================================== */

  if (!signal) return null;

  const color =
    signal.decision === "LONG"
      ? "#2dff87"
      : signal.decision === "SHORT"
      ? "#ff5e5e"
      : "#a1a1aa";

  const glow =
    signal.decision === "LONG"
      ? "0 0 30px rgba(45,255,135,0.12)"
      : signal.decision === "SHORT"
      ? "0 0 30px rgba(255,94,94,0.12)"
      : "0 0 30px rgba(255,170,0,0.08)";

  return (
    <div className="w-full min-w-0">
    <div
      className="cx-card cx-card-sm relative p-[10px] transition-all duration-300"
      style={{
        boxShadow: glow,
      }}
    >

      {/* BACKGROUND GLOW */}
      <div
        className="pointer-events-none absolute right-[-60px] top-[-60px] h-[80px] w-[80px] rounded-full blur-xl"
        style={{
          background:
            signal.decision === "LONG"
              ? "rgba(45,255,135,0.08)"
              : signal.decision === "SHORT"
              ? "rgba(255,94,94,0.08)"
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
                boxShadow: `0 0 14px ${color}`,
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

            <div className="text-[9px] font-bold tracking-[0.10em] text-[var(--cx-gold-soft)]">
              TREND ENGINE
            </div>

            <div className="mt-[2px] text-[9px] tracking-[0.16em] text-[var(--cx-text-muted)]">
              {interval} • TECHNICAL MARKET STRUCTURE
            </div>

          </div>

        </div>

        {/* STATUS */}
        <div
          className="rounded-full border px-2 py-[4px] text-[10px] font-semibold tracking-[0.16em]"
          style={{
            color,
            borderColor: `${color}30`,
            background: `${color}10`,
          }}
        >
          {signal.decision}
        </div>

      </div>

      {/* ======================================================
          SCORE BAR
      ====================================================== */}

      <div className="relative z-10 mt-3">

        <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.10em] text-[var(--cx-text-muted)]">

          <span>Bearish</span>

          <span>Trend Strength</span>

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
          METRICS
      ====================================================== */}

      <div className="relative z-10 mt-3 grid grid-cols-2 gap-1">

        {/* SCORE */}
        <div className="rounded-2xl border border-[var(--cx-line-soft)] bg-white/[0.025] p-2">

          <div className="text-[7px] uppercase tracking-[0.10em] text-[var(--cx-text-muted)]">
            Technical Score
          </div>

          <div
            className="mt-1 text-[13px] font-bold"
            style={{
              color,
            }}
          >
            {signal.score.toFixed(0)}%
          </div>

        </div>

        {/* STATUS */}
        <div className="rounded-2xl border border-[var(--cx-line-soft)] bg-white/[0.025] p-3">

          <div className="text-[7px] uppercase tracking-[0.10em] text-[var(--cx-text-muted)]">
            Direction
          </div>

          <div
            className="mt-1 text-[13px] font-bold"
            style={{
              color,
            }}
          >
            {signal.decision}
          </div>

        </div>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="relative z-10 mt-2 flex items-center justify-between border-t border-white/6 pt-2">

        <div className="text-[7px] tracking-[0.14em] text-white/35">
          CRYPTONIX ANALYTICS CORE
        </div>

        <div className="text-[9px] tracking-[0.14em] text-orange-300">
          LIVE
        </div>

      </div>
      </div>
    </div>


  );
}
