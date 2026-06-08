"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupportedMarket } from "@/lib/market-config";
import {
  Candle,
  OrderBookState,
  fetchMarketData,
  isTabletViewport,
  mapKlines,
} from "@/lib/market-data-client";

export function useMarketData(
  symbol: string,
  interval: string,
  setSymbol: (symbol: string) => void
) {
  const [coins, setCoins] = useState<any[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [btcSpot, setBtcSpot] = useState<number | null>(null);
  const [btcFutures, setBtcFutures] = useState<number | null>(null);
  const [tradeFlow, setTradeFlow] = useState({
    buyVolume: 0,
    sellVolume: 0,
  });
  const [orderBook, setOrderBook] = useState<OrderBookState>({
    imbalance: 0,
    bidVolume: 0,
    askVolume: 0,
  });

  const selectedTicker = useMemo(
    () => coins.find((coin: any) => coin.symbol === symbol),
    [coins, symbol]
  );
  const changePercent = Number(selectedTicker?.priceChangePercent || 0);

  useEffect(() => {
    if (
      coins.length &&
      symbol &&
      !coins.some((market: any) => market.symbol === symbol)
    ) {
      setSymbol("BTCUSDT");
    }
  }, [coins, symbol, setSymbol]);

  useEffect(() => {
    setCandles([]);
    setPrice(null);
    setTradeFlow({
      buyVolume: 0,
      sellVolume: 0,
    });
    setOrderBook({
      imbalance: 0,
      bidVolume: 0,
      askVolume: 0,
    });
  }, [symbol, interval]);

  useEffect(() => {
    if (isTabletViewport()) return;

    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.p) setBtcSpot(Number(data.p));
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (isTabletViewport()) return;

    const ws = new WebSocket("wss://fstream.binance.com/ws/btcusdt@trade");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.p) setBtcFutures(Number(data.p));
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!symbol) return;
    if (isTabletViewport()) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data?.p) setPrice(Number(data.p));

      const qty = Number(data.q || 0);
      const isSell = data.m;

      setTradeFlow((prev) => ({
        buyVolume: isSell ? prev.buyVolume : prev.buyVolume + qty,
        sellVolume: isSell ? prev.sellVolume + qty : prev.sellVolume,
      }));
    };

    return () => ws.close();
  }, [symbol]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTradeFlow((prev) => ({
        buyVolume: prev.buyVolume * 0.9,
        sellVolume: prev.sellVolume * 0.9,
      }));
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const data = await fetchMarketData("type=tickers");

        const markets = data
          .filter(
            (c: any) =>
              c?.symbol &&
              isSupportedMarket(c.symbol) &&
              Number(c.lastPrice || 0) > 0
          )
          .sort(
            (a: any, b: any) =>
              Number(b.quoteVolume || 0) - Number(a.quoteVolume || 0)
          );

        setCoins(markets);

        if (
          markets.length &&
          !markets.some((market: any) => market.symbol === symbol)
        ) {
          setSymbol("BTCUSDT");
        }
      } catch (e) {
        console.error("Coins fetch error", e);
      }
    }

    fetchCoins();
  }, []);

  const fetchCandles = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const data = await fetchMarketData(
          `type=klines&symbol=${symbol}&interval=${interval}&limit=100`,
          signal
        );

        const mapped = mapKlines(data);
        setCandles(mapped);

        const lastClose = mapped.at(-1)?.close;

        if (lastClose) setPrice(lastClose);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Candles fetch error", e);
        }
      }
    },
    [symbol, interval]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchCandles(controller.signal);

    return () => controller.abort();
  }, [fetchCandles]);

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;

    async function fetchLatestPrices() {
      try {
        const data = await fetchMarketData(`type=prices&symbol=${symbol}`);

        if (cancelled) return;
        if (data?.price) setPrice(Number(data.price));
        if (data?.btcSpot) setBtcSpot(Number(data.btcSpot));
        if (data?.btcFutures) setBtcFutures(Number(data.btcFutures));
      } catch (e) {
        console.error("Prices fetch error", e);
      }
    }

    fetchLatestPrices();
    const timer = window.setInterval(
      fetchLatestPrices,
      isTabletViewport() ? 5000 : 12000
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [symbol]);

  useEffect(() => {
    if (!symbol || !interval || !isTabletViewport()) return;

    const timer = window.setInterval(fetchCandles, 15000);

    return () => window.clearInterval(timer);
  }, [symbol, interval, fetchCandles]);

  useEffect(() => {
    if (!symbol || !interval) return;
    if (isTabletViewport()) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const k = data.k;

      if (!k) return;

      const newCandle = {
        time: Math.floor(k.t / 1000),
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,
        volume: +k.v,
      };

      if (
        !Number.isFinite(newCandle.time) ||
        !Number.isFinite(newCandle.open) ||
        !Number.isFinite(newCandle.high) ||
        !Number.isFinite(newCandle.low) ||
        !Number.isFinite(newCandle.close) ||
        newCandle.open <= 0 ||
        newCandle.high <= 0 ||
        newCandle.low <= 0 ||
        newCandle.close <= 0
      ) {
        return;
      }

      setCandles((prev) => {
        if (!prev.length) return [newCandle];

        const last = prev[prev.length - 1];

        if (last.time === newCandle.time) {
          const updated = [...prev];
          updated[updated.length - 1] = newCandle;
          setPrice(newCandle.close);
          return updated;
        }

        if (newCandle.time > last.time) {
          setPrice(newCandle.close);
          return [...prev.slice(-500), newCandle];
        }

        return prev;
      });
    };

    return () => ws.close();
  }, [symbol, interval]);

  return {
    btcFutures,
    btcSpot,
    candles,
    changePercent,
    coins,
    orderBook,
    price,
    setOrderBook,
    tradeFlow,
  };
}
