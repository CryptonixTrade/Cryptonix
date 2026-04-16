"use client";

import PressureSignal from "./components/PressureSignal";
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

  // ===== LOAD
  useEffect(() => {
    const savedSymbol = localStorage.getItem("symbol");
    const savedInterval = localStorage.getItem("interval");

    if (savedSymbol) setSymbol(savedSymbol);
    if (savedInterval) setIntervalState(savedInterval);
  }, []);

  // ===== SAVE
  useEffect(() => {
    localStorage.setItem("symbol", symbol);
  }, [symbol]);

  useEffect(() => {
    localStorage.setItem("interval", interval);
  }, [interval]);

  // ===== RESET
  useEffect(() => {
    setSelected(null);
    setTrade(null);
  }, [symbol, interval]);

  useEffect(() => {
    if (!selected) setTrade(null);
  }, [selected]);

  // ===== BTC SPOT
  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.p) setBtcSpot(Number(data.p));
    };

    return () => ws.close();
  }, []);

  // ===== BTC FUTURES
  useEffect(() => {
    const ws = new WebSocket("wss://fstream.binance.com/ws/btcusdt@trade");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.p) setBtcFutures(Number(data.p));
    };

    return () => ws.close();
  }, []);

  // ===== LIVE PRICE + FLOW
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

  // ===== COINS
  useEffect(() => {
    async function fetchCoins(){
      const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
      const data = await res.json();

      const usdt = data.filter((c:any)=>c.symbol.endsWith("USDT"));
      setCoins(usdt);
    }

    fetchCoins();
  }, []);

  // ===== INITIAL CANDLES
  async function fetchData() {
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
  }

  useEffect(()=>{
    fetchData();
  },[symbol, interval]);

  // ===== LIVE KLINE
  useEffect(() => {
    if (!symbol || !interval) return;

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_${interval}`
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const k = data.k;

      const candle = {
        time: Math.floor(k.t / 1000),
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,
        volume: +k.v
      };

      setCandles(prev => {
        if (!prev.length) return prev;

        const last = prev.at(-1);

        if (last.time === candle.time) {
          return [...prev.slice(0, -1), candle];
        }

        return [...prev.slice(-99), candle];
      });
    };

    return () => ws.close();
  }, [symbol, interval]);

  // ===== TRADE
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

  return (
    <main style={{
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      background:"#0a0a0a",
      color:"#e6c200",
      border:"1px solid rgba(230,194,0,0.3)",
      borderRadius:8,
      padding:6,
      overflow:"hidden"
    }}>

      <Header
        symbol={symbol}
        price={price}
        btcSpot={btcSpot}
        btcFutures={btcFutures}
      />

      <div style={{
        flex:1,
        display:"flex",
        gap:10,
        minHeight:0
      }}>

        <div style={{
          flex:1,
          display:"flex",
          flexDirection:"column",
          gap:10,
          minHeight:0
        }}>

          <div style={{
            display:"flex",
            justifyContent:"space-between",
            gap:10
          }}>
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

          <AISignal
            candles={candles}
            onSignal={setAiSignal}
            flow={tradeFlow}
            interval={interval}
          />

          <div style={{ flex:1, minHeight:0 }}>
            <Chart
              candles={candles}
              trade={selected ? trade : null}
            />
          </div>

        </div>

        <div style={{
          width:260,
          display:"flex",
          flexDirection:"column",
          gap:10
        }}>

          <TradePanel
            trade={selected ? trade : null}
            selected={selected}
            onTrade={createTrade}
            price={price}
            aiSignal={aiSignal}
          />

          <PressureSignal
            bids={[{ volume: tradeFlow.buyVolume }]}
            asks={[{ volume: tradeFlow.sellVolume }]}
            trades={[]}
          />

        </div>

      </div>

    </main>
  );
}