"use client";

import { useEffect, useRef, useState } from "react";

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
     HELPERS
  ====================================================== */

  function clamp(
    v: number,
    min = -1,
    max = 1
  ): number {
    return Math.max(min, Math.min(max, v));
  }

  function calcEMA(
    data: number[],
    period: number
  ): number {
    if (!data.length) return 0;

    const k = 2 / (period + 1);

    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }

    return ema;
  }

  /* ======================================================
     SIGNAL ENGINE
  ====================================================== */

  useEffect(() => {
    if (!candles || candles.length < 60) return;

    const last = candles.at(-1);

    if (!last) return;

    if (last.time === lastRef.current) return;

    lastRef.current = last.time;

    const closes = candles.map(
      (c: Candle) => c.close
    );

    const volumes = candles.map(
      (c: Candle) => c.volume
    );

    const emaFast = calcEMA(
      closes.slice(-30),
      9
    );

    const emaSlow = calcEMA(
      closes.slice(-60),
      21
    );

    const trend = emaFast > emaSlow ? 1 : -1;

    const lastPrice = closes.at(-1);

    if (!lastPrice) return;

    const trendStrength =
      Math.abs(emaFast - emaSlow) / lastPrice;

    /* ================= FLAT MARKET ================= */

    if (trendStrength < 0.0005) {
      const neutral: Signal = {
        score: 50,
        decision: "NO TRADE",
      };

      setSignal(neutral);

      onSignal?.(neutral);

      return;
    }

    /* ================= MOMENTUM ================= */

    const prev = closes.at(-5);

    if (!prev) return;

    const momentum = clamp(
      ((lastPrice - prev) / prev) * 50
    );

    /* ================= VOLUME ================= */

    const volNow = volumes.at(-1);

    if (!volNow) return;

    const volAvg =
      volumes
        .slice(-10)
        .reduce(
          (a: number, b: number) => a + b,
          0
        ) / 10;

    let volumeScore = 0;

    if (volNow > volAvg * 1.5) {
      volumeScore = trend;
    }

    /* ================= FINAL SCORE ================= */

    const raw =
      trend * 0.5 +
      momentum * 0.3 +
      volumeScore * 0.2;

    if (Math.abs(raw) < 0.2) {
      const neutral: Signal = {
        score: 50,
        decision: "NO TRADE",
      };

      setSignal(neutral);

      onSignal?.(neutral);

      return;
    }

    const score = ((raw + 1) / 2) * 100;

    let decision: Decision = "NO TRADE";

    if (score > 60) decision = "LONG";
    else if (score < 40) decision = "SHORT";

    const newSignal: Signal = {
      score,
      decision,
    };

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
                  <div className="origin-top-left scale-[0.80] w-[49%] -mb-[40px]">
    <div
      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(12,12,14,0.72)] p-4 backdrop-blur-xl transition-all duration-300"
      style={{
        boxShadow: glow,
      }}
    >

      {/* BACKGROUND GLOW */}
      <div
        className="pointer-events-none absolute right-[-50px] top-[-50px] h-[140px] w-[140px] rounded-full blur-3xl"
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

            <div className="text-[9px] font-bold tracking-[0.18em] text-orange-400">
              TREND ENGINE
            </div>

            <div className="mt-[2px] text-[9px] tracking-[0.16em] text-white/35">
              {interval} • TECHNICAL MARKET STRUCTURE
            </div>

          </div>

        </div>

        {/* STATUS */}
        <div
          className="rounded-full border px-2 py-[4px] text-[10px]font-semibold tracking-[0.16em]"
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

        <div className="mb-2 flex items-center justify-between text-[5px] uppercase tracking-[0.18em] text-white/35">

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
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-2">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Technical Score
          </div>

          <div
            className="mt-1 text-sm font-bold"
            style={{
              color,
            }}
          >
            {signal.score.toFixed(0)}%
          </div>

        </div>

        {/* STATUS */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[7px] uppercase tracking-[0.18em] text-white/35">
            Direction
          </div>

          <div
            className="mt-1 text-sm font-bold"
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

        <div className="text-[9px] tracking-[0.14em] text-white/35">
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