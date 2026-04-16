"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, HistogramSeries } from "lightweight-charts";

export default function Chart({ candles, trade }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { color: "#0a0a0a" },
        textColor: "#aaa"
      },
      grid: {
        vertLines: { color: "#111" },
        horzLines: { color: "#111" }
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00ff66",
      downColor: "#ff3b3b",
      wickUpColor: "#00ff66",
      wickDownColor: "#ff3b3b",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (!containerRef.current) return;

      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

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
      color: c.close >= c.open ? "#00ff66" : "#ff3b3b",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    lastTimeRef.current = candleData.at(-1)?.time;
  }, [candles]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        overflow: "hidden"
      }}
    />
  );
}