export const TIMEFRAMES = [
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
] as const;

export const PRIMARY_TIMEFRAMES = new Set([
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
]);

export const MARKET_QUOTES = [
  "USDT",
  "FDUSD",
  "USDC",
  "BUSD",
  "BTC",
  "ETH",
  "BNB",
] as const;

export const QUOTE_ASSETS = [
  "FDUSD",
  "USDC",
  "BUSD",
  "TUSD",
  "USDT",
  "BIDR",
  "IDRT",
  "AEUR",
  "DAI",
  "BTC",
  "ETH",
  "BNB",
  "USD",
  "IDR",
  "JPY",
  "NGN",
  "ARS",
  "COP",
  "TRY",
  "EUR",
  "BRL",
  "GBP",
  "AUD",
  "RUB",
  "UAH",
  "PLN",
  "RON",
  "ZAR",
] as const;

export type Timeframe = (typeof TIMEFRAMES)[number];

export function getQuoteAsset(
  symbol: string,
  quotes: readonly string[] = MARKET_QUOTES
) {
  const upper = String(symbol || "").toUpperCase();

  return quotes.find(
    (quote) => upper.endsWith(quote) && upper.length > quote.length
  );
}

export function getBaseAsset(symbol: string) {
  const upper = String(symbol || "").toUpperCase();
  const quote = getQuoteAsset(upper, QUOTE_ASSETS);

  return quote ? upper.slice(0, -quote.length) : upper;
}

export function isSupportedMarket(symbol: string) {
  return Boolean(getQuoteAsset(symbol));
}
