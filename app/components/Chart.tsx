"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries
} from "lightweight-charts";

export default function Chart(props: any) {
  const { candles = [], trade } = props;
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

  const [isMobile, setIsMobile] = useState(false);

  /* ===== DETECT MOBILE ===== */
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!priceRef.current || !containerRef.current) return;

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
      }
    });

    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: "#00ff66",
      downColor: "#ff3b3b",
      wickUpColor: "#00ff66",
      wickDownColor: "#ff3b3b",
      priceLineVisible: false
    });

    priceChartRef.current = priceChart;
    candleSeriesRef.current = candleSeries;

    /* ===== VOLUME (ТОЛЬКО НЕ МОБИЛКА) ===== */
    let volumeChart: any = null;
    let volumeSeries: any = null;

    if (!isMobile && volumeRef.current) {
      volumeChart = createChart(volumeRef.current, {
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

      volumeSeries = volumeChart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" }
      });

      // SYNC
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

      volumeChartRef.current = volumeChart;
      volumeSeriesRef.current = volumeSeries;
    }

    /* ===== RESIZE ===== */
    const resize = () => {
      if (!containerRef.current || !priceRef.current) return;

      const newWidth = containerRef.current.clientWidth;

      priceChart.applyOptions({
        width: newWidth,
        height: priceRef.current.clientHeight || 300
      });

      if (volumeChart && volumeRef.current) {
        volumeChart.applyOptions({
          width: newWidth,
          height: volumeRef.current.clientHeight || 100
        });
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerRef.current);

    window.addEventListener("resize", resize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);

      priceChart.remove();
      volumeChart?.remove();
    };

  }, [isMobile]);

  /* ================= DATA ================= */

  useEffect(() => {
    if (!candles || candles.length === 0) return;

    const candleData = candles.map((c: any) => ({
      time: Number(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    candleSeriesRef.current?.setData(candleData);

    if (!isMobile && volumeSeriesRef.current) {
      const volumeData = candles.map((c: any) => ({
        time: Number(c.time),
        value: c.volume || 0,
        color:
          c.close >= c.open
            ? "rgba(0,255,100,0.5)"
            : "rgba(255,0,0,0.5)"
      }));

      volumeSeriesRef.current.setData(volumeData);
    }

  }, [candles, isMobile]);

  /* ================= TRADE ================= */

  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;

    [entryLineRef, tpLineRef, slLineRef].forEach(ref => {
      if (ref.current) {
        try { series.removePriceLine(ref.current); } catch {}
        ref.current = null;
      }
    });

    if (!trade) return;

    entryLineRef.current = series.createPriceLine({
      price: trade.entry,
      color: "#ffd700",
      lineWidth: 2
    });

    tpLineRef.current = series.createPriceLine({
      price: trade.take,
      color: "#00ff66",
      lineWidth: 2,
      lineStyle: 2
    });

    slLineRef.current = series.createPriceLine({
      price: trade.stop,
      color: "#ff3b3b",
      lineWidth: 2,
      lineStyle: 2
    });

  }, [trade]);

  /* ================= UI ================= */

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">

      {/* PRICE */}
      <div ref={priceRef} className="flex-[4] min-h-[200px]" />

      {/* VOLUME (ТОЛЬКО DESKTOP) */}
      {!isMobile && (
        <div ref={volumeRef} className="flex-[1] min-h-[80px]" />
      )}

    </div>
  );
}