import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INTERVALS = new Set([
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "12h",
  "1d",
  "1w",
  "1M",
]);

type CacheEntry = {
  expiresAt: number;
  staleUntil: number;
  data: unknown;
};

const responseCache = new Map<string, CacheEntry>();

function getCached(cacheKey: string) {
  const entry = responseCache.get(cacheKey);

  if (!entry) return null;

  if (entry.expiresAt > Date.now()) {
    return entry.data;
  }

  return null;
}

function getStale(cacheKey: string) {
  const entry = responseCache.get(cacheKey);

  if (!entry) return null;

  if (entry.staleUntil > Date.now()) {
    return entry.data;
  }

  responseCache.delete(cacheKey);
  return null;
}

function setCached(cacheKey: string, data: unknown, ttlMs: number) {
  responseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
    staleUntil: Date.now() + ttlMs * 6,
  });

  if (responseCache.size > 220) {
    const oldestKey = responseCache.keys().next().value;

    if (oldestKey) responseCache.delete(oldestKey);
  }
}

function json(data: unknown, ttlSeconds: number) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 4}`,
    },
  });
}

function cleanSymbol(value: string | null) {
  const symbol = (value || "BTCUSDT").toUpperCase();
  return /^[A-Z0-9]{5,20}$/.test(symbol) ? symbol : "BTCUSDT";
}

function cleanInterval(value: string | null) {
  return value && INTERVALS.has(value) ? value : "1m";
}

async function getJsonFromHosts(hosts: string[], path: string, ttlMs: number) {
  const cacheKey = path;
  const cached = getCached(cacheKey);

  if (cached) return cached;

  let lastError: unknown = null;

  for (const host of hosts) {
    try {
      const res = await fetch(`${host}${path}`, {
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setCached(cacheKey, data, ttlMs);
        return data;
      }

      lastError = new Error(`${host} failed with ${res.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  const stale = getStale(cacheKey);

  if (stale) return stale;

  throw lastError || new Error("Market data request failed");
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");
  const spotHosts = [
    "https://api.binance.com",
    "https://api1.binance.com",
    "https://api2.binance.com",
    "https://api3.binance.com",
    "https://data-api.binance.vision",
  ];
  const futuresHosts = ["https://fapi.binance.com"];

  try {
    if (type === "tickers") {
      const data = await getJsonFromHosts(spotHosts, "/api/v3/ticker/24hr", 12_000);
      return json(data, 12);
    }

    if (type === "klines") {
      const symbol = cleanSymbol(searchParams.get("symbol"));
      const interval = cleanInterval(searchParams.get("interval"));
      const limit = Math.min(
        Math.max(Number(searchParams.get("limit") || 100), 20),
        500
      );
      const data = await getJsonFromHosts(
        spotHosts,
        `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
        interval === "1m" || interval === "3m" ? 8_000 : 20_000
      );

      return json(data, interval === "1m" || interval === "3m" ? 8 : 20);
    }

    if (type === "prices") {
      const symbol = cleanSymbol(searchParams.get("symbol"));
      const [spot, btcSpot, futuresResult, btcFuturesResult] = await Promise.allSettled([
        getJsonFromHosts(spotHosts, `/api/v3/ticker/price?symbol=${symbol}`, 3_000),
        getJsonFromHosts(spotHosts, "/api/v3/ticker/price?symbol=BTCUSDT", 3_000),
        getJsonFromHosts(futuresHosts, `/fapi/v1/ticker/price?symbol=${symbol}`, 3_000),
        getJsonFromHosts(futuresHosts, "/fapi/v1/ticker/price?symbol=BTCUSDT", 3_000),
      ]);
      const spotPrice = spot.status === "fulfilled" ? Number(spot.value?.price || 0) : 0;
      const btcSpotPrice =
        btcSpot.status === "fulfilled" ? Number(btcSpot.value?.price || 0) : 0;
      const futuresPrice =
        futuresResult.status === "fulfilled"
          ? Number(futuresResult.value?.price || 0)
          : 0;
      const btcFuturesPrice =
        btcFuturesResult.status === "fulfilled"
          ? Number(btcFuturesResult.value?.price || 0)
          : 0;

      return json({
        price: futuresPrice || spotPrice,
        btcSpot: btcSpotPrice,
        btcFutures: btcFuturesPrice || btcSpotPrice,
      }, 3);
    }

    return NextResponse.json({ error: "Unknown market data type" }, { status: 400 });
  } catch (error) {
    console.error("Market data error:", error);
    return NextResponse.json(
      { error: "Market data unavailable" },
      { status: 502 }
    );
  }
}
