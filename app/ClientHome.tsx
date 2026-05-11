"use client";

import { useEffect, useState } from "react";

import PressureSignal from "./components/PressureSignal";
import TechnicalSignal, {
  Signal,
} from "./components/TechnicalSignal";

import Chart from "./components/Chart";
import Timeframes from "./components/Timeframes";
import Search from "./components/Search";
import Header from "./components/Header";
import TradePanel from "./components/TradePanel";
import AISignal from "./components/AISignal";
import LogoutButton from "./components/LogoutButton";
import AmbientBackground from "./components/AmbientBackground";

export default function Home() {
  /* ======================================================
     STATES
  ====================================================== */

  const [favorites, setFavorites] = useState<
    string[]
  >([]);

  const [coins, setCoins] = useState<any[]>(
    []
  );

  const [symbol, setSymbol] =
    useState("BTCUSDT");

  const [interval, setIntervalState] =
    useState("1m");

  const [candles, setCandles] = useState<
    any[]
  >([]);

  const [price, setPrice] = useState<
    number | null
  >(null);

  const [btcSpot, setBtcSpot] = useState<
    number | null
  >(null);

  const [btcFutures, setBtcFutures] =
    useState<number | null>(null);

  const [selected, setSelected] = useState<
    string | null
  >(null);

  const [trade, setTrade] = useState<any>(
    null
  );

  const [aiSignal, setAiSignal] =
    useState<any>(null);

  const [tradeFlow, setTradeFlow] =
    useState({
      buyVolume: 0,
      sellVolume: 0,
    });

  const [techSignal, setTechSignal] =
    useState<Signal | null>(null);

  /* ======================================================
     LOCAL STORAGE
  ====================================================== */

  useEffect(() => {
    const savedSymbol =
      localStorage.getItem("symbol");

    const savedInterval =
      localStorage.getItem("interval");

    if (savedSymbol) setSymbol(savedSymbol);

    if (savedInterval) {
      setIntervalState(savedInterval);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("symbol", symbol);
  }, [symbol]);

  useEffect(() => {
    localStorage.setItem(
      "interval",
      interval
    );
  }, [interval]);

  /* ======================================================
     RESET TRADE
  ====================================================== */

  useEffect(() => {
    setSelected(null);
    setTrade(null);
  }, [symbol, interval]);

  useEffect(() => {
    if (!selected) setTrade(null);
  }, [selected]);

  /* ======================================================
     BTC SPOT
  ====================================================== */

  useEffect(() => {
    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data?.p) {
        setBtcSpot(Number(data.p));
      }
    };

    return () => ws.close();
  }, []);

  /* ======================================================
     BTC FUTURES
  ====================================================== */

  useEffect(() => {
    const ws = new WebSocket(
      "wss://fstream.binance.com/ws/btcusdt@trade"
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data?.p) {
        setBtcFutures(Number(data.p));
      }
    };

    return () => ws.close();
  }, []);

  /* ======================================================
     LIVE PRICE FLOW
  ====================================================== */

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data?.p) {
        setPrice(Number(data.p));
      }

      const qty = Number(data.q || 0);

      const isSell = data.m;

      setTradeFlow((prev) => ({
        buyVolume: isSell
          ? prev.buyVolume
          : prev.buyVolume + qty,

        sellVolume: isSell
          ? prev.sellVolume + qty
          : prev.sellVolume,
      }));

      setTimeout(() => {
        setTradeFlow((prev) => ({
          buyVolume: prev.buyVolume * 0.9,

          sellVolume:
            prev.sellVolume * 0.9,
        }));
      }, 2000);
    };

    return () => ws.close();
  }, [symbol]);

  /* ======================================================
     FETCH COINS
  ====================================================== */

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr"
        );

        const data = await res.json();

        const usdt = data.filter((c: any) =>
          c.symbol.endsWith("USDT")
        );

        setCoins(usdt);
      } catch (e) {
        console.error(
          "Coins fetch error",
          e
        );
      }
    }

    fetchCoins();
  }, []);

  /* ======================================================
     FETCH CANDLES
  ====================================================== */

  async function fetchData() {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );

      const data = await res.json();

      const mapped = data.map((c: any) => ({
        time: c[0] / 1000,
        open: +c[1],
        high: +c[2],
        low: +c[3],
        close: +c[4],
        volume: +c[5],
      }));

      setCandles(mapped);
    } catch (e) {
      console.error(
        "Candles fetch error",
        e
      );
    }
  }

  useEffect(() => {
    fetchData();
  }, [symbol, interval]);

  /* ======================================================
     LIVE KLINES
  ====================================================== */

  useEffect(() => {
    if (!symbol || !interval) return;

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

      setCandles((prev) => {
        if (!prev.length)
          return [newCandle];

        const last =
          prev[prev.length - 1];

        if (last.time === newCandle.time) {
          const updated = [...prev];

          updated[updated.length - 1] =
            newCandle;

          return updated;
        }

        if (newCandle.time > last.time) {
          return [
            ...prev.slice(-500),
            newCandle,
          ];
        }

        return prev;
      });
    };

    return () => ws.close();
  }, [symbol, interval]);

  /* ======================================================
     CREATE TRADE
  ====================================================== */

  function createTrade(
    type: "LONG" | "SHORT"
  ) {
    if (selected === type) {
      setSelected(null);
      setTrade(null);

      return;
    }

    setSelected(type);

    if (!price || candles.length < 10) {
      setTrade(null);

      return;
    }

    const highs = candles
      .slice(-10)
      .map((c: any) => c.high);

    const lows = candles
      .slice(-10)
      .map((c: any) => c.low);

    const range =
      Math.max(...highs) -
      Math.min(...lows);

    let entry = price;

    let stop;
    let take;

    if (type === "LONG") {
      stop = entry - range * 0.5;

      take = entry + range;
    } else {
      stop = entry + range * 0.5;

      take = entry - range;
    }

    setTrade({
      type,
      entry,
      stop,
      take,
    });
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    < main className=" <AmbientBackground /> relative min-h-screen overflow-x-hidden px-3 pb-24 pt-3 text-white md:px-4">

      {/* ======================================================
          BACKGROUND LIGHTS
      ====================================================== */}

      <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-240px] right-[-180px] h-[460px] w-[460px] rounded-full bg-yellow-500/10 blur-3xl" />

      {/* ======================================================
          CONTENT
      ====================================================== */}

<div className="relative z-10 mx-auto flex w-full max-w-full flex-col gap-4 min-h-screen overflow-x-hidden">

        {/* HEADER */}
        <Header
          symbol={symbol}
          price={price}
          btcSpot={btcSpot}
          btcFutures={btcFutures}
        />

        {/* ======================================================
            TERMINAL GRID
        ====================================================== */}

<div
  className="
    grid
    grid-cols-1
    gap-4
    items-start
    xl:grid-cols-[300px_minmax(0,1fr)_280px]
  "
>

          {/* ======================================================
              LEFT SIDEBAR
          ====================================================== */}

<div className="flex min-w-0 flex-col gap-4">

            {/* SEARCH */}
            <div className="glass-card p-3">
              <Search
                coins={coins}
                setSymbol={setSymbol}
                symbol={symbol}
                favorites={favorites}
                setFavorites={setFavorites}
              />
            </div>

            {/* TIMEFRAMES */}
            <div className="glass-card p-3">
              <Timeframes
                interval={interval}
                setIntervalState={
                  setIntervalState
                }
              />
            </div>

            {/* TECH SIGNAL */}
            <TechnicalSignal
              candles={candles}
              interval={interval}
              onSignal={setTechSignal}
            />

            {/* AI SIGNAL */}
            <AISignal
              candles={candles}
              onSignal={setAiSignal}
              flow={tradeFlow}
              interval={interval}
              techSignal={techSignal}
            />

          </div>

          {/* ======================================================
              CENTER
          ====================================================== */}

<div className="flex min-w-0 flex-col gap-4 overflow-visible">

            {/* CHART */}
            <Chart
              candles={candles}
              trade={selected ? trade : null}
              symbol={symbol}
            />

          </div>

          {/* ======================================================
              RIGHT SIDEBAR
          ====================================================== */}

<div className="flex min-w-0 flex-col gap-4">

            {/* TRADE PANEL */}
            <TradePanel
              trade={selected ? trade : null}
              selected={selected}
              onTrade={createTrade}
              price={price}
              aiSignal={aiSignal}
            />

            {/* ORDER FLOW */}
            <PressureSignal
              bids={[
                {
                  qty: tradeFlow.buyVolume,
                },
              ]}
              asks={[
                {
                  qty: tradeFlow.sellVolume,
                },
              ]}
              trades={[
                {
                  price: price || 0,
                  qty: 1,
                  isBuy: true,
                },
              ]}
            />

          </div>

        </div>

        {/* ======================================================
            MOBILE TRADE PANEL
        ====================================================== */}

        <div className="flex flex-col gap-4 xl:hidden">

          <TradePanel
            trade={selected ? trade : null}
            selected={selected}
            onTrade={createTrade}
            price={price}
            aiSignal={aiSignal}
          />

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="mt-2 flex items-center justify-between rounded-[20px] border border-white/8 bg-[rgba(12,12,14,0.65)] px-4 py-3 backdrop-blur-xl">

          <div className="text-[11px] tracking-[0.18em] text-white/35">
            CRYPTONIX TERMINAL • AI MARKET
            ANALYTICS
          </div>

          <LogoutButton />

        </div>

      </div>

    </main>
  );
}