"use client";

import { useMemo } from "react";

export default function PressureSignal(props: any) {
  const { candles = [] } = props;

  const signal = useMemo(() => {
    function calculateEMA(data: number[], period: number) {
      const k = 2 / (period + 1);

      let ema = data[0];

      for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
      }

      return ema;
    }

    if (!candles || candles.length < 30) return null;

    const closes = candles.map((c: any) =>
      Number(c.close || 0)
    );

    const volumes = candles.map((c: any) =>
      Number(c.volume || 0)
    );

    const basePrice = closes.at(-5) || 1;

    const momentum =
      ((closes.at(-1)! - basePrice) / basePrice) * 100;

    let momentumScore = 0;

    if (momentum > 1) momentumScore = 1;
    else if (momentum < -1) momentumScore = -1;

    const maFast = calculateEMA(closes.slice(-30), 7);
    const maSlow = calculateEMA(closes.slice(-30), 20);

    let maScore = 0;

    if (maFast > maSlow) maScore = 1;
    else if (maFast < maSlow) maScore = -1;

    /* ======================================================
       RSI
    ====================================================== */

    let gains = 0;
    let losses = 0;

    for (
      let i = closes.length - 14;
      i < closes.length;
      i++
    ) {
      const prev = closes[i - 1];
      const curr = closes[i];

      if (prev === undefined || curr === undefined)
        continue;

      const diff = curr - prev;

      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }

    const avgGain = gains / 14;
    const avgLoss = losses / 14;

    let rsi = 50;

    if (avgLoss === 0) {
      rsi = 100;
    } else {
      const rs = avgGain / avgLoss;

      rsi = 100 - 100 / (1 + rs);
    }

    let rsiScore = 0;

    if (rsi > 65) rsiScore = 1;
    else if (rsi < 35) rsiScore = -1;

    /* ======================================================
       VOLUME
    ====================================================== */

    const volNow = volumes.at(-1) || 0;

    const volAvg =
      volumes
        .slice(-10)
        .reduce((a: number, b: number) => a + b, 0) /
      10;

    let volScore = 0;

    if (volNow > volAvg * 1.5) volScore = 1;
    else if (volNow < volAvg * 0.7) volScore = -1;

    /* ======================================================
       FINAL SCORE
    ====================================================== */

    const raw =
      maScore * 0.35 +
      rsiScore * 0.2 +
      volScore * 0.2 +
      momentumScore * 0.25;

    const score = Math.max(
      0,
      Math.min(100, ((raw + 1) / 2) * 100)
    );

    let decision = "NO TRADE";

    if (score >= 70) decision = "LONG";
    else if (score <= 30) decision = "SHORT";
    else decision = "NO TRADE";

    return {
      score,
      decision,
      rsi,
      momentum,
      volumeStrength:
        volAvg > 0 ? (volNow / volAvg) * 100 : 0,
    };
  }, [candles]);

  if (!signal) return null;

  /* ======================================================
     STATES
  ====================================================== */

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

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div
      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(12,12,14,0.72)] p-4 backdrop-blur-xl transition-all duration-300"
      style={{
        boxShadow: glow,
      }}
    >

      {/* BACKGROUND LIGHT */}
      <div
        className="pointer-events-none absolute left-[-50px] top-[-50px] h-[140px] w-[140px] rounded-full blur-3xl"
        style={{
          background:
            signal.decision === "LONG"
              ? "rgba(45,255,135,0.08)"
              : signal.decision === "SHORT"
              ? "rgba(255,94,94,0.08)"
              : "rgba(255,170,0,0.08)",
        }}
      />

      {/* TOP GLOW LINE */}
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
        <div className="flex items-center gap-3">

          {/* SIGNAL DOT */}
          <div className="relative flex items-center justify-center">

            <div
              className="h-3 w-3 rounded-full"
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

            <div className="text-sm font-bold tracking-[0.18em] text-orange-400">
              TECHNICAL SIGNAL
            </div>

            <div className="mt-[2px] text-[11px] tracking-[0.16em] text-white/35">
              MARKET PRESSURE ANALYSIS
            </div>

          </div>

        </div>

        {/* STATUS */}
        <div
          className="rounded-full border px-3 py-[6px] text-xs font-semibold tracking-[0.16em]"
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

      <div className="relative z-10s mt-5">

        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/35">

          <span>Sell Pressure</span>

          <span>Technical Score</span>

          <span>Buy Pressure</span>

        </div>

        {/* BAR */}
        <div className="relative h-[10px] overflow-hidden rounded-full bg-white/5">

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-zinc-700 to-green-400 opacity-80" />

          {/* POINTER */}
          <div
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-black"
            style={{
              left: `calc(${signal.score}% - 10px)`,
              background: color,
              boxShadow: `0 0 18px ${color}`,
            }}
          />

        </div>

      </div>

      {/* ======================================================
          METRICS
      ====================================================== */}

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">

        {/* SCORE */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Score
          </div>

          <div
            className="mt-1 text-lg font-bold"
            style={{ color }}
          >
            {signal.score.toFixed(0)}%
          </div>

        </div>

        {/* RSI */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            RSI
          </div>

          <div className="mt-1 text-lg font-bold text-orange-400">
            {signal.rsi.toFixed(0)}
          </div>

        </div>

        {/* MOMENTUM */}
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Momen
          </div>

          <div
            className={`mt-1 text-lg font-bold ${
              signal.momentum >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {signal.momentum >= 0 ? "+" : ""}
            {signal.momentum.toFixed(1)}%
          </div>

        </div>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/6 pt-4">

        <div className="text-[11px] tracking-[0.14em] text-white/35">
          VOLUME STRENGTH
        </div>

        <div className="text-[11px] tracking-[0.14em] text-white/70">
          {signal.volumeStrength.toFixed(0)}%
        </div>

      </div>

    </div>
  );
}