"use client";

import { useEffect, useRef, useState } from "react";

export default function AISignal({ candles, onSignal, flow, interval }: any) {

  const [signal, setSignal] = useState<any>(null);

  const signalRef = useRef<any>(null);
  const scoreEMARef = useRef<number | null>(null);
  const lastDecisionRef = useRef<string>("NO TRADE");
  const lastCandleTimeRef = useRef<number | null>(null);

  const safeInterval = interval || "1m";

  const TTL_MAP:any = {
    "1m": 60 * 1000 * 2,
    "5m": 60 * 1000 * 10,
    "15m": 60 * 1000 * 30,
    "1h": 60 * 60 * 1000 * 2
  };

  function EMA(prev:number|null, value:number, alpha=0.5){
    if(prev === null) return value;
    return prev * (1 - alpha) + value * alpha;
  }

  function calculate(){

    if (!candles || candles.length < 20) return null;

    const closes = candles.map((c:any)=>Number(c.close || 0));
    const volumes = candles.map((c:any)=>Number(c.volume || 0));

    if(closes.length < 20) return null;

    const emaFast =
      closes.slice(-9).reduce((a:number,b:number)=>a+b,0)/9;

    const emaSlow =
      closes.slice(-21).reduce((a:number,b:number)=>a+b,0)/21;

    const trend = emaFast > emaSlow ? 1 : -1;

    const last = closes[closes.length - 1];
    const prev = closes[closes.length - 5];

    if(!last || !prev) return null;

    const momentum = (last - prev)/prev;

    const volAvg =
      volumes.slice(-10).reduce((a:number,b:number)=>a+b,0)/10;

    const volumeStrong = volumes[volumes.length - 1] > volAvg;

    // ===== FLOW (сглаженный)
    const buy = Number(flow?.buyVolume || 0);
    const sell = Number(flow?.sellVolume || 0);

    let flowScore = 0;

    if(buy + sell > 0){
      const ratio = buy/(buy+sell);

      if(ratio > 0.65) flowScore = 1;
      else if(ratio < 0.35) flowScore = -1;
    }

    let raw =
      trend * 0.35 +
      (momentum > 0 ? 1 : -1) * 0.25 +
      (volumeStrong ? 1 : -1) * 0.2 +
      flowScore * 0.2;

    let score = Math.max(0, Math.min(100, (raw+1)/2*100));

    return { score, trend, momentum, volumeStrong, flowScore };
  }

  useEffect(() => {
    if (!candles || candles.length < 50) return;

    const lastCandle = candles[candles.length - 1];
    if(!lastCandle) return;

    // ✅ только новая свеча
    if(lastCandle.time === lastCandleTimeRef.current) return;
    lastCandleTimeRef.current = lastCandle.time;

    const base = calculate();
    if(!base) return;

    const smoothScore = EMA(scoreEMARef.current, base.score, 0.4);
    scoreEMARef.current = smoothScore;

    if(smoothScore === null) return;

    let decision = lastDecisionRef.current;

    // ===== HYSTERESIS
    if (decision !== "LONG" && smoothScore > 65) {
      decision = "LONG";
    }
    else if (decision === "LONG" && smoothScore < 55) {
      decision = "NO TRADE";
    }

    if (decision !== "SHORT" && smoothScore < 35) {
      decision = "SHORT";
    }
    else if (decision === "SHORT" && smoothScore > 45) {
      decision = "NO TRADE";
    }

    // ===== FILTER
    const badTrade =
      !base.volumeStrong ||
      Math.abs(base.momentum) < 0.001 ||
      (decision === "LONG" && base.flowScore === -1) ||
      (decision === "SHORT" && base.flowScore === 1);

    if(badTrade) decision = "NO TRADE";

    if(decision === lastDecisionRef.current && signalRef.current){
      setSignal(signalRef.current);
      return;
    }

    lastDecisionRef.current = decision;

    // ===== TYPE
    let tradeType = "SCALP";
    let duration = "1-5 min";

    if(safeInterval==="5m"){
      tradeType="INTRADAY";
      duration="5-30 min";
    }
    if(safeInterval==="15m"){
      tradeType="INTRADAY";
      duration="30-90 min";
    }
    if(safeInterval==="1h"){
      tradeType="SWING";
      duration="1-4h";
    }

    const entryType =
      Math.abs(base.momentum) > 0.004
        ? "MARKET"
        : "PULLBACK";

    let rr = 0;
    if(decision !== "NO TRADE"){
      const strength = Math.abs(smoothScore - 50)/50;
      rr = 1 + strength * 2;
    }

    const now = Date.now();
    const ttl = TTL_MAP[safeInterval] || 180000;

    const newSignal = {
      score: smoothScore || 50,
      decision,
      zone: decision,
      confidence: Math.abs((smoothScore || 50) - 50)*2,
      tradeType,
      duration,
      entryType,
      rr,
      reason: decision === "NO TRADE" ? "Filtered" : "Valid setup",
      createdAt: now,
      expiresAt: now + ttl
    };

    signalRef.current = newSignal;

    setSignal(newSignal);
    onSignal?.(newSignal);

  }, [candles, flow, interval]);

  if(!signal) return null;

  const now = Date.now();
  const isExpired = now > signal.expiresAt;
  const seconds = Math.max(0, Math.floor((signal.expiresAt - now)/1000));

  const score = signal.score || 50;

  const color =
    signal.decision==="LONG"
      ? "#00ff66"
      : signal.decision==="SHORT"
      ? "#ff3b3b"
      : "#999";

  return (
    <div style={{
      background:"#0f0f0f",
      border:"1px solid #111",
      borderRadius:12,
      padding:16,
      marginBottom:10,
      textAlign:"center"
    }}>

      <div style={{ fontSize:12, opacity:0.6 }}>
        AI SIGNAL
      </div>

      {/* ШКАЛА */}
      <div style={{
        marginTop:10,
        height:16,
        borderRadius:10,
        background:"linear-gradient(to right, #ff3b3b, #333, #00ff66)",
        position:"relative"
      }}>

        <div style={{
          position:"absolute",
          left:`${score}%`,
          top:"50%",
          transform:"translate(-50%, -50%)",
          width:16,
          height:16,
          borderRadius:"50%",
          background:"#ffd700"
        }}/>

        <div style={{
          position:"absolute",
          top:-18,
          left:`${score}%`,
          transform:"translateX(-50%)",
          fontSize:10,
          color:"#ffd700"
        }}>
          {score.toFixed(0)}%
        </div>

      </div>

      <div style={{
        marginTop:10,
        fontSize:18,
        fontWeight:700,
        color
      }}>
        {isExpired ? "EXPIRED" : signal.zone}
      </div>

      <div style={{ fontSize:12 }}>
        {signal.decision} • {signal.confidence.toFixed(0)}%
      </div>

      <div style={{ marginTop:6, fontSize:11 }}>
        {signal.tradeType} • {signal.duration}
      </div>

      <div style={{ fontSize:11 }}>
        Entry: {signal.entryType}
      </div>

      <div style={{ fontSize:11 }}>
        RR: {signal.rr ? signal.rr.toFixed(2) : "--"}
      </div>

      <div style={{ fontSize:10, opacity:0.6 }}>
        {signal.reason}
      </div>

      <div style={{
        marginTop:6,
        fontSize:10,
        color: isExpired ? "#ff3b3b" : "#ffd700"
      }}>
        {isExpired ? "Expired" : `${seconds}s`}
      </div>

    </div>
  );
}