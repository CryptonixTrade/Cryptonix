"use client";

import PressureSignal from "./components/PressureSignal";
import TechnicalSignal, { Signal } from "./components/TechnicalSignal";

import { useEffect, useState } from "react";

import Chart from "./components/Chart";
import Timeframes from "./components/Timeframes";
import Search from "./components/Search";
import Header from "./components/Header";
import TradePanel from "./components/TradePanel";
import AISignal from "./components/AISignal";

export default function Home() {

  const [favorites, setFavorites] = useState<string[]>([]);
  const [coins, setCoins] = useState<any[]>([]);

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntervalState] = useState("1m");

  const [candles, setCandles] = useState<any[]>([]);
  const [price, setPrice] = useState<number | null>(null);

  const [btcSpot, setBtcSpot] = useState<number | null>(null);
  const [btcFutures, setBtcFutures] = useState<number | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [trade, setTrade] = useState<any>(null);

  const [aiSignal, setAiSignal] = useState<any>(null);

  const [tradeFlow, setTradeFlow] = useState({
    buyVolume: 0,
    sellVolume: 0
  });

  const [techSignal, setTechSignal] = useState<Signal | null>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    const savedSymbol = localStorage.getItem("symbol");
    const savedInterval = localStorage.getItem("interval");

    if (savedSymbol) setSymbol(savedSymbol);
    if (savedInterval) setIntervalState(savedInterval);
  }, []);

  /* ================= SAVE ================= */

  useEffect(() => {
    localStorage.setItem("symbol", symbol);
  }, [symbol]);

  useEffect(() => {
    localStorage.setItem("interval", interval);
  }, [interval]);

  /* ================= RESET ================= */

  useEffect(() => {
    setSelected(null);
    setTrade(null);
  }, [symbol, interval]);

  useEffect(() => {
    if (!selected) setTrade(null);
  }, [selected]);

  /* ================= BTC SPOT ================= */

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.p) setBtcSpot(Number(data.p));
    };

    return () => ws.close();
  }, []);

  /* ================= BTC FUTURES ================= */

  useEffect(() => {
    const ws = new WebSocket("wss://fstream.binance.com/ws/btcusdt@trade");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.p) setBtcFutures(Number(data.p));
    };

    return () => ws.close();
  }, []);

  /* ================= LIVE PRICE ================= */

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data?.p) setPrice(Number(data.p));

      const qty = Number(data.q || 0);
      const isSell = data.m;

      setTradeFlow(prev => ({
        buyVolume: isSell ? prev.buyVolume : prev.buyVolume + qty,
        sellVolume: isSell ? prev.sellVolume + qty : prev.sellVolume
      }));

      setTimeout(() => {
        setTradeFlow(prev => ({
          buyVolume: prev.buyVolume * 0.9,
          sellVolume: prev.sellVolume * 0.9
        }));
      }, 2000);
    };

    return () => ws.close();
  }, [symbol]);

  /* ================= COINS ================= */

  useEffect(() => {
    async function fetchCoins(){
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        const usdt = data.filter((c:any)=>c.symbol.endsWith("USDT"));
        setCoins(usdt);
      } catch (e) {
        console.error("Coins fetch error", e);
      }
    }

    fetchCoins();
  }, []);

  /* ================= CANDLES ================= */

  async function fetchData() {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );
      const data = await res.json();

      const mapped = data.map((c:any)=>({
        time: c[0] / 1000,
        open: +c[1],
        high: +c[2],
        low: +c[3],
        close: +c[4],
        volume: +c[5]
      }));

      setCandles(mapped);
    } catch (e) {
      console.error("Candles fetch error", e);
    }
  }

  useEffect(()=>{
    fetchData();
  },[symbol, interval]);

  /* ================= REALTIME CANDLES ================= */

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
        volume: +k.v
      };

      setCandles(prev => {
        if (!prev.length) return [newCandle];

        const last = prev[prev.length - 1];

        if (last.time === newCandle.time) {
          const updated = [...prev];
          updated[updated.length - 1] = newCandle;
          return updated;
        }

        if (newCandle.time > last.time) {
          return [...prev.slice(-500), newCandle];
        }

        return prev;
      });
    };

    return () => ws.close();

  }, [symbol, interval]);

  /* ================= TRADE ================= */

  function createTrade(type:"LONG"|"SHORT"){

    if (selected === type) {
      setSelected(null);
      setTrade(null);
      return;
    }

    setSelected(type);

    if(!price || candles.length < 10){
      setTrade(null);
      return;
    }

    const highs = candles.slice(-10).map((c:any)=>c.high);
    const lows = candles.slice(-10).map((c:any)=>c.low);

    const range = Math.max(...highs) - Math.min(...lows);

    let entry = price;
    let stop, take;

    if(type === "LONG"){
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
      take
    });
  }

  /* ================= UI ================= */

  return (
    <main className="h-screen flex flex-col bg-[#0a0a0a] text-yellow-400 border border-yellow-500/30 rounded-lg p-2 overflow-auto">

      <Header
        symbol={symbol}
        price={price}
        btcSpot={btcSpot}
        btcFutures={btcFutures}
      />

      <div className="flex flex-1 gap-2 min-h-0 flex-col lg:flex-row">

        {/* LEFT SIDE */}
        <div className="flex flex-1 flex-col gap-2 min-h-0">

          <div className="flex flex-col md:flex-row gap-2">
            <Search
              coins={coins}
              setSymbol={setSymbol}
              symbol={symbol}
              favorites={favorites}
              setFavorites={setFavorites}
            />

            <Timeframes
              interval={interval}
              setIntervalState={setIntervalState}
            />
          </div>

          <TechnicalSignal
            candles={candles}
            interval={interval}
            onSignal={setTechSignal}
          />

          <AISignal
            candles={candles}
            onSignal={setAiSignal}
            flow={tradeFlow}
            interval={interval}
            techSignal={techSignal}
          />

          <div className="flex-1 min-h-0">
            <Chart
              candles={candles}
              trade={selected ? trade : null}
            />
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-[260px] flex flex-col gap-2">

          <TradePanel
            trade={selected ? trade : null}
            selected={selected}
            onTrade={createTrade}
            price={price}
            aiSignal={aiSignal}
          />

          <PressureSignal
            bids={[{ qty: tradeFlow.buyVolume }]}
            asks={[{ qty: tradeFlow.sellVolume }]}
            trades={[{ price: price || 0, qty: 1, isBuy: true }]}
          />

        </div>

      </div>

    </main>
  );
}