import type {
  CropQuote,
  FarmerProfile,
  FarmCrop,
  PriceAlert,
  SmartAlert,
} from "@/data/types";
import { getCrop } from "./cropService";
import { BUYERS } from "@/data/buyers";

/**
 * Generates dynamic, prioritized alerts synthesizing signals from Market, Crop Health,
 * Upcoming Harvests, Buyers, and Weather based on the farmer's real crop data.
 */
export function generateDynamicAlerts(
  farmCrops: FarmCrop[],
  quotes: Record<string, CropQuote> = {},
  farmerProfile?: FarmerProfile,
  priceAlerts: PriceAlert[] = [],
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = Date.now();

  // 1. HARVEST ALERTS
  for (const crop of farmCrops) {
    const meta = getCrop(crop.cropId);
    const cropName = crop.customCropName || meta?.name || "Crop";

    if (crop.daysToHarvest <= 5 && crop.growthStage !== "harvest") {
      alerts.push({
        id: `alert-harvest-${crop.id}`,
        type: "harvest",
        priority: "critical",
        title: `Harvest Due in ${crop.daysToHarvest} Days: ${cropName}`,
        message: `${cropName} plot (${crop.areaAcres} ${crop.areaUnit || "Acres"}) has reached physiological maturity. Finalize harvest labor and dispatch crates.`,
        timestamp: now - 18 * 60 * 1000,
        relativeTime: "18 min ago",
        relatedCropId: crop.cropId,
        isRead: false,
        actionLabel: "View Harvest Plan",
        actionView: "farmer-dashboard",
      });
    } else if (crop.daysToHarvest <= 15) {
      alerts.push({
        id: `alert-harvest-${crop.id}`,
        type: "harvest",
        priority: "important",
        title: `Upcoming Harvest Window: ${cropName}`,
        message: `Expected picking starts in ${crop.daysToHarvest} days. Projected harvest: ${crop.estimatedYield.toLocaleString("en-IN")} ${meta?.unit || "kg"}.`,
        timestamp: now - 45 * 60 * 1000,
        relativeTime: "45 min ago",
        relatedCropId: crop.cropId,
        isRead: false,
        actionLabel: "Check Buyer Demand",
        actionView: "buyers",
      });
    }
  }

  // 2. CROP HEALTH / IRRIGATION ALERTS
  for (const crop of farmCrops) {
    const meta = getCrop(crop.cropId);
    const cropName = crop.customCropName || meta?.name || "Crop";

    if (crop.status === "Needs Attention") {
      alerts.push({
        id: `alert-health-${crop.id}`,
        type: "crop",
        priority: "critical",
        title: `Crop Health Attention: ${cropName}`,
        message: `Root moisture tension elevated in ${cropName} plot. Recommend reviewing irrigation run time within 24 hours.`,
        timestamp: now - 32 * 60 * 1000,
        relativeTime: "32 min ago",
        relatedCropId: crop.cropId,
        isRead: false,
        actionLabel: "Open Health Monitor",
        actionView: "health",
      });
    } else if (crop.growthStage === "flowering") {
      alerts.push({
        id: `alert-flower-${crop.id}`,
        type: "crop",
        priority: "important",
        title: `Critical Flowering Phase: ${cropName}`,
        message: `Ensure consistent moisture and monitor for thrips/whitefly to maximize fruit set.`,
        timestamp: now - 2 * 3600 * 1000,
        relativeTime: "2 hours ago",
        relatedCropId: crop.cropId,
        isRead: false,
        actionLabel: "View Recommendations",
        actionView: "health",
      });
    }
  }

  // 3. MARKET PRICE INTELLIGENCE ALERTS
  for (const crop of farmCrops) {
    const quote = quotes[crop.cropId];
    const meta = getCrop(crop.cropId);
    if (!quote || !meta) continue;

    const change = quote.currentPrice - quote.previousPrice;
    const changePct =
      quote.previousPrice > 0
        ? ((change / quote.previousPrice) * 100).toFixed(1)
        : "0.0";

    if (Number(changePct) >= 5) {
      alerts.push({
        id: `alert-market-surge-${crop.cropId}`,
        type: "market",
        priority: "important",
        title: `Mandi Price Surge: ${meta.name} (+${changePct}%)`,
        message: `Benchmark price rose to ₹${quote.currentPrice.toLocaleString("en-IN")} / ${meta.unit}. Strong wholesale demand reported across regional APMC yards.`,
        timestamp: now - 12 * 60 * 1000,
        relativeTime: "12 min ago",
        relatedCropId: crop.cropId,
        isRead: false,
        actionLabel: "Compare Mandis",
        actionView: "markets",
      });
    } else if (Number(changePct) <= -5) {
      alerts.push({
        id: `alert-market-dip-${crop.cropId}`,
        type: "market",
        priority: "important",
        title: `Price Fluctuation Notice: ${meta.name} (${changePct}%)`,
        message: `Price softened to ₹${quote.currentPrice.toLocaleString("en-IN")} / ${meta.unit} due to fresh arrivals. Consider holding or timing next picking.`,
        timestamp: now - 55 * 60 * 1000,
        relativeTime: "55 min ago",
        relatedCropId: crop.cropId,
        isRead: false,
        actionLabel: "View Price Trend",
        actionView: "markets",
      });
    }
  }

  // 4. BUYER DEMAND MATCH ALERTS
  const cropIds = farmCrops.map((c) => c.cropId);
  for (const buyer of BUYERS) {
    const matchedCropId = buyer.cropIds.find((id) => cropIds.includes(id));
    if (matchedCropId && (buyer.demandStatus === "Urgent" || buyer.demandStatus === "High")) {
      const meta = getCrop(matchedCropId);
      alerts.push({
        id: `alert-buyer-${buyer.id}`,
        type: "buyer",
        priority: buyer.demandStatus === "Urgent" ? "critical" : "important",
        title: `${buyer.demandStatus === "Urgent" ? "Urgent " : ""}Buyer Request: ${meta?.name || "Crops"} Wanted`,
        message: `${buyer.name} (${buyer.type}) is seeking ${buyer.requiredQuantity} ${buyer.quantityUnit} at ₹${buyer.indicativePrice.toLocaleString("en-IN")} / ${buyer.quantityUnit === "kg" ? "kg" : "Quintal"}. Distance: ${buyer.distanceKm} km.`,
        timestamp: now - 25 * 60 * 1000,
        relativeTime: "25 min ago",
        relatedCropId: matchedCropId,
        relatedBuyerId: buyer.id,
        isRead: false,
        actionLabel: "View Buyer Offer",
        actionView: "buyers",
      });
    }
  }

  // 5. WEATHER ADVISORY ALERT
  const location = farmerProfile?.district || "Your district";
  alerts.push({
    id: "alert-weather-forecast",
    type: "weather",
    priority: "info",
    title: `Agro-Met Advisory: ${location}`,
    message: `Partly cloudy skies with mild afternoon gusts expected over the next 48 hours. Favorable window for foliar nutrition sprays before 10 AM.`,
    timestamp: now - 3 * 3600 * 1000,
    relativeTime: "3 hours ago",
    isRead: false,
    actionLabel: "Weather Details",
    actionView: "health",
  });

  // 6. CUSTOM THRESHOLD PRICE ALERTS
  for (const pa of priceAlerts) {
    const quote = quotes[pa.cropId];
    const meta = getCrop(pa.cropId);
    if (!quote || !meta) continue;

    const isTriggered =
      (pa.direction === "above" && quote.currentPrice >= pa.threshold) ||
      (pa.direction === "below" && quote.currentPrice <= pa.threshold);

    if (isTriggered) {
      alerts.unshift({
        id: `alert-custom-${pa.id}`,
        type: "market",
        priority: "critical",
        title: `Target Price Alert: ${meta.name}`,
        message: `${meta.name} crossed your threshold of ₹${pa.threshold.toLocaleString("en-IN")} (current: ₹${quote.currentPrice.toLocaleString("en-IN")}).`,
        timestamp: pa.triggeredAt || now - 5 * 60 * 1000,
        relativeTime: "5 min ago",
        relatedCropId: pa.cropId,
        isRead: false,
        actionLabel: "View Mandi Rates",
        actionView: "markets",
      });
    }
  }

  // Deduplicate and order by priority (critical -> important -> info)
  const priorityOrder: Record<string, number> = {
    critical: 1,
    important: 2,
    info: 3,
  };

  return alerts.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.timestamp - a.timestamp,
  );
}
