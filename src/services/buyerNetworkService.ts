import type { Buyer, BuyerMatch, CropQuote, FarmCrop } from "@/data/types";
import { BUYERS } from "@/data/buyers";
import { getCrop } from "./cropService";

/**
 * Matches buyers against the farmer's active farm crops and projected harvest yields.
 */
export function findBuyerMatches(
  farmCrops: FarmCrop[],
  buyers: Buyer[] = BUYERS,
  quotes: Record<string, CropQuote> = {},
): BuyerMatch[] {
  const matches: BuyerMatch[] = [];

  for (const farmCrop of farmCrops) {
    const meta = getCrop(farmCrop.cropId);
    if (!meta) continue;

    // Convert estimated yield into tons for comparison if needed
    // standard yield is in kg: 1000 kg = 1 ton
    const farmerYieldTons = farmCrop.estimatedYield / 1000;
    const cropName = farmCrop.customCropName || meta.name;
    const cropEmoji = meta.emoji;

    for (const buyer of buyers) {
      if (buyer.cropIds.includes(farmCrop.cropId)) {
        // Calculate match percentage based on quantity fit, distance, and buyer rating
        let matchScore = 70;

        const buyerTons =
          buyer.quantityUnit === "kg"
            ? buyer.requiredQuantity / 1000
            : buyer.requiredQuantity;

        let quantityFit = "Partial Match";
        let reason = "";

        const ratio = farmerYieldTons > 0 ? buyerTons / farmerYieldTons : 1;

        if (ratio >= 0.7 && ratio <= 1.5) {
          matchScore += 20;
          quantityFit = "Perfect Volume Match";
          reason = `Buyer requirement (${buyer.requiredQuantity} ${buyer.quantityUnit}) closely matches your estimated harvest (${farmerYieldTons.toFixed(1)} Tons).`;
        } else if (ratio > 1.5) {
          matchScore += 12;
          quantityFit = "Bulk Buyer";
          reason = `Large institutional buyer can absorb your entire harvest lot of ${farmerYieldTons.toFixed(1)} Tons immediately.`;
        } else {
          matchScore += 10;
          quantityFit = "Partial Lot";
          reason = `Buyer seeks quick delivery of a portion (${buyer.requiredQuantity} ${buyer.quantityUnit}) of your harvest.`;
        }

        // Distance bonus
        if (buyer.distanceKm <= 10) {
          matchScore += 8;
          reason += ` Very close to your farm (${buyer.distanceKm} km). Low transport expense.`;
        } else if (buyer.distanceKm <= 20) {
          matchScore += 4;
        }

        // Indicative price vs current market price
        const currentQuote = quotes[farmCrop.cropId];
        const benchmarkPrice = currentQuote?.currentPrice ?? meta.samplePrice;
        if (buyer.indicativePrice >= benchmarkPrice) {
          matchScore += 5;
          reason += ` Offering competitive rate of ₹${buyer.indicativePrice.toLocaleString("en-IN")}.`;
        }

        const clampedScore = Math.min(98, Math.max(55, matchScore));

        // Potential contract value
        const contractYield = Math.min(
          farmCrop.estimatedYield,
          buyer.quantityUnit === "kg"
            ? buyer.requiredQuantity
            : buyer.requiredQuantity * 1000,
        );
        const potentialValue = Math.round(contractYield * (buyer.indicativePrice / 100)); // normalized

        matches.push({
          buyer,
          matchedCropId: farmCrop.cropId,
          matchedCropName: cropName,
          matchedCropEmoji: cropEmoji,
          matchPercentage: clampedScore,
          matchReason: reason,
          potentialValue: Math.round(farmCrop.estimatedYield * (buyer.indicativePrice / (meta.unit === "quintal" ? 100 : 1))),
          quantityFit,
        });
      }
    }
  }

  // Sort by highest match percentage
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Filter buyers by search query, crop category, and distance.
 */
export function filterBuyers(
  buyers: Buyer[],
  query: string,
  cropFilter: string = "all",
): Buyer[] {
  let result = buyers;

  if (cropFilter !== "all") {
    result = result.filter((b) => b.cropIds.includes(cropFilter));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.offerNote.toLowerCase().includes(q),
    );
  }

  return result;
}
