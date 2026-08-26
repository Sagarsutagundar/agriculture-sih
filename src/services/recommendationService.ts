import { getCrop } from "@/services/cropService";
import type { CropQuote, FarmCrop } from "@/data/types";

export type SmartRecommendation = {
  cropId: string;
  cropName: string;
  bestMarketName: string;
  bestPrice: number;
  closestMarketName: string;
  closestDistanceKm: number;
  highestDemandMarket: string;
  estimatedRevenue: number;
  improvementVsLocal: number;
  reasons: string[];
  unit: "kg" | "quintal";
};

export function buildSmartRecommendation(
  farmCrop: FarmCrop | undefined,
  quote: CropQuote | undefined,
): SmartRecommendation | null {
  if (!farmCrop || !quote) return null;
  const crop = getCrop(farmCrop.cropId);
  if (!crop) return null;

  const ranked = [...quote.markets].sort((a, b) => b.price - a.price);
  const closest = [...quote.markets].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const demandRank = { high: 4, stable: 3, medium: 2, low: 1 };
  const hottest = [...quote.markets].sort(
    (a, b) => demandRank[b.demand] - demandRank[a.demand],
  )[0];
  const best = ranked[0];
  const local = quote.markets.find((market) => market.marketId === "local-market");

  const estimatedRevenue = farmCrop.estimatedYield * best.price;
  const localRevenue = local ? farmCrop.estimatedYield * local.price : estimatedRevenue;

  const reasons: string[] = [];
  reasons.push(`Highest available price at ${best.marketName}`);
  if (hottest.demand === "high") {
    reasons.push(`High demand at ${hottest.marketName}`);
  }
  reasons.push(`Only ${best.distanceKm.toFixed(1)} km away`);
  if (quote.trend === "rising") {
    reasons.push("Price trend is rising");
  }

  return {
    cropId: crop.id,
    cropName: crop.name,
    bestMarketName: best.marketName,
    bestPrice: best.price,
    closestMarketName: closest.marketName,
    closestDistanceKm: closest.distanceKm,
    highestDemandMarket: hottest.marketName,
    estimatedRevenue,
    improvementVsLocal: Math.max(0, estimatedRevenue - localRevenue),
    reasons,
    unit: crop.unit,
  };
}
