"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

export default function Chart(props: any) {
  const { candles = [], trade, symbol = "BTCUSDT" } = props;

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

  /* ======================================================
     MOBILE DETECTION
  ====================================================== */

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  /* ======================================================
     INIT CHARTS
  ====================================================== */

  useEffect(() => {
    if (!priceRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;

    /* ================= PRICE CHART ================= */

    const priceChart = createChart(priceRef.current, {
      width,
      height: priceRef.current.clientHeight || 420,

      layout: {
        background: {
          color: "transparent",
        },

        textColor: "rgba(255,255,255,0.42)",
      },

      grid: {
        vertLines: {
          color: "rgba(255,255,255,0.03)",
        },

        horzLines: {
          color: "rgba(255,255,255,0.03)",
        },
      },

      rightPriceScale: {
        visible: true,
        borderVisible: false,

        scaleMargins: {
          top: 0.08,
          bottom: 0.08,
        },
      },

      leftPriceScale: {
        visible: false,
      },

      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 7,
      },

      crosshair: {
        vertLine: {
          color: "rgba(255,159,67,0.18)",
          width: 1,
        },

        horzLine: {
          color: "rgba(255,159,67,0.18)",
          width: 1,
        },
      },
    });

    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: "#2dff87",
      downColor: "#ff5e5e",

      borderUpColor: "#2dff87",
      borderDownColor: "#ff5e5e",

      wickUpColor: "#2dff87",
      wickDownColor: "#ff5e5e",

      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: "rgba(255,179,71,0.62)",
    });

    priceChartRef.current = priceChart;
    candleSeriesRef.current = candleSeries;

    /* ================= VOLUME CHART ================= */

    let volumeChart: any = null;
    let volumeSeries: any = null;

    if (!isMobile && volumeRef.current) {
      volumeChart = createChart(volumeRef.current, {
        width,
        height: volumeRef.current.clientHeight || 80,

        layout: {
          background: {
            color: "transparent",
          },

          textColor: "rgba(255,255,255,0.20)",
        },

        grid: {
          vertLines: {
            visible: false,
          },

          horzLines: {
            visible: false,
          },
        },

        rightPriceScale: {
          visible: false,
        },

        leftPriceScale: {
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

    /* ================= RESIZE ================= */

    const resize = () => {
      if (!containerRef.current || !priceRef.current) return;

      const newWidth = containerRef.current.clientWidth;

      priceChart.applyOptions({
        width: newWidth,
        height: priceRef.current.clientHeight || 420,
      });

      if (volumeChart && volumeRef.current) {
        volumeChart.applyOptions({
          width: newWidth,
          height: volumeRef.current.clientHeight || 100,
        });
      }
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;

    resizeObserver?.observe(containerRef.current);

    window.addEventListener("resize", resize);

    return () => {
      resizeObserver?.disconnect();

      window.removeEventListener("resize", resize);

      priceChart.remove();

      volumeChart?.remove();
    };
  }, [isMobile]);

  /* ======================================================
     SET DATA
  ====================================================== */

  useEffect(() => {
    if (!candles || candles.length === 0) return;

    const candleData = candles.map((c: any) => ({
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
            ? "rgba(45,255,135,0.45)"
            : "rgba(255,94,94,0.45)",
      }));

      volumeSeriesRef.current.setData(volumeData);
    }
  }, [candles, isMobile]);

  /* ======================================================
     TRADE LINES
  ====================================================== */

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

      color: "#ffb347",

      lineWidth: 2,

      axisLabelVisible: true,

      title: "ENTRY",
    });

    tpLineRef.current = series.createPriceLine({
      price: trade.take,

      color: "#2dff87",

      lineWidth: 2,

      lineStyle: 2,

      axisLabelVisible: true,

      title: "TP",
    });

    slLineRef.current = series.createPriceLine({
      price: trade.stop,

      color: "#ff5e5e",

      lineWidth: 2,

      lineStyle: 2,

      axisLabelVisible: true,

      title: "SL",
    });
  }, [trade]);

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="cryptonixChartPanel cx-panel relative w-full overflow-hidden">

      {/* ======================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[260px] w-[260px] rounded-full bg-orange-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-120px] right-[-120px] h-[260px] w-[260px] rounded-full bg-yellow-500/10 blur-3xl" />

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div className="cryptonixChartHeader relative z-10 flex items-center justify-between border-b border-white/6 px-4 py-3 md:px-5">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <div className="relative flex items-center justify-center">

            <div className="h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_15px_rgba(255,170,0,0.85)]" />

            <div className="absolute h-3 w-3 animate-ping rounded-full bg-orange-400/40" />

          </div>

          <div className="flex flex-col">

          <div className="text-sm font-semibold tracking-[0.18em] text-[var(--cx-gold-soft)]">
              CRYPTONIX CHART
            </div>

            <div className="text-[11px] tracking-[0.16em] text-[var(--cx-text-muted)]">
              {symbol} • REAL-TIME MARKET ANALYSIS
            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="hidden items-center gap-2 md:flex">

          <div className="cx-chip px-3 py-[6px] text-white/45">
            AI POWERED
          </div>

          <div className="cx-chip px-3 py-[6px]">
            LIVE
          </div>

        </div>

      </div>

      {/* ======================================================
          CHART AREA
      ====================================================== */}

<div
  ref={containerRef}
  className="cryptonixChartArea
    relative
    w-full
    flex
    flex-col
    rounded-[22px]
    border
    border-[var(--cx-line-soft)]
    bg-[rgba(3,3,3,0.28)]
    backdrop-blur-xl
    overflow-visible
    min-h-[520px]
  "
>

        {/* PRICE CHART */}
        <div
  ref={priceRef}
  className="relative w-full min-h-[420px]"
>
  {(!candles || candles.length === 0) && (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="rounded-full border border-orange-400/15 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        Loading Market Data
      </div>
    </div>
  )}
</div>

        {/* VOLUME */}
        {!isMobile && (
          <div
          ref={volumeRef}
          className="w-full min-h-[90px]"
        />
        )}

      </div>

    </div>
  );
}
