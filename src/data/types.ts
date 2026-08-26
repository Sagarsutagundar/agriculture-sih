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
  | "sowing"
  | "germination"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "maturity"
  | "harvest"
  | "seedling";

export type CropHealthStatus =
  | "Growing"
  | "Healthy"
  | "Needs Attention"
  | "Ready for Harvest"
  | "Harvested";

export type AreaUnit = "acres" | "hectares" | "bigha" | "guntha";

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
  avatar?: string;
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
  areaUnit?: AreaUnit;
  estimatedYield: number;
  growthStage: GrowthStage;
  daysToHarvest: number;
  status?: CropHealthStatus;
  notes?: string;
  // Extended fields added by Farmer Dashboard module
  variety?: string;
  customCropName?: string;
  customImage?: string;
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

export type CostBreakdownItem = {
  category: string;
  amount: number;
  perAcre: number;
  percentage: number;
  icon: string;
};

export type CropProfitAnalysis = {
  farmCropId: string;
  cropId: string;
  cropName: string;
  cropEmoji: string;
  variety?: string;
  areaAcres: number;
  estimatedYield: number;
  yieldUnit: PriceUnit;
  marketPrice: number;
  estimatedRevenue: number;
  totalCost: number;
  costBreakdown: CostBreakdownItem[];
  netProfit: number;
  profitMarginPercent: number;
  costPerUnit: number;
  roiPercent: number;
};

export type CropHealthRiskLevel = "low" | "medium" | "high" | "critical";

export type CropHealthIssue = {
  id: string;
  title: string;
  riskLevel: CropHealthRiskLevel;
  description: string;
  detectedAt: string;
};

export type CropHealthRecommendation = {
  id: string;
  action: string;
  urgency: "Immediate" | "Within 24h" | "Routine";
  detail: string;
  impact: string;
};

export type CropHealthDiagnostic = {
  farmCropId: string;
  cropId: string;
  cropName: string;
  cropEmoji: string;
  healthScore: number; // 0 to 100
  status: CropHealthStatus;
  growthStage: GrowthStage;
  lastInspection: string;
  summary: string;
  issues: CropHealthIssue[];
  recommendations: CropHealthRecommendation[];
  soilMoisture: string;
  pestPressure: string;
  weatherImpact: string;
};

export type Buyer = {
  id: string;
  name: string;
  type: string;
  cropIds: string[];
  offerNote: string;
  distanceKm: number;
  requiredQuantity: number;
  quantityUnit: string;
  location: string;
  indicativePrice: number;
  demandStatus: "High" | "Steady" | "Urgent";
  postedDate: string;
  verified: boolean;
  rating: number;
};

export type BuyerMatch = {
  buyer: Buyer;
  matchedCropId: string;
  matchedCropName: string;
  matchedCropEmoji: string;
  matchPercentage: number;
  matchReason: string;
  potentialValue: number;
  quantityFit: string;
};

export type AlertPriority = "critical" | "important" | "info";

export type AlertType = "market" | "crop" | "harvest" | "buyer" | "weather";

export type SmartAlert = {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  timestamp: number;
  relativeTime: string;
  relatedCropId?: string;
  relatedMarketId?: string;
  relatedBuyerId?: string;
  isRead: boolean;
  actionLabel?: string;
  actionView?: string;
};

export type WatchlistState = {
  cropIds: string[];
  marketIds: string[];
  buyerIds: string[];
};

export type DataSourceMode = "demo" | "live";

export type MarketProviderKind = "demo" | "api" | "websocket";

