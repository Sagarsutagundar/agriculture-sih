import type {
  CostBreakdownItem,
  CropProfitAnalysis,
  CropQuote,
  FarmCrop,
  PriceUnit,
} from "@/data/types";
import { getCrop } from "./cropService";

/**
 * Agronomic benchmark production costs (INR per acre) by crop category.
 * Calibrated against ICAR / State Agriculture University cost of cultivation datasets.
 */
const BASE_COSTS_PER_ACRE: Record<
  string,
  {
    seeds: number;
    fertilizer: number;
    irrigation: number;
    labor: number;
    pesticides: number;
    transport: number;
    landPrep: number;
  }
> = {
  vegetable: {
    seeds: 6500,
    fertilizer: 8500,
    irrigation: 4000,
    labor: 14000,
    pesticides: 5500,
    transport: 4500,
    landPrep: 5000,
  },
  fruit: {
    seeds: 9000,
    fertilizer: 12000,
    irrigation: 6000,
    labor: 16000,
    pesticides: 8000,
    transport: 7000,
    landPrep: 6000,
  },
  grain: {
    seeds: 2800,
    fertilizer: 4500,
    irrigation: 2500,
    labor: 7000,
    pesticides: 2500,
    transport: 2200,
    landPrep: 3500,
  },
  pulse: {
    seeds: 3200,
    fertilizer: 3800,
    irrigation: 2000,
    labor: 6000,
    pesticides: 2800,
    transport: 2000,
    landPrep: 3000,
  },
  oilseed: {
    seeds: 3500,
    fertilizer: 4200,
    irrigation: 2200,
    labor: 6500,
    pesticides: 3000,
    transport: 2200,
    landPrep: 3200,
  },
  spice: {
    seeds: 7500,
    fertilizer: 9000,
    irrigation: 4500,
    labor: 15000,
    pesticides: 6000,
    transport: 4000,
    landPrep: 4500,
  },
  commercial: {
    seeds: 5000,
    fertilizer: 8000,
    irrigation: 5000,
    labor: 13000,
    pesticides: 5000,
    transport: 5000,
    landPrep: 5500,
  },
};

export type FarmProfitSummary = {
  totalRevenue: number;
  totalCost: number;
  totalNetProfit: number;
  overallMarginPercent: number;
  cropAnalyses: CropProfitAnalysis[];
  topEarningCrop: CropProfitAnalysis | null;
  highestMarginCrop: CropProfitAnalysis | null;
  lastCalculatedAt: number;
  isSimulatedBenchmark: boolean;
};

/**
 * Calculates itemized production costs and net profit for a single farm crop.
 */
export function calculateCropProfit(
  farmCrop: FarmCrop,
  quote?: CropQuote,
): CropProfitAnalysis {
  const meta = getCrop(farmCrop.cropId);
  const cropName = farmCrop.customCropName || meta?.name || "Crop";
  const cropEmoji = meta?.emoji || "🌱";
  const yieldUnit: PriceUnit = meta?.unit || "kg";
  const category = meta?.category || "vegetable";
  const area = Math.max(0.1, farmCrop.areaAcres || 1);

  // Market price per unit
  const marketPrice = quote?.currentPrice ?? meta?.samplePrice ?? 50;

  // Estimated gross revenue
  const estimatedRevenue = Math.round(farmCrop.estimatedYield * marketPrice);

  // Baseline cost lookup
  const costSpec = BASE_COSTS_PER_ACRE[category] || BASE_COSTS_PER_ACRE.vegetable;

  const rawCosts = [
    { category: "Seeds & Nursery", perAcre: costSpec.seeds, icon: "🌱" },
    { category: "Fertilizer & Nutrition", perAcre: costSpec.fertilizer, icon: "🧪" },
    { category: "Irrigation & Power", perAcre: costSpec.irrigation, icon: "💧" },
    { category: "Labor & Field Work", perAcre: costSpec.labor, icon: "👨🏽‍🌾" },
    { category: "Crop Protection & Spray", perAcre: costSpec.pesticides, icon: "🛡️" },
    { category: "Transport & Logistics", perAcre: costSpec.transport, icon: "🚚" },
    { category: "Land Prep & Machinery", perAcre: costSpec.landPrep, icon: "🚜" },
  ];

  const totalCost = Math.round(
    rawCosts.reduce((sum, item) => sum + item.perAcre * area, 0),
  );

  const costBreakdown: CostBreakdownItem[] = rawCosts.map((item) => {
    const amount = Math.round(item.perAcre * area);
    return {
      category: item.category,
      amount,
      perAcre: item.perAcre,
      percentage: totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0,
      icon: item.icon,
    };
  });

  const netProfit = estimatedRevenue - totalCost;
  const profitMarginPercent =
    estimatedRevenue > 0
      ? Number(((netProfit / estimatedRevenue) * 100).toFixed(1))
      : 0;

  const costPerUnit =
    farmCrop.estimatedYield > 0
      ? Math.round(totalCost / farmCrop.estimatedYield)
      : 0;

  const roiPercent =
    totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(1)) : 0;

  return {
    farmCropId: farmCrop.id,
    cropId: farmCrop.cropId,
    cropName,
    cropEmoji,
    variety: farmCrop.variety,
    areaAcres: farmCrop.areaAcres,
    estimatedYield: farmCrop.estimatedYield,
    yieldUnit,
    marketPrice,
    estimatedRevenue,
    totalCost,
    costBreakdown,
    netProfit,
    profitMarginPercent,
    costPerUnit,
    roiPercent,
  };
}

/**
 * Calculates farm-wide consolidated profit summary across all active crops.
 */
export function calculateFarmProfitSummary(
  farmCrops: FarmCrop[],
  quotes: Record<string, CropQuote>,
): FarmProfitSummary {
  const analyses = farmCrops.map((crop) =>
    calculateCropProfit(crop, quotes[crop.cropId]),
  );

  const totalRevenue = analyses.reduce((acc, c) => acc + c.estimatedRevenue, 0);
  const totalCost = analyses.reduce((acc, c) => acc + c.totalCost, 0);
  const totalNetProfit = totalRevenue - totalCost;
  const overallMarginPercent =
    totalRevenue > 0
      ? Number(((totalNetProfit / totalRevenue) * 100).toFixed(1))
      : 0;

  const sortedByProfit = [...analyses].sort((a, b) => b.netProfit - a.netProfit);
  const sortedByMargin = [...analyses].sort(
    (a, b) => b.profitMarginPercent - a.profitMarginPercent,
  );

  return {
    totalRevenue,
    totalCost,
    totalNetProfit,
    overallMarginPercent,
    cropAnalyses: analyses,
    topEarningCrop: sortedByProfit[0] || null,
    highestMarginCrop: sortedByMargin[0] || null,
    lastCalculatedAt: Date.now(),
    isSimulatedBenchmark: true,
  };
}
