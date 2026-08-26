import { CROP_CATEGORIES } from "@/data/categories";
import { CROPS, CROPS_BY_ID } from "@/data/crops";
import type { Crop, CropCategory } from "@/data/types";

export function getCrop(cropId: string) {
  return CROPS_BY_ID[cropId];
}

export function getCropsByCategory(category?: CropCategory | "all") {
  if (!category || category === "all") return CROPS;
  return CROPS.filter((crop) => crop.category === category);
}

export function searchCrops(query: string, category?: CropCategory | "all") {
  const normalized = query.trim().toLowerCase();
  const pool = getCropsByCategory(category);
  if (!normalized) return pool;

  return pool.filter((crop) =>
    crop.searchTerms.some((term) => term.includes(normalized)),
  );
}

export function categoryMeta(category: Crop["category"]) {
  return CROP_CATEGORIES.find((item) => item.id === category);
}

export function growthDurationLabel(crop: Crop) {
  return `${crop.averageGrowthDays.min}–${crop.averageGrowthDays.max} days`;
}
