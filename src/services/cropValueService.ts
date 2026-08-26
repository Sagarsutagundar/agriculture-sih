import type { CropQuote, FarmCrop, PriceUnit } from "@/data/types";
import { getCrop } from "./cropService";

export type CropValueBreakdown = {
  farmCropId: string;
  cropId: string;
  cropName: string;
  cropEmoji: string;
  variety?: string;
  areaAcres: number;
  areaUnit: string;
  estimatedYield: number;
  yieldUnit: PriceUnit;
  marketPrice: number;
  previousPrice: number;
  totalValue: number;
  previousTotalValue: number;
  valueDelta: number;
  priceSource: string;
  isLive: boolean;
  lastUpdated: number;
  status: string;
};

export type FarmValueSummary = {
  totalValue: number;
  previousTotalValue: number;
  valueDelta: number;
  cropBreakdowns: CropValueBreakdown[];
  highestValueCrop: CropValueBreakdown | null;
  lastUpdated: number;
  isSimulatedBenchmark: boolean;
  dataSourceLabel: string;
};

/**
 * Calculates dynamic value for an individual farm crop:
 * Value = Estimated Total Yield × Current Market Unit Price
 * (Yield is already quantified based on cultivated area and agronomic expectations)
 */
export function calculateCropValue(
  farmCrop: FarmCrop,
  quote?: CropQuote,
  isLiveGovernmentData = false,
): CropValueBreakdown {
  const meta = getCrop(farmCrop.cropId);
  const cropName = farmCrop.customCropName || meta?.name || "Unknown Crop";
  const cropEmoji = meta?.emoji || "🌱";
  const unit: PriceUnit = meta?.unit || "kg";
  const areaUnit = farmCrop.areaUnit || "acres";

  const marketPrice = quote?.currentPrice ?? meta?.samplePrice ?? 0;
  const previousPrice = quote?.previousPrice ?? marketPrice;

  const totalValue = Math.round(farmCrop.estimatedYield * marketPrice);
  const previousTotalValue = Math.round(farmCrop.estimatedYield * previousPrice);
  const valueDelta = totalValue - previousTotalValue;

  const priceSource = isLiveGovernmentData
    ? "Agmarknet / e-NAM Live API"
    : "APMC Market Benchmark (Simulated Demo)";

  return {
    farmCropId: farmCrop.id,
    cropId: farmCrop.cropId,
    cropName,
    cropEmoji,
    variety: farmCrop.variety,
    areaAcres: farmCrop.areaAcres,
    areaUnit,
    estimatedYield: farmCrop.estimatedYield,
    yieldUnit: unit,
    marketPrice,
    previousPrice,
    totalValue,
    previousTotalValue,
    valueDelta,
    priceSource,
    isLive: isLiveGovernmentData,
    lastUpdated: quote?.lastUpdated ?? Date.now(),
    status: farmCrop.status || "Growing",
  };
}

/**
 * Calculates farm-wide aggregated crop value with dynamic breakdowns.
 * Suitable for connecting directly to live APMC / e-NAM / backend APIs.
 */
export function calculateFarmValueSummary(
  farmCrops: FarmCrop[],
  quotes: Record<string, CropQuote>,
  isLiveGovernmentData = false,
): FarmValueSummary {
  const breakdowns = farmCrops.map((fc) =>
    calculateCropValue(fc, quotes[fc.cropId], isLiveGovernmentData),
  );

  const totalValue = breakdowns.reduce((sum, item) => sum + item.totalValue, 0);
  const previousTotalValue = breakdowns.reduce(
    (sum, item) => sum + item.previousTotalValue,
    0,
  );
  const valueDelta = totalValue - previousTotalValue;

  let highestValueCrop: CropValueBreakdown | null = null;
  for (const b of breakdowns) {
    if (!highestValueCrop || b.totalValue > highestValueCrop.totalValue) {
      highestValueCrop = b;
    }
  }

  const latestQuoteTime = Object.values(quotes).reduce(
    (max, q) => Math.max(max, q.lastUpdated),
    Date.now(),
  );

  return {
    totalValue,
    previousTotalValue,
    valueDelta,
    cropBreakdowns: breakdowns,
    highestValueCrop,
    lastUpdated: latestQuoteTime,
    isSimulatedBenchmark: !isLiveGovernmentData,
    dataSourceLabel: isLiveGovernmentData
      ? "Live Government APMC Mandi Data"
      : "Simulated APMC Benchmark Rates",
  };
}
