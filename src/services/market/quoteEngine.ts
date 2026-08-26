import { CROPS } from "@/data/crops";
import { MARKETS } from "@/data/markets";
import type {
  CropQuote,
  DemandLevel,
  MarketQuote,
  PricePoint,
  PriceTrend,
} from "@/data/types";

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seeded(seed: number) {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function demandFromScore(score: number): DemandLevel {
  if (score > 0.72) return "high";
  if (score < 0.28) return "low";
  if (score > 0.45 && score < 0.55) return "stable";
  return "medium";
}

function trendFromChange(changePercent: number): PriceTrend {
  if (changePercent >= 1.2) return "rising";
  if (changePercent <= -1.2) return "falling";
  return "stable";
}

function buildHistory(
  basePrice: number,
  days: number,
  rand: () => number,
  now: number,
): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * (0.9 + rand() * 0.12);
  for (let i = days - 1; i >= 0; i -= 1) {
    price = Math.max(basePrice * 0.7, price * (0.985 + rand() * 0.03));
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const date = new Date(timestamp);
    points.push({
      timestamp,
      price: Math.round(price * 100) / 100,
      label:
        days <= 7
          ? date.toLocaleDateString("en-IN", { weekday: "short" })
          : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    });
  }
  points[points.length - 1].price = basePrice;
  return points;
}

export function createInitialQuotes(now = Date.now()): Record<string, CropQuote> {
  const quotes: Record<string, CropQuote> = {};

  for (const crop of CROPS) {
    const rand = seeded(hashString(crop.id));
    const currentPrice =
      Math.round(crop.samplePrice * (0.96 + rand() * 0.08) * 100) / 100;
    const previousPrice =
      Math.round(currentPrice * (0.92 + rand() * 0.12) * 100) / 100;

    const markets: MarketQuote[] = MARKETS.map((market, index) => {
      const offset = 0.94 + ((index * 0.03 + rand() * 0.04) % 0.12);
      const price = Math.round(currentPrice * offset * 100) / 100;
      return {
        cropId: crop.id,
        marketId: market.id,
        marketName: market.name,
        distanceKm: market.distanceKm,
        price,
        previousPrice: Math.round(price * (0.94 + rand() * 0.08) * 100) / 100,
        demand: demandFromScore(rand()),
        lastUpdated: now,
      };
    });

    const primary = [...markets].sort((a, b) => b.price - a.price)[0];
    const changePercent =
      ((currentPrice - previousPrice) / previousPrice) * 100;

    quotes[crop.id] = {
      cropId: crop.id,
      currentPrice,
      previousPrice,
      unit: crop.unit,
      demand: demandFromScore(rand()),
      trend: trendFromChange(changePercent),
      primaryMarketId: primary.marketId,
      lastUpdated: now,
      markets,
      history7d: buildHistory(currentPrice, 7, rand, now),
      history30d: buildHistory(currentPrice, 30, rand, now),
      history90d: buildHistory(currentPrice, 90, rand, now),
    };
  }

  return quotes;
}

export function applyQuoteTick(
  quotes: Record<string, CropQuote>,
  cropIds?: string[],
) {
  const next: Record<string, CropQuote> = { ...quotes };
  const ids =
    cropIds ??
    Object.keys(quotes).filter(() => Math.random() > 0.72);

  const targets = ids.length > 0 ? ids : Object.keys(quotes).slice(0, 4);
  const now = Date.now();

  for (const cropId of targets) {
    const quote = next[cropId];
    if (!quote) continue;

    const delta = 0.97 + Math.random() * 0.07;
    const newPrice = Math.round(quote.currentPrice * delta * 100) / 100;
    const previousPrice = quote.currentPrice;
    const changePercent = ((newPrice - previousPrice) / previousPrice) * 100;

    const markets = quote.markets.map((market) => {
      const marketDelta = 0.985 + Math.random() * 0.03;
      const price = Math.round(market.price * marketDelta * 100) / 100;
      return {
        ...market,
        previousPrice: market.price,
        price,
        lastUpdated: now,
        demand:
          Math.random() > 0.85
            ? (["low", "medium", "high", "stable"] as DemandLevel[])[
                Math.floor(Math.random() * 4)
              ]
            : market.demand,
      };
    });

    const updateHistory = (points: PricePoint[]) => {
      const copy = points.map((point) => ({ ...point }));
      copy[copy.length - 1] = {
        ...copy[copy.length - 1],
        price: newPrice,
        timestamp: now,
      };
      return copy;
    };

    const primary = [...markets].sort((a, b) => b.price - a.price)[0];

    next[cropId] = {
      ...quote,
      previousPrice,
      currentPrice: newPrice,
      trend: trendFromChange(changePercent),
      lastUpdated: now,
      markets,
      primaryMarketId: primary.marketId,
      history7d: updateHistory(quote.history7d),
      history30d: updateHistory(quote.history30d),
      history90d: updateHistory(quote.history90d),
    };
  }

  return { quotes: next, changedIds: targets };
}
