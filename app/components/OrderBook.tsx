"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  symbol: string;

  onUpdate?: (data: {
    imbalance: number;
    bidVolume: number;
    askVolume: number;
  }) => void;
};

export default function OrderBook(props: Props) {
  const { symbol, onUpdate } = props;

  const [imbalance, setImbalance] = useState(0);
  const [bidVolume, setBidVolume] = useState(0);
  const [askVolume, setAskVolume] = useState(0);

  /* ======================================================
     WEBSOCKET
  ====================================================== */

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth10@100ms`
    );

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        const rawBids = data?.b || data?.bids;
        const rawAsks = data?.a || data?.asks;

        if (!rawBids || !rawAsks) return;

        const bids = rawBids.map(
          (x: any) => +x[1]
        );

        const asks = rawAsks.map(
          (x: any) => +x[1]
        );

        const bidVol = bids.reduce(
          (a: number, b: number) => a + b,
          0
        );

        const askVol = asks.reduce(
          (a: number, b: number) => a + b,
          0
        );

        const total = bidVol + askVol;

        const currentImbalance =
          total > 0
            ? (bidVol - askVol) / total
            : 0;

        setImbalance(currentImbalance);
        setBidVolume(bidVol);
        setAskVolume(askVol);

        onUpdate?.({
          imbalance: currentImbalance,
          bidVolume: bidVol,
          askVolume: askVol,
        });
      } catch {}
    };

    return () => ws.close();
  }, [symbol]);

  /* ======================================================
     CALCULATIONS
  ====================================================== */

  const pressure = useMemo(() => {
    if (imbalance > 0.15) return "BUY PRESSURE";
    if (imbalance < -0.15) return "SELL PRESSURE";

    return "BALANCED";
  }, [imbalance]);

  const pressureColor =
    imbalance > 0.15
      ? "#2dff87"
      : imbalance < -0.15
      ? "#ff5e5e"
      : "#a1a1aa";

  const buyPercent = Math.max(
    0,
    Math.min(100, ((imbalance + 1) / 2) * 100)
  );

  const sellPercent = 100 - buyPercent;

  /* ======================================================
     HELPERS
  ====================================================== */

  function formatVolume(v: number) {
    if (!v) return "0";

    if (v >= 1_000_000) {
      return (v / 1_000_000).toFixed(2) + "M";
    }

    if (v >= 1_000) {
      return (v / 1_000).toFixed(2) + "K";
    }

    return v.toFixed(2);
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="cryptonixSignalCard cx-panel relative overflow-hidden p-5 transition-all duration-500">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative z-10 flex items-start justify-between">

        {/* LEFT */}
        <div>

          <div className="text-base font-semibold text-white">
            Order Flow
          </div>

          <div className="mt-1 text-[11px] tracking-[0.10em] text-[var(--cx-text-muted)]">
            Live order book imbalance
          </div>

        </div>

        {/* STATUS */}
        <div
          className="rounded-full border px-3 py-[6px] text-[10px] font-semibold tracking-[0.08em]"
          style={{
            color: pressureColor,
            borderColor: `${pressureColor}30`,
            background: `${pressureColor}10`,
          }}
        >
          {pressure}
        </div>

      </div>

      {/* ======================================================
          IMBALANCE BAR
      ====================================================== */}

      <div className="relative z-10 mt-6">

        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/35">

          <span>SELLERS</span>

          <span>MARKET IMBALANCE</span>

          <span>BUYERS</span>

        </div>

        {/* BAR */}
        <div className="relative h-[14px] overflow-hidden rounded-full bg-white/5">

          {/* RED */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-400"
            style={{
              width: `${sellPercent}%`,
            }}
          />

          {/* GREEN */}
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500"
            style={{
              width: `${buyPercent}%`,
            }}
          />

          {/* CENTER LINE */}
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-black/40" />

        </div>

      </div>

      {/* ======================================================
          METRICS
      ====================================================== */}

      <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">

        {/* BUY */}
        <div className="cxMiniMetric">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Bid Volume
          </div>

          <div className="mt-2 text-2xl font-bold text-green-400">
            {formatVolume(bidVolume)}
          </div>

        </div>

        {/* SELL */}
        <div className="cxMiniMetric">

          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Ask Volume
          </div>

          <div className="mt-2 text-2xl font-bold text-red-400">
            {formatVolume(askVolume)}
          </div>

        </div>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="relative z-10 mt-5 border-t border-white/6 pt-4">

        <div className="flex items-center justify-between">

          <div className="text-[11px] tracking-[0.14em] text-white/35">
            ORDER BOOK IMBALANCE
          </div>

          <div
            className="text-sm font-bold"
            style={{
              color: pressureColor,
            }}
          >
            {(imbalance * 100).toFixed(1)}%
          </div>

        </div>

      </div>

    </div>
  );
}
