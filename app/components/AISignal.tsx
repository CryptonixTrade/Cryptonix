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

const LIVE_AI_REFRESH_MS = 3500;

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
  const [nowMs, setNowMs] = useState(Date.now());

  const lastCandleRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);
  const scoreRef = useRef<number | null>(null);
  const signalRef = useRef<Signal | null>(null);

  /* ======================================================
     SIGNAL GENERATION
  ====================================================== */

  useEffect(() => {
    if (!candles.length) return;

    const last = candles.at(-1);

    if (!last) return;

    const now = Date.now();
    const candleTime = Number(last.time || 0);
    const candleChanged = candleTime !== lastCandleRef.current;
    const liveRefreshReady = now - lastRunRef.current >= LIVE_AI_REFRESH_MS;

    if (!candleChanged && !liveRefreshReady) return;

    lastCandleRef.current = candleTime;
    lastRunRef.current = now;

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

    const previousSignal = signalRef.current;
    const keepSignalWindow =
      previousSignal &&
      previousSignal.decision === decision &&
      previousSignal.expiryTime > now &&
      !candleChanged;

    const newSignal: Signal = {
      score: smooth,
      decision,
      confidence,
      entryTime: keepSignalWindow ? previousSignal.entryTime : now,
      expiryTime: keepSignalWindow ? previousSignal.expiryTime : now + ttl * 60000,
      hold: `${ttl} min`,
      entryPrice: last.close,
    };

    signalRef.current = newSignal;
    setSignal(newSignal);

    onSignal?.(newSignal);
  }, [candles, flow, orderBook, interval, techSignal, onSignal]);

  useEffect(() => {
    if (!signal) return;

    setNowMs(Date.now());

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [signal?.expiryTime]);

  /* ======================================================
     EMPTY
  ====================================================== */

  if (!signal) return null;

  /* ======================================================
     STATES
  ====================================================== */

  const expired = nowMs > signal.expiryTime;

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
    const diff = expiry - nowMs;

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
      className="cryptonixSignalCard cryptonixAiPrimeCard cx-card cx-card-sm relative p-4 transition-all duration-500"
      style={{
        boxShadow: `${glow}, 0 28px 88px rgba(0,0,0,0.48), 0 0 74px rgba(242,213,138,0.11), inset 0 1px 0 rgba(255,255,255,0.14)`,
      }}
    >

      <div className="cxAiCoreHalo" aria-hidden="true" />
      <div className="cxAiCoreGrid" aria-hidden="true" />

      {/* BACKGROUND GLOW */}
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative z-10 flex items-start justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-2">

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

            <div className="text-sm font-semibold text-white">
              CRYPTONIX AI CORE
            </div>

            <div className="mt-1 text-[10px] tracking-[0.10em] text-[var(--cx-text-muted)]">
              {interval} • PRIMARY SIGNAL ENGINE
            </div>

          </div>

        </div>

        {/* DECISION */}
        <div
          className="rounded-full border px-3 py-[6px] text-[10px] font-semibold tracking-[0.08em] shadow-[0_0_22px_rgba(242,213,138,0.08)]"
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
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.10em] text-[var(--cx-text-muted)]">

          <span>Bearish</span>

          <span>AI Confidence</span>

          <span>Bullish</span>

        </div>

        {/* BAR */}
        <div className="relative h-[8px] overflow-hidden rounded-full bg-white/[0.06]">

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-zinc-700 to-green-400 opacity-80" />

          {/* POINTER */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-black"
            style={{
              left: `calc(${signal.score}% - 8px)`,
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
        <div className="cxMiniMetric">

          <div className="text-[8px] uppercase tracking-[0.18em] text-[var(--cx-text-muted)]">
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
        <div className="cxMiniMetric">

          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--cx-text-muted)]">
            Confid.
          </div>

          <div className="mt-1 text-[15px] font-bold text-orange-400">
            {signal.confidence.toFixed(0)}%
          </div>

        </div>

        {/* HOLD */}
        <div className="cxMiniMetric">

          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--cx-text-muted)]">
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
          LIVE AI ENTRY:{" "}
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
          {decision === "NO TRADE"
            ? "NO ACTIVE SIGNAL"
            : getTimeLeft(signal.expiryTime)}
          </div>

</div>

</div>

</div>

);
}
