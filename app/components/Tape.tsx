"use client";

import { useEffect, useRef, useState } from "react";

export default function Tape({ symbol, onUpdate }: any) {

  const [trades, setTrades] = useState<any[]>([]);
  const bufferRef = useRef<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // ===== WS
  useEffect(() => {
    if (!symbol) return;

    wsRef.current?.close();

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@trade`
    );

    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      bufferRef.current.push({
        price: Number(data.p),
        qty: Number(data.q),
        isBuy: !data.m
      });
    };

    return () => ws.close();
  }, [symbol]);

  // ===== ПЛАВНОЕ ОБНОВЛЕНИЕ
  useEffect(() => {
    const interval = setInterval(() => {

      if (bufferRef.current.length === 0) return;

      setTrades(prev => {
        const next = [...bufferRef.current, ...prev];

        onUpdate?.(next);

        bufferRef.current = [];
        return next.slice(0, 40);
      });

    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: 200,
      background:"#0f0f0f",
      borderLeft:"1px solid #111",
      padding:10,
      fontSize:11
    }}>

      <div style={{ marginBottom:6, opacity:0.6 }}>
        Trades
      </div>

      {trades.map((t, i) => {

        const color = t.isBuy ? "#00ff66" : "#ff3b3b";

        return (
          <div
            key={i}
            style={{
              display:"flex",
              justifyContent:"space-between",
              color,
              opacity:0.9
            }}
          >
            <span>{t.price.toFixed(2)}</span>
            <span>{t.qty.toFixed(3)}</span>
          </div>
        );
      })}

    </div>
  );
}