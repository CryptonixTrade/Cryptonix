import { NextRequest, NextResponse } from "next/server";

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

function cleanSymbol(value: string | null) {
  const symbol = (value || "BTCUSDT").toUpperCase();
  return /^[A-Z0-9]{5,20}$/.test(symbol) ? symbol : "BTCUSDT";
}

function cleanInterval(value: string | null) {
  return value && INTERVALS.has(value) ? value : "1m";
}

async function getJsonFromHosts(hosts: string[], path: string) {
  let lastError: unknown = null;

  for (const host of hosts) {
    try {
      const res = await fetch(`${host}${path}`, {
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (res.ok) return res.json();
      lastError = new Error(`${host} failed with ${res.status}`);
    } catch (error) {
      lastError = error;
    }
  }

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
      const data = await getJsonFromHosts(spotHosts, "/api/v3/ticker/24hr");
      return NextResponse.json(data);
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
        `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      return NextResponse.json(data);
    }

    if (type === "prices") {
      const symbol = cleanSymbol(searchParams.get("symbol"));
      const [spot, btcSpot, futuresResult, btcFuturesResult] = await Promise.allSettled([
        getJsonFromHosts(spotHosts, `/api/v3/ticker/price?symbol=${symbol}`),
        getJsonFromHosts(spotHosts, "/api/v3/ticker/price?symbol=BTCUSDT"),
        getJsonFromHosts(futuresHosts, `/fapi/v1/ticker/price?symbol=${symbol}`),
        getJsonFromHosts(futuresHosts, "/fapi/v1/ticker/price?symbol=BTCUSDT"),
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

      return NextResponse.json({
        price: futuresPrice || spotPrice,
        btcSpot: btcSpotPrice,
        btcFutures: btcFuturesPrice || btcSpotPrice,
      });
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
