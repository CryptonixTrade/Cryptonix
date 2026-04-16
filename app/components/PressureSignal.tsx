"use client";

import { useMemo } from "react";

export default function PressureSignal({ bids, asks, trades }: any) {

  const signal = useMemo(() => {

    if (!bids.length || !asks.length || !trades.length) return null;

    // ===== PRICE (из tape)
    const currentPrice = trades[0]?.price || 0;

    // ===== ORDERBOOK
    const bidVolume = bids.reduce((s:any,b:any)=>s+b.qty,0);
    const askVolume = asks.reduce((s:any,a:any)=>s+a.qty,0);
    const obPressure = bidVolume - askVolume;

    // ===== TAPE
    const buyVolume = trades.filter((t:any)=>t.isBuy).reduce((s:any,t:any)=>s+t.qty,0);
    const sellVolume = trades.filter((t:any)=>!t.isBuy).reduce((s:any,t:any)=>s+t.qty,0);

    const tapePressure = buyVolume - sellVolume;

    // ===== FINAL
    const total = obPressure * 0.6 + tapePressure * 0.4;

    const strengthRaw = Math.min(100, Math.abs(total));
    const strength = Math.round(strengthRaw / 10) * 10;

    const side = total >= 0 ? "LONG" : "SHORT";

    // =====================================
    // 🔥 ENTRY / STOP / TAKE
    // =====================================
    let entry = currentPrice;
    let stop = 0;
    let take = 0;

    const risk = currentPrice * 0.002; // 0.2%

    if (side === "LONG") {
      stop = entry - risk;
      take = entry + risk * 2;
    } else {
      stop = entry + risk;
      take = entry - risk * 2;
    }

    // =====================================
    // 🔥 AI SPEED
    // =====================================
    const lastTrades = trades.slice(0, 20);
    const prevTrades = trades.slice(20, 40);

    const lastVolume = lastTrades.reduce((s:any,t:any)=>s+t.qty,0);
    const prevVolume = prevTrades.reduce((s:any,t:any)=>s+t.qty,0);

    let momentum = "FLAT";

    if (lastVolume > prevVolume * 1.2) momentum = "STRONG";
    if (lastVolume < prevVolume * 0.8) momentum = "WEAK";

    const speedRaw = (trades.length * 2 + lastVolume) / 2;
    let speed = Math.min(100, speedRaw);
    speed = Math.round(speed / 10) * 10;

    return {
      side,
      strength,
      entry,
      stop,
      take,
      momentum,
      speed
    };

  }, [bids, asks, trades]);

  if (!signal) return null;

  const color = signal.side === "LONG" ? "#00ff66" : "#ff3b3b";

  return (
    <div style={{
      background:"#0f0f0f",
      padding:10,
      marginBottom:10,
      border:"1px solid #111",
      borderRadius:6
    }}>

      <div style={{ fontSize:12, opacity:0.6 }}>
        AI Trade Signal
      </div>

      <div style={{
        fontSize:18,
        color,
        fontWeight:600
      }}>
        {signal.side} ({signal.strength}%)
      </div>

      {/* ENTRY */}
      <div style={{ marginTop:6, fontSize:12 }}>
        Entry: {signal.entry.toFixed(2)}
      </div>

      {/* STOP */}
      <div style={{ fontSize:12, color:"#ff3b3b" }}>
        Stop: {signal.stop.toFixed(2)}
      </div>

      {/* TAKE */}
      <div style={{ fontSize:12, color:"#00ff66" }}>
        Take: {signal.take.toFixed(2)}
      </div>

      {/* MOMENTUM */}
      <div style={{ fontSize:12, marginTop:4 }}>
        Momentum: {signal.momentum}
      </div>

      {/* SPEED */}
      <div style={{ fontSize:12 }}>
        AI Speed: {signal.speed}
      </div>

    </div>
  );
}