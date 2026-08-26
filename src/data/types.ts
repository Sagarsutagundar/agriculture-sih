export type CropCategory =
  | "vegetables"
  | "fruits"
  | "grains"
  | "pulses"
  | "oilseeds"
  | "spices"
  | "commercial";

export type PriceUnit = "kg" | "quintal";

export type DemandLevel = "low" | "medium" | "high" | "stable";

export type GrowthStage =
  | "seedling"
  | "sowing"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "maturity"
  | "harvest";

export type FarmingType = "organic" | "conventional" | "mixed" | "other";

export type IrrigationType =
  | "drip"
  | "sprinkler"
  | "canal"
  | "rain-fed"
  | "borewell"
  | "other";

export type SoilType =
  | "loamy"
  | "sandy"
  | "clay"
  | "black"
  | "red"
  | "alluvial"
  | "other";

export type FarmerProfile = {
  name: string;
  phone: string;
  email: string;
  state: string;
  district: string;
  location: string;
  farmSizeAcres: number;
  farmingType: FarmingType;
  irrigationType: IrrigationType;
  soilType: SoilType;
};

export type PriceTrend = "rising" | "falling" | "stable";

export type Crop = {
  id: string;
  name: string;
  emoji: string;
  category: CropCategory;
  image: string;
  unit: PriceUnit;
  averageGrowthDays: { min: number; max: number };
  harvestStage: string;
  samplePrice: number;
  searchTerms: string[];
};

export type Market = {
  id: string;
  name: string;
  distanceKm: number;
  type: "apmc" | "local" | "city";
};

export type MarketQuote = {
  cropId: string;
  marketId: string;
  marketName: string;
  distanceKm: number;
  price: number;
  previousPrice: number;
  demand: DemandLevel;
  lastUpdated: number;
};

export type CropQuote = {
  cropId: string;
  currentPrice: number;
  previousPrice: number;
  unit: PriceUnit;
  demand: DemandLevel;
  trend: PriceTrend;
  primaryMarketId: string;
  lastUpdated: number;
  markets: MarketQuote[];
  history7d: PricePoint[];
  history30d: PricePoint[];
  history90d: PricePoint[];
};

export type PricePoint = {
  timestamp: number;
  price: number;
  label: string;
};

export type FarmCrop = {
  id: string;
  cropId: string;
  areaAcres: number;
  estimatedYield: number;
  growthStage: GrowthStage;
  daysToHarvest: number;
  notes?: string;
  // Extended fields added by Farmer Dashboard module
  variety?: string;
  sowingDate?: string;       // ISO date string e.g. "2024-06-15"
  expectedHarvestDate?: string; // ISO date string
  statusNote?: string;
};

export type PriceAlert = {
  id: string;
  cropId: string;
  direction: "above" | "below";
  threshold: number;
  createdAt: number;
  triggeredAt?: number;
};

export type Buyer = {
  id: string;
  name: string;
  type: string;
  cropIds: string[];
  offerNote: string;
  distanceKm: number;
};

export type DataSourceMode = "demo" | "live";

export type MarketProviderKind = "demo" | "api" | "websocket";
