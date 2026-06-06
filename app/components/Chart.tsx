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
        attributionLogo: false,
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
          attributionLogo: false,
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
    <div className="cryptonixChartPanel cx-panel cxReveal relative w-full overflow-hidden">
      <div className="cryptonixChartHeader relative z-10 flex items-center justify-between border-b border-white/6 px-5 py-4 md:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <div className="cxChartGlyph" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="text-base font-semibold text-white md:text-xl">
              Market Intelligence
            </div>

            <div className="mt-1 text-[11px] tracking-[0.14em] text-[var(--cx-text-muted)] md:text-xs">
              {symbol} / neural price structure
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://www.tradingview.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="cx-chip px-3 py-[6px] text-white/35 transition-colors duration-500 hover:text-white/60"
          >
            Chart Engine
          </a>

          <div className="cx-chip px-3 py-[6px] text-white/45">
            Neural
          </div>

          <div className="cx-chip px-3 py-[6px]">
            Live
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="cryptonixChartArea relative flex min-h-[560px] w-full flex-col overflow-visible rounded-[28px] border border-[var(--cx-line-soft)] bg-[rgba(3,3,3,0.20)] backdrop-blur-xl"
      >
        <div ref={priceRef} className="relative min-h-[455px] w-full">
          {(!candles || candles.length === 0) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="cxLoadingPill">
                Synchronizing Market Data
              </div>
            </div>
          )}
        </div>

        {!isMobile && (
          <div
            ref={volumeRef}
            className="min-h-[100px] w-full"
          />
        )}
      </div>
    </div>
  );
}
