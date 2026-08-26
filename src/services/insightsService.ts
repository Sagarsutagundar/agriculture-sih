import { getCrop } from "@/services/cropService";
import type { CropQuote, FarmCrop } from "@/data/types";
import { formatINR, formatPercent } from "@/lib/format";

export type Insight = {
  id: string;
  text: string;
  tone: "up" | "down" | "neutral";
};

export function buildInsights(
  farmCrops: FarmCrop[],
  quotes: Record<string, CropQuote>,
  previousValues: Record<string, number>,
  totalAreaAcres: number,
) {
  const insights: Insight[] = [];

  for (const farmCrop of farmCrops) {
    const crop = getCrop(farmCrop.cropId);
    const quote = quotes[farmCrop.cropId];
    if (!crop || !quote) continue;

    const change = quote.currentPrice - quote.previousPrice;
    const changePercent =
      quote.previousPrice === 0 ? 0 : (change / quote.previousPrice) * 100;

    if (Math.abs(changePercent) >= 1) {
      insights.push({
        id: `price-${crop.id}`,
        text: `${crop.emoji} ${crop.name} price ${
          change > 0 ? "increased" : "decreased"
        } by ${formatPercent(Math.abs(changePercent))} in the latest update.`,
        tone: change > 0 ? "up" : "down",
      });
    }

    if (quote.demand === "high") {
      insights.push({
        id: `demand-${crop.id}`,
        text: `${crop.emoji} ${crop.name} currently has high demand.`,
        tone: "up",
      });
    }

    if (quote.trend === "stable") {
      insights.push({
        id: `stable-${crop.id}`,
        text: `${crop.emoji} ${crop.name} has stable prices.`,
        tone: "neutral",
      });
    }

    if (farmCrop.daysToHarvest > 0 && farmCrop.daysToHarvest <= 21) {
      insights.push({
        id: `harvest-${crop.id}`,
        text: `⏳ ${crop.name} will be ready for harvest in ${farmCrop.daysToHarvest} days.`,
        tone: "neutral",
      });
    }

    const currentValue = farmCrop.estimatedYield * quote.currentPrice;
    const previousValue = previousValues[farmCrop.id];
    if (previousValue && Math.abs(currentValue - previousValue) >= 1) {
      const delta = currentValue - previousValue;
      insights.push({
        id: `value-${farmCrop.id}`,
        text: `💰 Your estimated farm value ${
          delta > 0 ? "increased" : "decreased"
        } by ${formatINR(Math.abs(delta))} because ${crop.name} market prices ${
          delta > 0 ? "increased" : "decreased"
        }.`,
        tone: delta > 0 ? "up" : "down",
      });
    }
  }

  if (totalAreaAcres > 0) {
    const cultivated = farmCrops.reduce((sum, crop) => sum + crop.areaAcres, 0);
    const ratio = Math.min(100, Math.round((cultivated / totalAreaAcres) * 100));
    insights.push({
      id: "cultivation",
      text: `🌱 Your farm is currently ${ratio}% under cultivation.`,
      tone: "neutral",
    });
  }

  const unique = new Map<string, Insight>();
  for (const insight of insights) unique.set(insight.id, insight);
  return [...unique.values()].slice(0, 8);
}
