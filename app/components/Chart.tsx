"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
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

  /* ================= MOBILE ================= */

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    check();

    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("resize", check);
    };
  }, []);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!priceRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;

    /* ================= PRICE CHART ================= */

    const priceChart = createChart(priceRef.current, {
      width,
      height: priceRef.current.clientHeight || 320,

      layout: {
        background: {
          color: "#07090d",
        },
        textColor: "rgba(255,255,255,0.45)",
        fontFamily: "Inter, sans-serif",
      },

      grid: {
        vertLines: {
          color: "rgba(255,255,255,0.03)",
        },
        horzLines: {
          color: "rgba(255,255,255,0.03)",
        },
      },

      crosshair: {
        vertLine: {
          color: "rgba(255,255,255,0.12)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#111827",
        },

        horzLine: {
          color: "rgba(255,255,255,0.12)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#111827",
        },
      },

      rightPriceScale: {
        visible: true,
        borderVisible: false,

        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
      },

      timeScale: {
        borderVisible: false,
        timeVisible: true,

        barSpacing: 10,

        rightOffset: 8,
      },
    });

    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: "#00ff9d",
      downColor: "#ff4d6d",

      borderUpColor: "#00ff9d",
      borderDownColor: "#ff4d6d",

      wickUpColor: "#00ff9d",
      wickDownColor: "#ff4d6d",

      priceLineVisible: false,
    });

    priceChartRef.current = priceChart;
    candleSeriesRef.current = candleSeries;

    /* ================= VOLUME ================= */

    let volumeChart: any = null;
    let volumeSeries: any = null;

    if (!isMobile && volumeRef.current) {
      volumeChart = createChart(volumeRef.current, {
        width,
        height: volumeRef.current.clientHeight || 90,

        layout: {
          background: {
            color: "#07090d",
          },
          textColor: "rgba(255,255,255,0.25)",
          fontFamily: "Inter, sans-serif",
        },

        grid: {
          vertLines: {
            color: "rgba(255,255,255,0.02)",
          },
          horzLines: {
            color: "rgba(255,255,255,0.02)",
          },
        },

        rightPriceScale: {
          visible: false,
        },

        timeScale: {
          borderVisible: false,
        },
      });

      volumeSeries = volumeChart.addSeries(HistogramSeries, {
        priceFormat: {
          type: "volume",
        },
      });

      /* ================= SYNC ================= */

      let isSyncing = false;

      priceChart
        .timeScale()
        .subscribeVisibleTimeRangeChange((range: any) => {
          if (isSyncing || !range) return;

          isSyncing = true;

          try {
            volumeChart.timeScale().setVisibleRange(range);
          } catch {}

          isSyncing = false;
        });

      volumeChart
        .timeScale()
        .subscribeVisibleTimeRangeChange((range: any) => {
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

    /* ================= RESIZE ================= */

    const resize = () => {
      if (!containerRef.current || !priceRef.current) return;

      const newWidth = containerRef.current.clientWidth;

      priceChart.applyOptions({
        width: newWidth,
        height: priceRef.current.clientHeight || 320,
      });

      if (volumeChart && volumeRef.current) {
        volumeChart.applyOptions({
          width: newWidth,
          height: volumeRef.current.clientHeight || 90,
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

    const candleData = candles
      .filter(
        (c: any) =>
          Number.isFinite(c.open) &&
          Number.isFinite(c.high) &&
          Number.isFinite(c.low) &&
          Number.isFinite(c.close)
      )
      .map((c: any) => ({
        time: Number(c.time),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

    candleSeriesRef.current?.setData(candleData);

    if (!isMobile && volumeSeriesRef.current) {
      const volumeData = candles.map((c: any) => ({
        time: Number(c.time),

        value: c.volume || 0,

        color:
          c.close >= c.open
            ? "rgba(0,255,157,0.22)"
            : "rgba(255,77,109,0.22)",
      }));

      volumeSeriesRef.current.setData(volumeData);
    }
  }, [candles, isMobile]);

  /* ================= TRADE LINES ================= */

  useEffect(() => {
    const series = candleSeriesRef.current;

    if (!series) return;

    [entryLineRef, tpLineRef, slLineRef].forEach((ref) => {
      if (ref.current) {
        try {
          series.removePriceLine(ref.current);
        } catch {}

        ref.current = null;
      }
    });

    if (!trade) return;

    entryLineRef.current = series.createPriceLine({
      price: trade.entry,

      color: "#ffd166",

      lineWidth: 2,

      lineStyle: 0,

      axisLabelVisible: true,

      title: "ENTRY",
    });

    tpLineRef.current = series.createPriceLine({
      price: trade.take,

      color: "#00ff9d",

      lineWidth: 2,

      lineStyle: 2,

      axisLabelVisible: true,

      title: "TP",
    });

    slLineRef.current = series.createPriceLine({
      price: trade.stop,

      color: "#ff4d6d",

      lineWidth: 2,

      lineStyle: 2,

      axisLabelVisible: true,

      title: "SL",
    });
  }, [trade]);

  /* ================= UI ================= */

  return (
    <div
      ref={containerRef}
      className="
        w-full
        flex
        flex-col
        overflow-hidden

        rounded-2xl

        border
        border-white/[0.05]

        bg-[#07090d]

        shadow-[0_0_40px_rgba(0,255,157,0.04)]

        backdrop-blur-xl
      "
      style={{
        background:
          "linear-gradient(180deg, rgba(18,18,24,0.96) 0%, rgba(7,9,13,1) 100%)",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        className="
          flex
          items-center
          justify-between

          px-4
          py-3

          border-b
          border-white/[0.04]
        "
      >
        <div className="flex flex-col">
          <span
            className="
              text-white
              text-[15px]
              font-semibold
              tracking-wide
            "
          >
            LIVE MARKET
          </span>

          <span
            className="
              text-white/40
              text-[11px]
              mt-[2px]
            "
          >
            AI SIGNAL TERMINAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="
              w-2
              h-2
              rounded-full
              bg-[#00ff9d]

              animate-pulse
            "
          />

          <span
            className="
              text-[#00ff9d]
              text-[12px]
              font-medium
            "
          >
            LIVE
          </span>
        </div>
      </div>

      {/* ================= PRICE ================= */}

      <div
        ref={priceRef}
        className="
          flex-[4]
          min-h-[320px]
        "
      />

      {/* ================= VOLUME ================= */}

      {!isMobile && (
        <div
          ref={volumeRef}
          className="
            flex-[1]
            min-h-[90px]

            border-t
            border-white/[0.03]
          "
        />
      )}
    </div>
  );
}