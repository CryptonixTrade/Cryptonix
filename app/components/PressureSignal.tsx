"use client";

import { useMemo } from "react";

export default function TechnicalSignal({ candles }: any) {

  const signal = useMemo(() => {
    if (!candles || candles.length < 30) return null;

    const closes = candles.map((c:any)=>Number(c.close || 0));
    const volumes = candles.map((c:any)=>Number(c.volume || 0));

    if (closes.length < 30) return null;

    // ===== MA
    const maFast =
      closes.slice(-9).reduce((a:number,b:number)=>a+b,0)/9;

    const maSlow =
      closes.slice(-21).reduce((a:number,b:number)=>a+b,0)/21;

    let maScore = 0;
    if (maFast > maSlow) maScore = 1;
    else if (maFast < maSlow) maScore = -1;

    // ===== RSI (фикс)
    let gains = 0;
    let losses = 0;

    for(let i = closes.length - 14; i < closes.length; i++){
      const prev = closes[i - 1];
      const curr = closes[i];

      if(prev === undefined || curr === undefined) continue;

      const diff = curr - prev;

      if(diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }

    const rs = gains / (losses || 1);
    const rsi = 100 - (100 / (1 + rs));

    let rsiScore = 0;

    if (rsi > 65) rsiScore = 1;
    else if (rsi < 35) rsiScore = -1;

    // ===== VOLUME
    const volNow = volumes.at(-1) || 0;
    const volAvg =
      volumes.slice(-10).reduce((a:number,b:number)=>a+b,0)/10;

    let volScore = 0;

    if (volNow > volAvg * 1.1) volScore = 1;
    else if (volNow < volAvg * 0.9) volScore = -1;

    // ===== FINAL SCORE
    const raw =
      maScore * 0.4 +
      rsiScore * 0.3 +
      volScore * 0.3;

    const score = Math.max(0, Math.min(100, (raw + 1) / 2 * 100));

    // 🔥 УМНАЯ ЗОНА (не дёргается)
    let decision = "NO TRADE";

    if (score > 65) decision = "LONG";
    else if (score < 35) decision = "SHORT";

    return { score, decision, rsi };

  }, [candles]);

  if (!signal) return null;

  const color =
    signal.decision === "LONG"
      ? "#00ff66"
      : signal.decision === "SHORT"
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
        TECHNICAL SIGNAL
      </div>

      {/* ШКАЛА */}
      <div style={{
        marginTop:10,
        height:14,
        borderRadius:10,
        background:"linear-gradient(to right, #ff3b3b, #222, #00ff66)",
        position:"relative"
      }}>

        <div style={{
          position:"absolute",
          left:`${signal.score}%`,
          top:"50%",
          transform:"translate(-50%, -50%)",
          width:14,
          height:14,
          borderRadius:"50%",
          background:"#ffd700",
          boxShadow:"0 0 6px #ffd700"
        }}/>

      </div>

      <div style={{
        marginTop:10,
        fontSize:18,
        fontWeight:700,
        color
      }}>
        {signal.decision}
      </div>

      <div style={{ fontSize:12 }}>
        {signal.score.toFixed(0)}%
      </div>

      <div style={{ fontSize:11 }}>
        RSI: {signal.rsi.toFixed(0)}
      </div>

    </div>
  );
}