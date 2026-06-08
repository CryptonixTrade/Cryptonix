export type EngineDecision = "LONG" | "SHORT" | "NO TRADE";
export type EnginePhase = "FLAT" | "TREND" | "EXPANSION";

export type EngineCandle = {
  time?: number;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
};

export type EngineFlow = {
  buyVolume?: number;
  sellVolume?: number;
};

export type EngineOrderBook = {
  imbalance?: number;
  bidVolume?: number;
  askVolume?: number;
};

export type EngineSignal = {
  score: number;
  decision: EngineDecision;
};

export type AiSignalResult = EngineSignal & {
  confidence: number;
  phase: EnginePhase;
  volatility: number;
  flowScore: number;
  orderBookScore: number;
};

function toFiniteNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeCandles(candles: EngineCandle[]) {
  return candles
    .map((c) => ({
      ...c,
      close: toFiniteNumber(c.close),
      volume: Math.max(0, toFiniteNumber(c.volume)),
    }))
    .filter((c) => c.close > 0);
}

export function clamp(value: number, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function smoothSignalScore(previous: number | null, next: number, alpha = 0.12) {
  if (previous === null) return next;
  return previous * (1 - alpha) + next * alpha;
}

export function decisionFromScore(score: number): EngineDecision {
  if (score > 58) return "LONG";
  if (score < 42) return "SHORT";
  return "NO TRADE";
}

export function calculateEMA(data: number[], period: number) {
  if (!data.length) return 0;

  const k = 2 / (period + 1);
  let ema = data[0];

  for (let i = 1; i < data.length; i += 1) {
    ema = data[i] * k + ema * (1 - k);
  }

  return ema;
}

export function calculateRSI(data: number[], period = 14) {
  if (data.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i += 1) {
    const diff = data[i] - data[i - 1];

    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const rs = gains / (losses || 1);
  return 100 - 100 / (1 + rs);
}

export function detectMarketPhase(closes: number[]): EnginePhase {
  if (closes.length < 60) return "FLAT";

  const short = closes.slice(-20);
  const long = closes.slice(-60);

  const shortRange = Math.max(...short) - Math.min(...short);
  const longRange = Math.max(...long) - Math.min(...long);
  const ratio = shortRange / (longRange || 1);

  if (ratio < 0.3) return "FLAT";
  if (ratio > 0.8) return "EXPANSION";

  return "TREND";
}

export function getSignalTtl(interval: string, volatility: number) {
  let base =
    interval === "1m"
      ? 2
      : interval === "5m"
      ? 8
      : 25;

  if (volatility > 0.001) base *= 0.7;
  if (volatility < 0.0004) base *= 1.3;

  return Math.max(1, Math.round(base));
}

export function calculateTechnicalSignal(candles: EngineCandle[]): EngineSignal | null {
  if (!candles || candles.length < 60) return null;

  const normalized = normalizeCandles(candles);

  if (normalized.length < 60) return null;

  const closes = normalized.map((c) => c.close);
  const volumes = normalized.map((c) => c.volume || 0);
  const lastPrice = closes[closes.length - 1];

  if (!lastPrice) return null;

  const emaFast = calculateEMA(closes.slice(-30), 9);
  const emaSlow = calculateEMA(closes.slice(-60), 21);
  const trend = emaFast > emaSlow ? 1 : -1;
  const trendStrength = Math.abs(emaFast - emaSlow) / lastPrice;

  if (trendStrength < 0.0005) {
    return {
      score: 50,
      decision: "NO TRADE",
    };
  }

  const prev = closes[closes.length - 5];
  const volNow = volumes[volumes.length - 1];

  if (!prev || !volNow) return null;

  const momentum = clamp(((lastPrice - prev) / prev) * 50);
  const volAvg =
    volumes.slice(-10).reduce((sum, value) => sum + value, 0) / 10;
  const volumeScore = volNow > volAvg * 1.5 ? trend : 0;

  const raw = trend * 0.5 + momentum * 0.3 + volumeScore * 0.2;

  if (Math.abs(raw) < 0.2) {
    return {
      score: 50,
      decision: "NO TRADE",
    };
  }

  const score = Math.max(0, Math.min(100, ((raw + 1) / 2) * 100));

  return {
    score,
    decision: score > 60 ? "LONG" : score < 40 ? "SHORT" : "NO TRADE",
  };
}

export function getTimeframeMicrostructure(candles: EngineCandle[]) {
  const recent = candles.slice(-24);

  let buyVolume = 0;
  let sellVolume = 0;

  for (const candle of recent) {
    const volume = Math.max(0, toFiniteNumber(candle.volume));
    const open = toFiniteNumber(candle.open);
    const close = toFiniteNumber(candle.close);

    if (volume <= 0) continue;

    if (close >= open) {
      buyVolume += volume;
    } else {
      sellVolume += volume;
    }
  }

  const totalVolume = buyVolume + sellVolume;
  const imbalance =
    totalVolume > 0 ? (buyVolume - sellVolume) / totalVolume : 0;

  return {
    flow: {
      buyVolume,
      sellVolume,
    },
    orderBook: {
      imbalance,
      bidVolume: buyVolume,
      askVolume: sellVolume,
    },
  };
}

export function calculateAiSignal(input: {
  candles: EngineCandle[];
  flow?: EngineFlow;
  orderBook?: EngineOrderBook;
  techSignal?: EngineSignal | null;
}): AiSignalResult | null {
  const { candles, flow, orderBook, techSignal } = input;

  if (!candles || candles.length < 60) return null;

  const normalized = normalizeCandles(candles);

  if (normalized.length < 60) return null;

  const closes = normalized.map((c) => c.close);
  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 5];

  if (!last || !prev) return null;

  const emaFast = calculateEMA(closes.slice(-30), 9);
  const emaSlow = calculateEMA(closes.slice(-60), 21);
  const higherEMA = calculateEMA(closes.slice(-100), 50);
  const trend = emaFast > emaSlow ? 1 : -1;
  const higherTrend = last > higherEMA ? 1 : -1;
  const momentum = clamp(((last - prev) / prev) * 40);
  const rsi = calculateRSI(closes);
  const rsiScore = rsi > 70 ? -0.6 : rsi < 30 ? 0.6 : 0;
  const buy = Math.max(0, toFiniteNumber(flow?.buyVolume));
  const sell = Math.max(0, toFiniteNumber(flow?.sellVolume));
  const flowScore = buy + sell > 0 ? clamp((buy - sell) / (buy + sell)) : 0;
  const orderBookScore = clamp(toFiniteNumber(orderBook?.imbalance) / 0.35);
  const techScore =
    techSignal?.decision === "LONG"
      ? 1
      : techSignal?.decision === "SHORT"
      ? -1
      : 0;
  const phase = detectMarketPhase(closes);
  const volatility = Math.abs(last - prev) / last;

  let penalty = 1;

  if (trend !== higherTrend) penalty *= 0.7;
  if (Math.abs(flowScore) < 0.1) penalty *= 0.8;
  if (volatility < 0.00025) penalty *= 0.75;
  if (orderBookScore && Math.sign(orderBookScore) !== trend) penalty *= 0.82;
  if (techScore && techScore !== trend) penalty *= 0.78;

  const agreement =
    (trend > 0 && momentum > 0 && flowScore > 0 && orderBookScore >= -0.15) ||
    (trend < 0 && momentum < 0 && flowScore < 0 && orderBookScore <= 0.15);

  if (!agreement) penalty *= 0.7;

  const impulse = Math.abs(last - prev) / prev > 0.0008;

  if (!impulse && phase !== "TREND") penalty *= 0.75;

  const phaseBoost = phase === "FLAT" ? 0.7 : phase === "EXPANSION" ? 1.2 : 1;
  const raw =
    (
      trend * 0.3 +
      momentum * 0.22 +
      flowScore * 0.18 +
      orderBookScore * 0.16 +
      techScore * 0.08 +
      rsiScore * 0.06
    ) *
    phaseBoost *
    penalty;
  const score = Math.max(0, Math.min(100, ((raw + 1) / 2) * 100));
  const decision = decisionFromScore(score);
  const techConfirm =
    (decision === "LONG" && techSignal?.decision === "LONG") ||
    (decision === "SHORT" && techSignal?.decision === "SHORT");
  const directionalFlow = decision === "LONG" ? flowScore : decision === "SHORT" ? -flowScore : 0;
  const directionalBook =
    decision === "LONG" ? orderBookScore : decision === "SHORT" ? -orderBookScore : 0;
  const confidence =
    decision === "NO TRADE"
      ? 0
      : Math.min(
          100,
          Math.abs(score - 50) * 1.1 +
            Math.max(0, directionalFlow) * 18 +
            Math.max(0, directionalBook) * 18 +
            (techConfirm ? 10 : 0) +
            Math.min(volatility * 5000, 12)
        );

  return {
    score,
    decision,
    confidence,
    phase,
    volatility,
    flowScore,
    orderBookScore,
  };
}
