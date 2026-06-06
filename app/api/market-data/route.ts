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

async function getJson(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Market request failed: ${res.status}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");

  try {
    if (type === "tickers") {
      const data = await getJson("https://api.binance.com/api/v3/ticker/24hr");
      return NextResponse.json(data);
    }

    if (type === "klines") {
      const symbol = cleanSymbol(searchParams.get("symbol"));
      const interval = cleanInterval(searchParams.get("interval"));
      const limit = Math.min(
        Math.max(Number(searchParams.get("limit") || 100), 20),
        500
      );
      const data = await getJson(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      return NextResponse.json(data);
    }

    if (type === "prices") {
      const symbol = cleanSymbol(searchParams.get("symbol"));
      const [spot, futures, btcSpot, btcFutures] = await Promise.all([
        getJson(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`),
        getJson(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`),
        getJson("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
        getJson("https://fapi.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT"),
      ]);

      return NextResponse.json({
        price: Number(futures?.price || spot?.price || 0),
        btcSpot: Number(btcSpot?.price || 0),
        btcFutures: Number(btcFutures?.price || 0),
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
