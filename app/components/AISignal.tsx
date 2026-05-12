"use client";

import { useEffect, useRef, useState } from "react";

type Candle = {
  time: number;
  close: number;
  volume: number;
};

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
  interval: string;
  techSignal: any;
};

export default function AISignal(props: AISignalProps) {
  const {
    candles = [],
    onSignal,
    flow,
    interval = "1m",
  } = props;

  const [signal, setSignal] = useState<Signal | null>(null);

  const lastCandleRef = useRef<number | null>(null);
  const scoreRef = useRef<number | null>(null);

  /* ======================================================
     HELPERS
  ====================================================== */

  function clamp(v: number, min = -1, max = 1) {
    return Math.max(min, Math.min(max, v));
  }

  function EMA(prev: number | null, value: number, alpha = 0.12) {
    if (prev === null) return value;
    return prev * (1 - alpha) + value * alpha;
  }

  function calcEMA(data: number[], period: number) {
    if (!data.length) return 0;

    const k = 2 / (period + 1);

    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }

    return ema;
  }

  function calcRSI(data: number[], period = 14) {
    if (data.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = data.length - period; i < data.length; i++) {
      const diff = data[i] - data[i - 1];

      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const rs = gains / (losses || 1);

    return 100 - 100 / (1 + rs);
  }

  function detectPhase(closes: number[]) {
    const short = closes.slice(-20);
    const long = closes.slice(-60);

    const shortRange = Math.max(...short) - Math.min(...short);
    const longRange = Math.max(...long) - Math.min(...long);

    const ratio = shortRange / (longRange || 1);

    if (ratio < 0.3) return "FLAT";
    if (ratio > 0.8) return "EXPANSION";

    return "TREND";
  }

  function getTTL(vol: number) {
    let base =
      interval === "1m"
        ? 2
        : interval === "5m"
        ? 8
        : 25;

    if (vol > 0.001) base *= 0.7;
    if (vol < 0.0004) base *= 1.3;

    return Math.max(1, Math.round(base));
  }

  /* ======================================================
     MAIN AI CALCULATION
  ====================================================== */

  function calculate() {
    if (candles.length < 60) return null;

    const closes = candles.map((c: Candle) => c.close);

    const last = closes.at(-1)!;
    const prev = closes.at(-5)!;

    const emaFast = calcEMA(closes.slice(-30), 9);
    const emaSlow = calcEMA(closes.slice(-60), 21);
    const higherEMA = calcEMA(closes.slice(-100), 50);

    const trend = emaFast > emaSlow ? 1 : -1;
    const higherTrend = last > higherEMA ? 1 : -1;

    const momentum = clamp(((last - prev) / prev) * 40);

    const rsi = calcRSI(closes);

    const rsiScore =
      rsi > 70
        ? -0.6
        : rsi < 30
        ? 0.6
        : 0;

    const buy = flow?.buyVolume ?? 0;
    const sell = flow?.sellVolume ?? 0;

    const flowScore =
      buy + sell > 0
        ? clamp((buy - sell) / (buy + sell))
        : 0;

    const phase = detectPhase(closes);

    const volatility = Math.abs(last - prev) / last;

    /* ===== PENALTIES ===== */

    let penalty = 1;

    if (trend !== higherTrend) penalty *= 0.7;
    if (Math.abs(flowScore) < 0.1) penalty *= 0.8;
    if (volatility < 0.00025) penalty *= 0.75;

    const agreement =
      (trend > 0 && momentum > 0 && flowScore > 0) ||
      (trend < 0 && momentum < 0 && flowScore < 0);

    if (!agreement) penalty *= 0.7;

    const impulse = Math.abs(last - prev) / prev > 0.0008;

    if (!impulse && phase !== "TREND") penalty *= 0.75;

    let phaseBoost = 1;

    if (phase === "FLAT") phaseBoost = 0.7;
    if (phase === "EXPANSION") phaseBoost = 1.2;

    const raw =
      (
        trend * 0.3 +
        momentum * 0.25 +
        flowScore * 0.25 +
        rsiScore * 0.2
      ) *
      phaseBoost *
      penalty;

    return Math.max(
      0,
      Math.min(100, ((raw + 1) / 2) * 100)
    );
  }

  /* ======================================================
     SIGNAL GENERATION
  ====================================================== */

  useEffect(() => {
    if (!candles.length) return;

    const last = candles.at(-1);

    if (!last) return;

    if (last.time === lastCandleRef.current) return;

    lastCandleRef.current = last.time;

    const base = calculate();

    if (base === null) return;

    const smooth = EMA(scoreRef.current, base);

    scoreRef.current = smooth;

    let decision: Decision = "NO TRADE";

    if (smooth > 58) decision = "LONG";
    else if (smooth < 42) decision = "SHORT";

    const prev = candles.at(-5);

    if (!prev) return;

    const vol = Math.abs(last.close - prev.close) / last.close;

    const ttl = getTTL(vol);

    const buy = flow?.buyVolume ?? 0;
    const sell = flow?.sellVolume ?? 0;

    const confidence = Math.min(
      100,
      Math.abs(smooth - 50) * 0.6 +
        Math.abs(buy - sell) * 0.3 +
        vol * 200
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
  }, [candles]);

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
    <div className="origin-top-left scale-[0.80] w-[49%] -mb-[40px]">
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

            <div className="text-[9px] font-bold tracking-[0.18em] text-orange-400">
              CRYPTONIX AI
            </div>

            <div className="mt-[2px] text-[9px] tracking-[0.16em] text-white/35">
              {interval} • ARTIFICIAL INTELLIGENCE SIGNAL
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
        <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/35">

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

      <div className="relative z-10 mt-3 grid grid-cols-3 gap-1">

        {/* SCORE */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-2">

          <div className="text-[5px] uppercase tracking-[0.18em] text-white/35">
            Score
          </div>

          <div
            className="mt-1 text-sm font-bold"
            style={{ color }}
          >
            {signal.score.toFixed(0)}%
          </div>

        </div>

        {/* CONFIDENCE */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[9px] uppercase tracking-[0.18em] text-white/35">
            Confidence
          </div>

          <div className="mt-1 text-sm font-bold text-orange-400">
            {signal.confidence.toFixed(0)}%
          </div>

        </div>

        {/* HOLD */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Hold
          </div>

          <div className="mt-1 text-sm font-bold text-white">
            {signal.hold}
          </div>

        </div>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="relative z-10 mt-2 flex items-center justify-between border-t border-white/6 pt-2">

        <div className="text-[11px] tracking-[0.14em] text-white/35">
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