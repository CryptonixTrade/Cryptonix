"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries
} from "lightweight-charts";

export default function Chart({ candles, trade }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const priceChartRef = useRef<any>(null);
  const volumeChartRef = useRef<any>(null);

  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const entryLineRef = useRef<any>(null);
  const tpLineRef = useRef<any>(null);
  const slLineRef = useRef<any>(null);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!priceRef.current || !volumeRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;

    const priceChart = createChart(priceRef.current, {
      width,
      height: priceRef.current.clientHeight || 300,

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
        borderVisible: false,
        timeVisible: true
      },

      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false
      },

      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true
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
      width,
      height: volumeRef.current.clientHeight || 100,

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

    // ===== SYNC TIME SCALE
    let isSyncing = false;

    priceChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
      if (isSyncing || !range) return;
      isSyncing = true;
      try {
        volumeChart.timeScale().setVisibleRange(range);
      } catch {}
      isSyncing = false;
    });

    volumeChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
      if (isSyncing || !range) return;
      isSyncing = true;
      try {
        priceChart.timeScale().setVisibleRange(range);
      } catch {}
      isSyncing = false;
    });

    priceChartRef.current = priceChart;
    volumeChartRef.current = volumeChart;

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    /* ================= RESIZE ================= */

    const resize = () => {
      if (!containerRef.current || !priceRef.current || !volumeRef.current) return;

      const newWidth = containerRef.current.clientWidth;

      priceChart.applyOptions({
        width: newWidth,
        height: priceRef.current.clientHeight || 300
      });

      volumeChart.applyOptions({
        width: newWidth,
        height: volumeRef.current.clientHeight || 100
      });
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerRef.current);

    window.addEventListener("resize", resize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);

      priceChart.remove();
      volumeChart.remove();
    };

  }, []);

  /* ================= DATA ================= */

  useEffect(() => {
    if (!candles || !Array.isArray(candles) || candles.length === 0) return;

    const candleData = candles.map((c: any) => ({
      time: Number(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    const volumeData = candles.map((c: any) => ({
      time: Number(c.time),
      value: c.volume || 0,
      color:
        c.close >= c.open
          ? "rgba(0,255,100,0.5)"
          : "rgba(255,0,0,0.5)"
    }));

    candleSeriesRef.current?.setData(candleData);
    volumeSeriesRef.current?.setData(volumeData);

  }, [candles]);

  /* ================= TRADE ================= */

  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;

    // очистка старых линий
    [entryLineRef, tpLineRef, slLineRef].forEach(ref => {
      if (ref.current) {
        try { series.removePriceLine(ref.current); } catch {}
        ref.current = null;
      }
    });

    if (!trade || !trade.entry || !trade.take || !trade.stop) return;

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

  /* ================= UI ================= */

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">

      {/* PRICE */}
      <div ref={priceRef} className="flex-[4] min-h-[200px]" />

      {/* VOLUME */}
      <div ref={volumeRef} className="flex-[1] min-h-[80px]" />

    </div>
  );
}