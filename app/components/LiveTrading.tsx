"use client";

import PressureSignal from "@/app/components/PressureSignal";
import TechnicalSignal, { Signal } from "@/app/components/TechnicalSignal";

import { useEffect, useMemo, useRef, useState } from "react";

import Chart from "@/app/components/Chart";
import Timeframes from "@/app/components/Timeframes";
import Search from "@/app/components/Search";
import Header from "@/app/components/Header";
import TradePanel from "@/app/components/TradePanel";
import AISignal from "@/app/components/AISignal";
import OrderBook from "@/app/components/OrderBook";
import { calculateAiSignal, calculateTechnicalSignal } from "@/lib/signal-engine";

type OrderBookState = {
  imbalance: number;
  bidVolume: number;
  askVolume: number;
};

const TIMEFRAMES = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "12h",
  "1d",
  "1w",
  "1M",
];

function isTabletViewport() {
  return window.innerWidth >= 600 && window.innerWidth <= 1180;
}

async function fetchTabletMarketData(path: string) {
  const res = await fetch(`/api/market-data?${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Tablet market data failed: ${res.status}`);
  }

  return res.json();
}

export default function LiveTrading() {

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

  const [orderBook, setOrderBook] = useState<OrderBookState>({
    imbalance: 0,
    bidVolume: 0,
    askVolume: 0
  });

  const [techSignal, setTechSignal] = useState<Signal | null>(null);
  const [timeframeSignals, setTimeframeSignals] = useState<Record<string, string>>({});
  const latestFlowRef = useRef(tradeFlow);
  const latestOrderBookRef = useRef(orderBook);

  const selectedTicker = useMemo(
    () => coins.find((coin: any) => coin.symbol === symbol),
    [coins, symbol]
  );
  const changePercent = Number(selectedTicker?.priceChangePercent || 0);

  useEffect(() => {
    latestFlowRef.current = tradeFlow;
  }, [tradeFlow]);

  useEffect(() => {
    latestOrderBookRef.current = orderBook;
  }, [orderBook]);

	  useEffect(() => {
	    let savedSymbol = null;
	    let savedInterval = null;

	    try {
	      savedSymbol = localStorage.getItem("symbol");
	      savedInterval = localStorage.getItem("interval");
	    } catch {}
	
	    if (savedSymbol) setSymbol(savedSymbol);
	    if (savedInterval) setIntervalState(savedInterval);
	  }, []);
	
	  useEffect(() => {
	    try {
	      localStorage.setItem("symbol", symbol);
	    } catch {}
	  }, [symbol]);
	
	  useEffect(() => {
	    try {
	      localStorage.setItem("interval", interval);
	    } catch {}
	  }, [interval]);

  useEffect(() => {
    setSelected(null);
    setTrade(null);
  }, [symbol, interval]);

  useEffect(() => {
    if (!selected) setTrade(null);
  }, [selected]);

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

      setTradeFlow(prev => ({
        buyVolume: isSell ? prev.buyVolume : prev.buyVolume + qty,
        sellVolume: isSell ? prev.sellVolume + qty : prev.sellVolume
      }));
    };

    return () => ws.close();
  }, [symbol]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTradeFlow(prev => ({
        buyVolume: prev.buyVolume * 0.9,
        sellVolume: prev.sellVolume * 0.9
      }));
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

	  useEffect(() => {
	    async function fetchCoins(){
	      try {
	        let data;

	        if (isTabletViewport()) {
	          data = await fetchTabletMarketData("type=tickers");
	        } else {
	          const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
	          data = await res.json();
	        }
	
        const markets = data
          .filter((c:any) => c?.symbol && Number(c.lastPrice || 0) > 0)
          .sort((a:any, b:any) => Number(b.quoteVolume || 0) - Number(a.quoteVolume || 0));
        setCoins(markets);
      } catch (e) {
        console.error("Coins fetch error", e);
      }
    }

    fetchCoins();
  }, []);

	  async function fetchData() {
	    try {
	      let data;

	      if (isTabletViewport()) {
	        data = await fetchTabletMarketData(
	          `type=klines&symbol=${symbol}&interval=${interval}&limit=100`
	        );
	      } else {
	        const res = await fetch(
	          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
	        );
	        data = await res.json();
	      }

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

	  useEffect(() => {
	    if (!symbol) return;

	    let cancelled = false;

	    async function loadTimeframeSignals() {
	      try {
	        const entries = await Promise.all(
	          TIMEFRAMES.map(async (timeframe) => {
	            let data;

	            if (isTabletViewport()) {
	              data = await fetchTabletMarketData(
	                `type=klines&symbol=${symbol}&interval=${timeframe}&limit=120`
	              );
	            } else {
	              const res = await fetch(
	                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=120`
	              );

	              if (!res.ok) return [timeframe, ""] as const;
	              data = await res.json();
	            }

	            const mapped = data.map((c:any)=>({
	              time: c[0] / 1000,
	              open: +c[1],
	              high: +c[2],
	              low: +c[3],
	              close: +c[4],
	              volume: +c[5]
	            }));
	            const timeframeTechSignal = calculateTechnicalSignal(mapped);
	            const signal = calculateAiSignal({
	              candles: mapped,
	              flow: latestFlowRef.current,
	              orderBook: latestOrderBookRef.current,
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
	        console.error("Timeframe signals fetch error", e);
	      }
	    }

	    loadTimeframeSignals();
	    const timer = window.setInterval(loadTimeframeSignals, 60000);

	    return () => {
	      cancelled = true;
	      window.clearInterval(timer);
	    };
	  }, [symbol]);

	  useEffect(() => {
	    if (!symbol || !isTabletViewport()) return;

	    let cancelled = false;

	    async function fetchTabletPrices() {
	      try {
	        const data = await fetchTabletMarketData(`type=prices&symbol=${symbol}`);

	        if (cancelled) return;
	        if (data?.price) setPrice(Number(data.price));
	        if (data?.btcSpot) setBtcSpot(Number(data.btcSpot));
	        if (data?.btcFutures) setBtcFutures(Number(data.btcFutures));
	      } catch (e) {
	        console.error("Tablet prices fetch error", e);
	      }
	    }

	    fetchTabletPrices();
	    const timer = window.setInterval(fetchTabletPrices, 5000);

	    return () => {
	      cancelled = true;
	      window.clearInterval(timer);
	    };
	  }, [symbol]);

	  useEffect(() => {
	    if (!symbol || !interval || !isTabletViewport()) return;

	    const timer = window.setInterval(fetchData, 15000);

	    return () => window.clearInterval(timer);
	  }, [symbol, interval]);
	
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

  function calculateATR(period = 14) {
    if (candles.length < period + 1) return null;

    const recent = candles.slice(-(period + 1));
    const ranges = recent.slice(1).map((c: any, index: number) => {
      const prevClose = recent[index].close;
      return Math.max(
        c.high - c.low,
        Math.abs(c.high - prevClose),
        Math.abs(c.low - prevClose)
      );
    });

    return ranges.reduce((sum: number, value: number) => sum + value, 0) / ranges.length;
  }

  function createTrade(type:"LONG"|"SHORT"){
    if (selected === type) {
      setSelected(null);
      setTrade(null);
      return;
    }

    setSelected(type);

    const lastClose = Number(candles[candles.length - 1]?.close || 0);
    const entry = Number(price || lastClose);

    if(!entry || candles.length < 10){
      setTrade(null);
      return;
    }

    const highs = candles.slice(-10).map((c:any)=>c.high);
    const lows = candles.slice(-10).map((c:any)=>c.low);

    const range = Math.max(...highs) - Math.min(...lows);
    const atr = calculateATR();

    const fallbackDistance = range * 0.5;
    const stopDistance = Math.max(
      atr ? atr * 1.4 : fallbackDistance,
      fallbackDistance,
      entry * 0.001
    );
    const takeDistance = stopDistance * 1.8;

    let stop, take;

    if(type === "LONG"){
      stop = entry - stopDistance;
      take = entry + takeDistance;
    } else {
      stop = entry + stopDistance;
      take = entry - takeDistance;
    }

    setTrade({
      type,
      entry,
      stop,
      take
    });
  }

  return (
    <main className="cryptonixTerminal cx-terminal min-h-screen w-full flex flex-col text-yellow-400 px-3 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 overflow-x-visible">

      <div className="cryptonixWorkspace">
      <Header
        symbol={symbol}
        price={price}
        btcSpot={btcSpot}
        btcFutures={btcFutures}
        changePercent={changePercent}
      />

<div className="cryptonixDashboardGrid flex flex-col lg:flex-row gap-4 w-full overflow-x-visible">

        <div className="cryptonixMainColumn flex flex-col flex-1 gap-4">
          <div className="cryptonixControls cxReveal flex flex-col md:flex-row gap-3">
            <Search
              coins={coins}
              setSymbol={setSymbol}
              symbol={symbol}
            />
            <Timeframes
              interval={interval}
              setIntervalState={setIntervalState}
              signals={timeframeSignals}
            />
          </div>

          <div className="cryptonixSignalGrid cxReveal grid grid-cols-2 gap-3 items-start">

<TechnicalSignal
  candles={candles}
  interval={interval}
  onSignal={setTechSignal}
/>

<AISignal
  candles={candles}
  onSignal={setAiSignal}
  flow={tradeFlow}
  orderBook={orderBook}
  interval={interval}
  techSignal={techSignal}
/>

</div>
          <Chart candles={candles} trade={selected ? trade : null} symbol={symbol}/>

          <div className="cryptonixMobileTradePanel cxReveal lg:hidden">
            <TradePanel
              trade={selected ? trade : null}
              selected={selected}
              onTrade={createTrade}
              price={price}
              aiSignal={aiSignal}
            />
          </div>
        </div>

        <div className="cryptonixSideColumn hidden lg:flex flex-col gap-4 min-w-[320px] max-w-[320px]">
          <TradePanel
            trade={selected ? trade : null}
            selected={selected}
            onTrade={createTrade}
            price={price}
            aiSignal={aiSignal}
          />

          <PressureSignal candles={candles}/>

          <OrderBook
            symbol={symbol}
            onUpdate={setOrderBook}
          />
        </div>

      </div>
      </div>
    </main>
  );
}
