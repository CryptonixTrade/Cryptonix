"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries
} from "lightweight-charts";

export default function Chart({ candles, trade }: any) {
  const priceRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const entryLineRef = useRef<any>(null);
  const tpLineRef = useRef<any>(null);
  const slLineRef = useRef<any>(null);

  // ===== INIT
  useEffect(() => {
    if (!priceRef.current || !volumeRef.current) return;

    const priceChart = createChart(priceRef.current, {
      width: priceRef.current.clientWidth,
      height: priceRef.current.clientHeight,
      layout: {
        background: { color: "#0a0a0a" },
        textColor: "#888"
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false
      },
      timeScale: {
        borderVisible: false
      }
    });

    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: "#00ff66",
      downColor: "#ff3b3b",
      wickUpColor: "#00ff66",
      wickDownColor: "#ff3b3b",
      priceLineVisible: false
    });

    const volumeChart = createChart(volumeRef.current, {
      width: volumeRef.current.clientWidth,
      height: volumeRef.current.clientHeight,
      layout: {
        background: { color: "#0a0a0a" },
        textColor: "#444"
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      rightPriceScale: {
        visible: false
      },
      timeScale: {
        borderVisible: false
      }
    });

    const volumeSeries = volumeChart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" }
    });

    // ===== СИНХРОНИЗАЦИЯ (фикс)
    let isSyncing = false;

    priceChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
      if (isSyncing) return;
      if (!range || !range.from || !range.to) return;

      try {
        isSyncing = true;
        volumeChart.timeScale().setVisibleRange(range);
      } catch {}
      finally {
        isSyncing = false;
      }
    });

    volumeChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
      if (isSyncing) return;
      if (!range || !range.from || !range.to) return;

      try {
        isSyncing = true;
        priceChart.timeScale().setVisibleRange(range);
      } catch {}
      finally {
        isSyncing = false;
      }
    });

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // ===== RESIZE
    const handleResize = () => {
      if (!priceRef.current || !volumeRef.current) return;

      priceChart.applyOptions({
        width: priceRef.current.clientWidth,
        height: priceRef.current.clientHeight
      });

      volumeChart.applyOptions({
        width: volumeRef.current.clientWidth,
        height: volumeRef.current.clientHeight
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      priceChart.remove();
      volumeChart.remove();
    };

  }, []);

  // ===== DATA
  useEffect(() => {
    if (!candles?.length) return;

    const candleData = candles.map((c: any) => ({
      time: Number(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData = candles.map((c: any) => ({
      time: Number(c.time),
      value: c.volume,
      color: c.close >= c.open
        ? "rgba(0,255,100,0.5)"
        : "rgba(255,0,0,0.5)"
    }));

    candleSeriesRef.current?.setData(candleData);
    volumeSeriesRef.current?.setData(volumeData);

  }, [candles]);

  // ===== TRADE LEVELS
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;

    // очистка
    if (entryLineRef.current) {
      try { series.removePriceLine(entryLineRef.current); } catch {}
      entryLineRef.current = null;
    }

    if (tpLineRef.current) {
      try { series.removePriceLine(tpLineRef.current); } catch {}
      tpLineRef.current = null;
    }

    if (slLineRef.current) {
      try { series.removePriceLine(slLineRef.current); } catch {}
      slLineRef.current = null;
    }

    if (!trade) return;

    entryLineRef.current = series.createPriceLine({
      price: trade.entry,
      color: "#ffd700",
      lineWidth: 2,
      axisLabelVisible: true
    });

    tpLineRef.current = series.createPriceLine({
      price: trade.take,
      color: "#00ff66",
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true
    });

    slLineRef.current = series.createPriceLine({
      price: trade.stop,
      color: "#ff3b3b",
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true
    });

  }, [trade]);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <div ref={priceRef} style={{ flex: 4 }} />
      <div ref={volumeRef} style={{ flex: 1 }} />
    </div>
  );
}