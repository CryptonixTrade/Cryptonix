export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type OrderBookState = {
  imbalance: number;
  bidVolume: number;
  askVolume: number;
};

export async function fetchMarketData(path: string, signal?: AbortSignal) {
  const res = await fetch(`/api/market-data?${path}`, {
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error(`Market data failed: ${res.status}`);
  }

  return res.json();
}

export function mapKlines(data: unknown): Candle[] {
  if (!Array.isArray(data)) return [];

  const candles = data
    .map((c: any) => ({
      time: Number(c?.[0]) / 1000,
      open: Number(c?.[1]),
      high: Number(c?.[2]),
      low: Number(c?.[3]),
      close: Number(c?.[4]),
      volume: Number(c?.[5]),
    }))
    .filter((c: Candle) =>
      Number.isFinite(c.time) &&
      Number.isFinite(c.open) &&
      Number.isFinite(c.high) &&
      Number.isFinite(c.low) &&
      Number.isFinite(c.close) &&
      c.open > 0 &&
      c.high > 0 &&
      c.low > 0 &&
      c.close > 0
    );

  const byTime = new Map<number, Candle>();

  for (const candle of candles) {
    byTime.set(candle.time, candle);
  }

  return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
}

export function isTabletViewport() {
  return window.innerWidth >= 600 && window.innerWidth <= 1180;
}
