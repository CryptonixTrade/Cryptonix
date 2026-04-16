"use client";

import { useEffect, useState } from "react";

export default function OrderBook({ symbol, onUpdate }: any) {

  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@depth10@100ms`
    );

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      const b = data.b.map((x:any)=>({
        price:+x[0],
        qty:+x[1]
      }));

      const a = data.a.map((x:any)=>({
        price:+x[0],
        qty:+x[1]
      }));

      setBids(b);
      setAsks(a);

      // 🔥 ВАЖНО: данные продолжают идти в систему
      onUpdate?.({ bids: b, asks: a });
    };

    return () => ws.close();
  }, [symbol]);

  // ❌ UI УБРАН ПОЛНОСТЬЮ
  return null;
}