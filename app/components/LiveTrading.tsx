"use client";

import PressureSignal from "@/app/components/PressureSignal";
import TechnicalSignal, { Signal } from "@/app/components/TechnicalSignal";

import { useEffect, useState } from "react";

import Chart from "@/app/components/Chart";
import Timeframes from "@/app/components/Timeframes";
import Search from "@/app/components/Search";
import Header from "@/app/components/Header";
import TradePanel from "@/app/components/TradePanel";
import AISignal from "@/app/components/AISignal";
import OrderBook from "@/app/components/OrderBook";
import { useCompactLayout } from "@/app/hooks/useCompactLayout";
import { useMarketData } from "@/app/hooks/useMarketData";
import { useTimeframeSignals } from "@/app/hooks/useTimeframeSignals";

export default function LiveTrading() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntervalState] = useState("1m");

  const [selected, setSelected] = useState<string | null>(null);
  const [trade, setTrade] = useState<any>(null);

  const [aiSignal, setAiSignal] = useState<any>(null);
  const [techSignal, setTechSignal] = useState<Signal | null>(null);

  const {
    btcFutures,
    btcSpot,
    candles,
    changePercent,
    coins,
    orderBook,
    price,
    setOrderBook,
    tradeFlow,
  } = useMarketData(symbol, interval, setSymbol);
  const displayedTimeframeSignals = useTimeframeSignals(
    symbol,
    interval,
    aiSignal?.decision
  );
  const compactLayout = useCompactLayout();

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
    setAiSignal(null);
    setTechSignal(null);
  }, [symbol, interval]);

  useEffect(() => {
    if (!selected) setTrade(null);
  }, [selected]);

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
              signals={displayedTimeframeSignals}
              activeSignal={aiSignal?.decision}
            />
          </div>

          <Chart candles={candles} trade={selected ? trade : null} symbol={symbol}/>

          <div className="cryptonixSignalGrid cxReveal grid grid-cols-2 gap-3 items-start">

<AISignal
  key={`${symbol}:${interval}`}
  candles={candles}
  onSignal={setAiSignal}
  flow={tradeFlow}
  orderBook={orderBook}
  interval={interval}
  techSignal={techSignal}
/>

<TechnicalSignal
  candles={candles}
  interval={interval}
  onSignal={setTechSignal}
/>
</div>

          <div className="cryptonixMobileTradePanel cxReveal lg:hidden">
            <TradePanel
              trade={selected ? trade : null}
              selected={selected}
              onTrade={createTrade}
              price={price}
              aiSignal={aiSignal}
            />
          </div>

          {compactLayout && (
            <div className="cryptonixMobileTerminalDeck cxReveal lg:hidden">
              <PressureSignal candles={candles}/>

              <OrderBook
                symbol={symbol}
                onUpdate={setOrderBook}
              />
            </div>
          )}
        </div>

        {!compactLayout && (
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
        )}

      </div>
      </div>
    </main>
  );
}
