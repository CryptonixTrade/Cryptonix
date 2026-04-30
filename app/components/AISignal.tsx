"use client";

import { useEffect, useRef, useState } from "react";

type Candle = {
  time: number;
  close: number;
  volume: number;
};

type Decision = "LONG" | "SHORT" | "NO TRADE" | "EXPIRED";

type Signal = {
  score: number;
  decision: Decision;
  confidence: number;
  entryTime: number;
  expiryTime: number;
  hold: string;
  entryPrice: number;
};

type AISignalProps = {
  candles: any[];
  onSignal: (signal: any) => void;
  flow: any;
  interval: string;
  techSignal: any; // <-- ОБОВʼЯЗКОВО ДОДАЙ
};

export default function AISignal(props: any) {

  const { candles = [], onSignal, flow, interval = "1m" } = props;
  const [signal, setSignal] = useState<Signal | null>(null);

  const lastCandleRef = useRef<number | null>(null);
  const scoreRef = useRef<number | null>(null);

  function clamp(v: number, min = -1, max = 1) {
    return Math.max(min, Math.min(max, v));
  }

  function EMA(prev: number | null, value: number, alpha = 0.12) {
    if (prev === null) return value;
    return prev * (1 - alpha) + value * alpha;
  }

  function calcEMA(data: number[], period: number) {
    if (!data.length) return 0;
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  function calcRSI(data: number[], period = 14) {
    if (data.length < period + 1) return 50;

    let gains = 0, losses = 0;
    for (let i = data.length - period; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const rs = gains / (losses || 1);
    return 100 - (100 / (1 + rs));
  }

  function detectPhase(closes:number[]){
    const short = closes.slice(-20);
    const long = closes.slice(-60);

    const shortRange = Math.max(...short) - Math.min(...short);
    const longRange = Math.max(...long) - Math.min(...long);

    const ratio = shortRange / (longRange || 1);

    if (ratio < 0.3) return "FLAT";
    if (ratio > 0.8) return "EXPANSION";
    return "TREND";
  }

  function getTTL(vol:number){
    let base =
      interval === "1m" ? 2 :
      interval === "5m" ? 8 : 25;

    if (vol > 0.001) base *= 0.7;
    if (vol < 0.0004) base *= 1.3;

    return Math.max(1, Math.round(base));
  }

  function calculate() {
    if (candles.length < 60) return null;

const closes = candles.map((c: Candle) => c.close);

    const last = closes.at(-1)!;
    const prev = closes.at(-5)!;

    const emaFast = calcEMA(closes.slice(-30), 9);
    const emaSlow = calcEMA(closes.slice(-60), 21);
    const higherEMA = calcEMA(closes.slice(-100), 50);

    const trend = emaFast > emaSlow ? 1 : -1;
    const higherTrend = last > higherEMA ? 1 : -1;

    const momentum = clamp(((last - prev) / prev) * 40);

    const rsi = calcRSI(closes);
    const rsiScore = rsi > 70 ? -0.6 : rsi < 30 ? 0.6 : 0;

    const buy = flow?.buyVolume ?? 0;
    const sell = flow?.sellVolume ?? 0;

    const flowScore =
      buy + sell > 0 ? clamp((buy - sell) / (buy + sell)) : 0;

    const phase = detectPhase(closes);
    const volatility = Math.abs(last - prev) / last;

    /* ===== PENALTIES (вместо убийства сигнала) ===== */

    let penalty = 1;

    if (trend !== higherTrend) penalty *= 0.7;
    if (Math.abs(flowScore) < 0.1) penalty *= 0.8;
    if (volatility < 0.00025) penalty *= 0.75;

    const agreement =
      (trend > 0 && momentum > 0 && flowScore > 0) ||
      (trend < 0 && momentum < 0 && flowScore < 0);

    if (!agreement) penalty *= 0.7;

    const impulse = Math.abs(last - prev) / prev > 0.0008;
    if (!impulse && phase !== "TREND") penalty *= 0.75;

    let phaseBoost = 1;
    if (phase === "FLAT") phaseBoost = 0.7;
    if (phase === "EXPANSION") phaseBoost = 1.2;

    const raw =
      (trend * 0.3 +
      momentum * 0.25 +
      flowScore * 0.25 +
      rsiScore * 0.2) *
      phaseBoost *
      penalty;

    return Math.max(0, Math.min(100, ((raw + 1) / 2) * 100));
  }

  useEffect(() => {
    if (!candles.length) return;

    const last = candles.at(-1);
    if (!last) return;

    if (last.time === lastCandleRef.current) return;
    lastCandleRef.current = last.time;

    const base = calculate();
    if (base === null) return;

    const smooth = EMA(scoreRef.current, base);
    scoreRef.current = smooth;

    let decision: Decision = "NO TRADE";

    if (smooth > 58) decision = "LONG";
    else if (smooth < 42) decision = "SHORT";

    const prev = candles.at(-5);
    if (!prev) return;

    const vol = Math.abs(last.close - prev.close) / last.close;
    const ttl = getTTL(vol);

    const buy = flow?.buyVolume ?? 0;
    const sell = flow?.sellVolume ?? 0;

    const confidence = Math.min(
      100,
      Math.abs(smooth - 50) * 0.6 +
      Math.abs(buy - sell) * 0.3 +
      vol * 200
    );

    const now = Date.now();

    const newSignal: Signal = {
      score: smooth,
      decision,
      confidence,
      entryTime: now,
      expiryTime: now + ttl * 60000,
      hold: `${ttl} min`,
      entryPrice: last.close
    };

    setSignal(newSignal);
    onSignal?.(newSignal);

  }, [candles]);

  if (!signal) return null;

  const expired = Date.now() > signal.expiryTime;
  const decision = expired ? "EXPIRED" : signal.decision;

  const color =
    decision === "LONG"
      ? "#00ff66"
      : decision === "SHORT"
      ? "#ff3b3b"
      : "#999";

  function getTimeLeft(expiry: number) {
    const diff = expiry - Date.now();
    if (diff <= 0) return "expired";
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}m ${s}s`;
  }

  return (
    <div style={{ background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:10, padding:"8px 10px", marginBottom:6 }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:9,opacity:0.5,width:100}}>CRYPTONIX ({interval})</div>

        <div style={{flex:1,height:4,borderRadius:10,background:"linear-gradient(to right, #ff3b3b, #222, #00ff66)",position:"relative"}}>
          <div style={{position:"absolute",left:`${signal.score}%`,top:"50%",transform:"translate(-50%, -50%)",width:10,height:10,borderRadius:"50%",background:"#ffd700"}}/>
        </div>

        <div style={{width:80,textAlign:"right"}}>
          <div style={{fontSize:12,fontWeight:600,color}}>{decision}</div>
          <div style={{fontSize:10,opacity:0.6}}>{signal.score.toFixed(0)}%</div>
        </div>
      </div>

      <div style={{fontSize:9,opacity:0.7,display:"flex",justifyContent:"space-between"}}>
        <span>{signal.hold}</span>
        <span>{getTimeLeft(signal.expiryTime)}</span>
      </div>
    </div>
  );
}