"use client";

import { useEffect, useMemo, useState } from "react";
import { TIMEFRAMES } from "@/lib/market-config";
import { fetchMarketData, mapKlines } from "@/lib/market-data-client";
import {
  calculateAiSignal,
  calculateTechnicalSignal,
  getTimeframeMicrostructure,
} from "@/lib/signal-engine";

const TIMEFRAME_SIGNAL_REFRESH_MS = 45_000;

export function useTimeframeSignals(
  symbol: string,
  interval: string,
  activeDecision?: string
) {
  const [timeframeSignals, setTimeframeSignals] = useState<Record<string, string>>({});

  const displayedTimeframeSignals = useMemo(() => {
    const nextSignals = { ...timeframeSignals };

    if (
      activeDecision === "LONG" ||
      activeDecision === "SHORT"
    ) {
      nextSignals[interval] = activeDecision;
    } else {
      delete nextSignals[interval];
    }

    return nextSignals;
  }, [timeframeSignals, activeDecision, interval]);

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;
    let controller: AbortController | null = null;

    async function loadTimeframeSignals() {
      controller?.abort();
      controller = new AbortController();

      try {
        const entries = await Promise.all(
          TIMEFRAMES.map(async (timeframe) => {
            const data = await fetchMarketData(
              `type=klines&symbol=${symbol}&interval=${timeframe}&limit=120`,
              controller?.signal
            );

            const mapped = mapKlines(data);
            const timeframeTechSignal = calculateTechnicalSignal(mapped);
            const microstructure = getTimeframeMicrostructure(mapped);
            const signal = calculateAiSignal({
              candles: mapped,
              flow: microstructure.flow,
              orderBook: microstructure.orderBook,
              techSignal: timeframeTechSignal,
            });

            return [timeframe, signal?.decision || ""] as const;
          })
        );

        if (cancelled) return;

        setTimeframeSignals(
          Object.fromEntries(
            entries.filter(([, decision]) => decision && decision !== "NO TRADE")
          )
        );
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Timeframe signals fetch error", e);
        }
      }
    }

    loadTimeframeSignals();
    const timer = window.setInterval(
      loadTimeframeSignals,
      TIMEFRAME_SIGNAL_REFRESH_MS
    );

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, [symbol]);

  return displayedTimeframeSignals;
}
