"use client";

import { useEffect } from "react";

type Props = {
  symbol: string;
  onUpdate?: (data: {
    imbalance: number; // -1 .. +1
    bidVolume: number;
    askVolume: number;
  }) => void;
};

export default function OrderBook({ symbol, onUpdate }: Props) {

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@depth10@100ms`
    );

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (!data?.b || !data?.a) return;

        const bids = data.b.map((x:any)=>+x[1]);
        const asks = data.a.map((x:any)=>+x[1]);

        const bidVolume = bids.reduce((a:number,b:number)=>a+b,0);
        const askVolume = asks.reduce((a:number,b:number)=>a+b,0);

        const total = bidVolume + askVolume;

        const imbalance =
          total > 0 ? (bidVolume - askVolume) / total : 0;

        onUpdate?.({
          imbalance,
          bidVolume,
          askVolume
        });

      } catch {}
    };

    return () => ws.close();

  }, [symbol]);

  return null; // 🔥 UI убрали — только данные
}