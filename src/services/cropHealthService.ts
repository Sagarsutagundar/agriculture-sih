import type {
  CropHealthDiagnostic,
  CropHealthIssue,
  CropHealthRecommendation,
  CropHealthStatus,
  FarmCrop,
  GrowthStage,
} from "@/data/types";
import { getCrop } from "./cropService";

/**
 * Diagnostic rule engine simulating agricultural scouting benchmarks.
 * Designed to connect directly to computer vision / sensor telemetry APIs.
 */
export function assessCropHealth(farmCrop: FarmCrop): CropHealthDiagnostic {
  const meta = getCrop(farmCrop.cropId);
  const cropName = farmCrop.customCropName || meta?.name || "Crop";
  const cropEmoji = meta?.emoji || "🌱";
  const stage = farmCrop.growthStage;
  const rawStatus = farmCrop.status || "Healthy";

  // Derive health score and diagnostic profile based on current status and stage
  let healthScore = 92;
  let status: CropHealthStatus = "Healthy";
  let summary = "Crop vigor is normal. Foliage and stem development are within optimal benchmarks.";
  const issues: CropHealthIssue[] = [];
  const recommendations: CropHealthRecommendation[] = [];

  const now = new Date();
  const timeString = `Today, ${now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;

  let soilMoisture = "Optimal (65–70%)";
  let pestPressure = "Low / Negligible";
  const weatherImpact = "Favorable sunshine & humidity";

  if (rawStatus === "Needs Attention" || stage === "flowering") {
    healthScore = 74;
    status = "Needs Attention";
    summary = "Minor moisture variance observed in root zone. Soil drying faster due to recent temperature spike.";
    soilMoisture = "Slightly Low (48%)";
    pestPressure = "Moderate (early whitefly/thrips observed)";

    issues.push({
      id: "issue-water-stress",
      title: "Potential Water Stress in Upper Root Layer",
      riskLevel: "medium",
      description:
        "Tensiometer reading indicates soil tension rising. Leaves may show midday wilting during peak sunlight.",
      detectedAt: "3 hours ago",
    });
    issues.push({
      id: "issue-nutrient-uptake",
      title: "Boron / Micronutrient Uptake Watch",
      riskLevel: "low",
      description:
        "Flowering stage requires consistent calcium-boron availability to ensure fruit set.",
      detectedAt: "Yesterday",
    });

    recommendations.push({
      id: "rec-irrigation",
      action: "Review Drip Irrigation Cycle",
      urgency: "Within 24h",
      detail:
        "Increase drip run time by 25–30 minutes in the early morning to restore root moisture.",
      impact: "Prevents blossom end rot and flower drop.",
    });
    recommendations.push({
      id: "rec-foliar-spray",
      action: "Apply Preventive Bio-Neem Spray",
      urgency: "Within 24h",
      detail:
        "Spray 1500 PPM cold-pressed neem oil (3 ml/L) during evening hours to suppress sap-sucking nymphs.",
      impact: "Suppresses pest population before crossing economic threshold.",
    });
  } else if (rawStatus === "Harvested") {
    healthScore = 100;
    status = "Harvested";
    summary = "Plot has been successfully harvested and is currently resting or prepared for next sowing.";
    soilMoisture = "Normal";
    pestPressure = "None";

    recommendations.push({
      id: "rec-post-harvest",
      action: "Post-Harvest Soil Conditioning",
      urgency: "Routine",
      detail:
        "Incorporate organic compost or green manure (Dhaincha/Sunhemp) before next crop rotation.",
      impact: "Replenishes organic carbon and nitrogen reserves.",
    });
  } else if (farmCrop.daysToHarvest <= 7 || stage === "harvest") {
    healthScore = 96;
    status = "Ready for Harvest";
    summary = "Crop has attained physiological maturity. Color break and fruit firmness meet market standards.";
    soilMoisture = "Withholding water for hardening";
    pestPressure = "Controlled";

    recommendations.push({
      id: "rec-harvest-schedule",
      action: "Schedule Harvest Labor & Crates",
      urgency: "Immediate",
      detail:
        "Begin harvesting during cool morning hours. Avoid midday picking to minimize field heat loss.",
      impact: "Extends shelf-life by 48–72 hours at APMC mandi.",
    });
  } else {
    // Default Healthy
    healthScore = 94;
    status = "Healthy";
    summary = "No pathological symptoms or nutrient deficiencies detected. Vegetative canopy density is optimal.";

    recommendations.push({
      id: "rec-routine-scouting",
      action: "Routine Field Walk & Sticky Traps",
      urgency: "Routine",
      detail:
        "Maintain yellow/blue sticky cards at 1 per 0.5 acre to monitor sucking pest dynamics.",
      impact: "Early detection prevents costly blanket pesticide sprays.",
    });
  }

  // If user entered custom notes, integrate as detected observation
  if (farmCrop.notes && farmCrop.notes.trim()) {
    issues.unshift({
      id: "issue-farmer-note",
      title: "Farmer Field Observation",
      riskLevel: "low",
      description: farmCrop.notes,
      detectedAt: "Recorded in Farm Log",
    });
  }

  return {
    farmCropId: farmCrop.id,
    cropId: farmCrop.cropId,
    cropName,
    cropEmoji,
    healthScore,
    status,
    growthStage: farmCrop.growthStage,
    lastInspection: timeString,
    summary,
    issues,
    recommendations,
    soilMoisture,
    pestPressure,
    weatherImpact,
  };
}

/**
 * Assesses health diagnostics for all crops on the farm.
 */
export function assessAllFarmCrops(farmCrops: FarmCrop[]): CropHealthDiagnostic[] {
  return farmCrops.map(assessCropHealth);
}
