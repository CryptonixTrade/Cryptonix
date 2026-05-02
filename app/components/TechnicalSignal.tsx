"use client";

import { useEffect, useRef, useState } from "react";

/* ================= TYPES ================= */

export type Decision = "LONG" | "SHORT" | "NO TRADE";

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

export default function TechnicalSignal(props: any) {

  const { candles = [], interval = "1m", onSignal } = props;

  const lastRef = useRef<number | null>(null);
  const [signal, setSignal] = useState<Signal | null>(null);

  function clamp(v: number, min = -1, max = 1): number {
    return Math.max(min, Math.min(max, v));
  }

  function calcEMA(data: number[], period: number): number {
    if (!data.length) return 0;

    const k = 2 / (period + 1);
    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }

    return ema;
  }

  useEffect(() => {
    if (!candles || candles.length < 60) return;

    const last = candles.at(-1);
    if (!last) return;

    if (last.time === lastRef.current) return;
    lastRef.current = last.time;

    const closes = candles.map((c: Candle) => c.close);
    const volumes = candles.map((c: Candle) => c.volume);

    const emaFast = calcEMA(closes.slice(-30), 9);
    const emaSlow = calcEMA(closes.slice(-60), 21);

    const trend = emaFast > emaSlow ? 1 : -1;

    const lastPrice = closes.at(-1);
    if (!lastPrice) return;

    const trendStrength = Math.abs(emaFast - emaSlow) / lastPrice;

    if (trendStrength < 0.0005) {
      const neutral: Signal = { score: 50, decision: "NO TRADE" };
      setSignal(neutral);
      onSignal?.(neutral);
      return;
    }

    const prev = closes.at(-5);
    if (!prev) return;

    const momentum = clamp(((lastPrice - prev) / prev) * 50);

    const volNow = volumes.at(-1);
    if (!volNow) return;

    const volAvg =
    volumes
      .slice(-10)
      .reduce((a: number, b: number) => a + b, 0) / 10;

    let volumeScore = 0;
    if (volNow > volAvg * 1.5) volumeScore = trend;

    const raw =
      trend * 0.5 +
      momentum * 0.3 +
      volumeScore * 0.2;

    if (Math.abs(raw) < 0.2) {
      const neutral: Signal = { score: 50, decision: "NO TRADE" };
      setSignal(neutral);
      onSignal?.(neutral);
      return;
    }

    const score = ((raw + 1) / 2) * 100;

    let decision: Decision = "NO TRADE";

    if (score > 60) decision = "LONG";
    else if (score < 40) decision = "SHORT";

    const newSignal: Signal = { score, decision };

    setSignal(newSignal);
    onSignal?.(newSignal);

  }, [candles, interval, onSignal]);

  return null;
}