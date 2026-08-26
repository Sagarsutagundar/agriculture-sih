"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BUYERS } from "@/data/buyers";
import {
  calculateFarmValueSummary,
  type FarmValueSummary,
} from "@/services/cropValueService";
import type {
  BuyerMatch,
  CostBreakdownItem,
  CropHealthDiagnostic,
  CropHealthStatus,
  CropProfitAnalysis,
  CropQuote,
  FarmCrop,
  FarmerProfile,
  GrowthStage,
  PriceAlert,
  SmartAlert,
} from "@/data/types";
import { getCrop } from "@/services/cropService";
import { buildInsights } from "@/services/insightsService";
import { marketDataService } from "@/services/market";
import { DemoProvider } from "@/services/market/DemoProvider";
import { buildSmartRecommendation } from "@/services/recommendationService";
import {
  calculateFarmProfitSummary,
  calculateCropProfit,
  type FarmProfitSummary,
} from "@/services/profitAdvisorService";
import {
  assessAllFarmCrops,
  assessCropHealth,
} from "@/services/cropHealthService";
import {
  findBuyerMatches,
} from "@/services/buyerNetworkService";
import {
  generateDynamicAlerts,
} from "@/services/alertCenterService";

const STORAGE_KEYS = {
  farm: "agrismart.farmCrops",
  watchlist: "agrismart.watchlist",
  alerts: "agrismart.alerts",
  recent: "agrismart.recent",
  sih: "agrismart.sihDemo",
  profile: "agrismart.farmerProfile",
  watchedMarkets: "agrismart.watchedMarkets",
  watchedBuyers: "agrismart.watchedBuyers",
  dismissedAlerts: "agrismart.dismissedAlerts",
  readAlerts: "agrismart.readAlerts",
};

export const DEFAULT_PROFILE: FarmerProfile = {
  name: "Rajesh Kumar",
  phone: "9876543210",
  email: "rajesh.kumar@agri.in",
  state: "Maharashtra",
  district: "Nashik",
  location: "Dindori Taluka",
  farmSizeAcres: 10,
  farmingType: "organic",
  irrigationType: "drip",
  soilType: "black",
  avatar: "👨🏽‍🌾",
};

export const DEFAULT_FARM: FarmCrop[] = [
  {
    id: "farm-tomato",
    cropId: "tomato",
    variety: "Arka Rakshak (F1)",
    areaAcres: 2,
    areaUnit: "acres",
    estimatedYield: 1000,
    growthStage: "maturity",
    status: "Healthy",
    daysToHarvest: 12,
    sowingDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    expectedHarvestDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    statusNote: "Fruit cluster turning red, optimal drip fertigation applied.",
  },
  {
    id: "farm-potato",
    cropId: "potato",
    variety: "Kufri Jyoti",
    areaAcres: 1.5,
    areaUnit: "acres",
    estimatedYield: 800,
    growthStage: "vegetative",
    status: "Growing",
    daysToHarvest: 40,
    sowingDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    expectedHarvestDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    statusNote: "Healthy foliage canopy, earthing-up completed.",
  },
  {
    id: "farm-onion",
    cropId: "onion",
    variety: "Bhima Super",
    areaAcres: 1,
    areaUnit: "acres",
    estimatedYield: 600,
    growthStage: "flowering",
    status: "Needs Attention",
    daysToHarvest: 28,
    sowingDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    expectedHarvestDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    statusNote: "Minor thrips scouting note; bio-pesticide spray scheduled.",
  },
  {
    id: "farm-rice",
    cropId: "rice",
    variety: "Basmati 1121",
    areaAcres: 3.5,
    areaUnit: "acres",
    estimatedYield: 40,
    growthStage: "vegetative",
    status: "Growing",
    daysToHarvest: 55,
    sowingDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    expectedHarvestDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    statusNote: "Tillering stage, water level maintained at 2-3 cm.",
  },
];

const TOTAL_FARM_ACRES = 10;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getProfileCompletion(profile: FarmerProfile | null): number {
  if (!profile) return 0;
  const fields = [
    Boolean(profile.name?.trim()),
    Boolean(profile.phone?.trim()),
    Boolean(profile.state?.trim()),
    Boolean(profile.district?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.farmSizeAcres > 0),
    Boolean(profile.farmingType),
    Boolean(profile.irrigationType),
    Boolean(profile.soilType),
    Boolean(profile.email?.trim()),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

type AgriContextValue = {
  quotes: Record<string, CropQuote>;
  flashing: Record<string, "up" | "down">;
  farmCrops: FarmCrop[];
  farmerProfile: FarmerProfile;
  profileCompletion: number;
  watchlist: string[];
  watchedMarkets: string[];
  watchedBuyers: string[];
  alerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];
  recentCropIds: string[];
  sihDemo: boolean;
  lastTickAt: number;
  sourceLabel: string;
  isLiveGovernmentData: boolean;
  totalFarmAcres: number;
  profitSummary: FarmProfitSummary;
  healthDiagnostics: CropHealthDiagnostic[];
  buyerMatches: BuyerMatch[];
  smartAlerts: SmartAlert[];
  addFarmCrop: (input: Omit<FarmCrop, "id">) => void;
  updateFarmCrop: (id: string, patch: Partial<FarmCrop>) => void;
  updateCropStage: (id: string, stage: GrowthStage) => void;
  updateCropStatus: (id: string, status: CropHealthStatus) => void;
  markCropHarvested: (id: string) => void;
  removeFarmCrop: (id: string) => void;
  setFarmerProfile: (profile: FarmerProfile) => void;
  toggleWatchlist: (cropId: string) => void;
  toggleWatchMarket: (marketId: string) => void;
  toggleWatchBuyer: (buyerId: string) => void;
  isCropWatched: (cropId: string) => boolean;
  isMarketWatched: (marketId: string) => boolean;
  isBuyerWatched: (buyerId: string) => boolean;
  dismissSmartAlert: (alertId: string) => void;
  markSmartAlertRead: (alertId: string) => void;
  addAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  dismissTriggeredAlert: (id: string) => void;
  markRecent: (cropId: string) => void;
  setSihDemo: (enabled: boolean) => void;
  forceTick: () => void;
};

const AgriContext = createContext<AgriContextValue | null>(null);

export function AgriProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Record<string, CropQuote>>({});
  const [flashing, setFlashing] = useState<Record<string, "up" | "down">>({});
  const [farmCrops, setFarmCrops] = useState<FarmCrop[]>(DEFAULT_FARM);
  const [farmerProfile, setFarmerProfileState] = useState<FarmerProfile>(DEFAULT_PROFILE);
  const [watchlist, setWatchlist] = useState<string[]>(["tomato", "mango"]);
  const [watchedMarkets, setWatchedMarkets] = useState<string[]>(["apmc-belagavi"]);
  const [watchedBuyers, setWatchedBuyers] = useState<string[]>(["buyer-freshkart"]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
  const [recentCropIds, setRecentCropIds] = useState<string[]>(["tomato"]);
  const [sihDemo, setSihDemoState] = useState(true);
  const [lastTickAt, setLastTickAt] = useState(Date.now());
  const [hydrated, setHydrated] = useState(false);
  const previousQuotes = useRef<Record<string, CropQuote>>({});

  useEffect(() => {
    setFarmCrops(readJson(STORAGE_KEYS.farm, DEFAULT_FARM));
    setWatchlist(readJson(STORAGE_KEYS.watchlist, ["tomato", "mango"]));
    setWatchedMarkets(readJson(STORAGE_KEYS.watchedMarkets, ["apmc-belagavi"]));
    setWatchedBuyers(readJson(STORAGE_KEYS.watchedBuyers, ["buyer-freshkart"]));
    setDismissedAlertIds(readJson(STORAGE_KEYS.dismissedAlerts, []));
    setReadAlertIds(readJson(STORAGE_KEYS.readAlerts, []));
    setAlerts(readJson(STORAGE_KEYS.alerts, []));
    setRecentCropIds(readJson(STORAGE_KEYS.recent, ["tomato"]));
    setSihDemoState(readJson(STORAGE_KEYS.sih, true));
    setFarmerProfileState(readJson<FarmerProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.farm, JSON.stringify(farmCrops));
  }, [farmCrops, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist));
  }, [watchlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.watchedMarkets, JSON.stringify(watchedMarkets));
  }, [watchedMarkets, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.watchedBuyers, JSON.stringify(watchedBuyers));
  }, [watchedBuyers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.dismissedAlerts, JSON.stringify(dismissedAlertIds));
  }, [dismissedAlertIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.readAlerts, JSON.stringify(readAlertIds));
  }, [readAlertIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
  }, [alerts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentCropIds));
  }, [recentCropIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.sih, JSON.stringify(sihDemo));
  }, [sihDemo, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (farmerProfile !== null) {
      window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(farmerProfile));
    }
  }, [farmerProfile, hydrated]);

  useEffect(() => {
    const provider = marketDataService.getProvider();
    const unsubscribe = provider.subscribe((nextQuotes) => {
      const prev = previousQuotes.current;
      const flash: Record<string, "up" | "down"> = {};
      for (const [cropId, quote] of Object.entries(nextQuotes)) {
        const oldPrice = prev[cropId]?.currentPrice;
        if (oldPrice != null && oldPrice !== quote.currentPrice) {
          flash[cropId] = quote.currentPrice > oldPrice ? "up" : "down";
        }
      }
      previousQuotes.current = nextQuotes;
      setQuotes(nextQuotes);
      setLastTickAt(Date.now());
      if (Object.keys(flash).length > 0) {
        setFlashing(flash);
        window.setTimeout(() => setFlashing({}), 1200);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const provider = marketDataService.getProvider();
    if (!(provider instanceof DemoProvider)) return;
    if (sihDemo) {
      provider.startSimulation(12000);
    } else {
      provider.stopSimulation();
    }
    return () => provider.stopSimulation();
  }, [sihDemo]);

  useEffect(() => {
    if (!hydrated) return;
    const newlyTriggered: PriceAlert[] = [];
    const remaining = alerts.map((alert) => {
      if (alert.triggeredAt) return alert;
      const quote = quotes[alert.cropId];
      if (!quote) return alert;
      const crossed =
        alert.direction === "above"
          ? quote.currentPrice >= alert.threshold
          : quote.currentPrice <= alert.threshold;
      if (!crossed) return alert;
      const triggered = { ...alert, triggeredAt: Date.now() };
      newlyTriggered.push(triggered);
      return triggered;
    });
    if (newlyTriggered.length > 0) {
      setAlerts(remaining);
      setTriggeredAlerts((current) => [...newlyTriggered, ...current].slice(0, 6));
    }
  }, [quotes, alerts, hydrated]);

  const addFarmCrop = useCallback((input: Omit<FarmCrop, "id">) => {
    setFarmCrops((current) => [
      ...current,
      {
        ...input,
        id: `farm-${input.cropId}-${Date.now()}`,
        status: input.status || "Growing",
      },
    ]);
  }, []);

  const updateFarmCrop = useCallback((id: string, patch: Partial<FarmCrop>) => {
    setFarmCrops((current) =>
      current.map((crop) => (crop.id === id ? { ...crop, ...patch } : crop)),
    );
  }, []);

  const updateCropStage = useCallback((id: string, stage: GrowthStage) => {
    setFarmCrops((current) =>
      current.map((crop) => {
        if (crop.id !== id) return crop;
        const isHarvest = stage === "harvest";
        return {
          ...crop,
          growthStage: stage,
          status: isHarvest ? ("Ready for Harvest" as CropHealthStatus) : crop.status,
          daysToHarvest: isHarvest ? 0 : crop.daysToHarvest,
        };
      }),
    );
  }, []);

  const updateCropStatus = useCallback((id: string, status: CropHealthStatus) => {
    setFarmCrops((current) =>
      current.map((crop) => (crop.id === id ? { ...crop, status } : crop)),
    );
  }, []);

  const markCropHarvested = useCallback((id: string) => {
    setFarmCrops((current) =>
      current.map((crop) =>
        crop.id === id
          ? {
              ...crop,
              growthStage: "harvest",
              status: "Harvested" as CropHealthStatus,
              daysToHarvest: 0,
            }
          : crop,
      ),
    );
  }, []);

  const removeFarmCrop = useCallback((id: string) => {
    setFarmCrops((current) => current.filter((crop) => crop.id !== id));
  }, []);

  const setFarmerProfile = useCallback((profile: FarmerProfile) => {
    setFarmerProfileState(profile);
  }, []);

  const toggleWatchlist = useCallback((cropId: string) => {
    setWatchlist((current) =>
      current.includes(cropId)
        ? current.filter((id) => id !== cropId)
        : [...current, cropId],
    );
  }, []);

  const toggleWatchMarket = useCallback((marketId: string) => {
    setWatchedMarkets((current) =>
      current.includes(marketId)
        ? current.filter((id) => id !== marketId)
        : [...current, marketId],
    );
  }, []);

  const toggleWatchBuyer = useCallback((buyerId: string) => {
    setWatchedBuyers((current) =>
      current.includes(buyerId)
        ? current.filter((id) => id !== buyerId)
        : [...current, buyerId],
    );
  }, []);

  const isCropWatched = useCallback(
    (cropId: string) => watchlist.includes(cropId),
    [watchlist],
  );

  const isMarketWatched = useCallback(
    (marketId: string) => watchedMarkets.includes(marketId),
    [watchedMarkets],
  );

  const isBuyerWatched = useCallback(
    (buyerId: string) => watchedBuyers.includes(buyerId),
    [watchedBuyers],
  );

  const dismissSmartAlert = useCallback((alertId: string) => {
    setDismissedAlertIds((current) => [...current, alertId]);
  }, []);

  const markSmartAlertRead = useCallback((alertId: string) => {
    setReadAlertIds((current) =>
      current.includes(alertId) ? current : [...current, alertId],
    );
  }, []);

  const addAlert = useCallback((alert: Omit<PriceAlert, "id" | "createdAt">) => {
    setAlerts((current) => [
      ...current,
      { ...alert, id: `alert-${Date.now()}`, createdAt: Date.now() },
    ]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const dismissTriggeredAlert = useCallback((id: string) => {
    setTriggeredAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const markRecent = useCallback((cropId: string) => {
    setRecentCropIds((current) =>
      [cropId, ...current.filter((id) => id !== cropId)].slice(0, 8),
    );
  }, []);

  const forceTick = useCallback(() => {
    marketDataService.getProvider().tickOnce?.();
  }, []);

  const provider = marketDataService.getProvider();
  const profileCompletion = useMemo(
    () => getProfileCompletion(farmerProfile),
    [farmerProfile],
  );

  const profitSummary = useMemo(
    () => calculateFarmProfitSummary(farmCrops, quotes),
    [farmCrops, quotes],
  );

  const healthDiagnostics = useMemo(
    () => assessAllFarmCrops(farmCrops),
    [farmCrops],
  );

  const buyerMatches = useMemo(
    () => findBuyerMatches(farmCrops, BUYERS, quotes),
    [farmCrops, quotes],
  );

  const rawSmartAlerts = useMemo(
    () => generateDynamicAlerts(farmCrops, quotes, farmerProfile, alerts),
    [farmCrops, quotes, farmerProfile, alerts],
  );

  const smartAlerts = useMemo(
    () =>
      rawSmartAlerts
        .filter((a) => !dismissedAlertIds.includes(a.id))
        .map((a) => ({
          ...a,
          isRead: a.isRead || readAlertIds.includes(a.id),
        })),
    [rawSmartAlerts, dismissedAlertIds, readAlertIds],
  );

  const value = useMemo(
    () => ({
      quotes,
      flashing,
      farmCrops,
      farmerProfile,
      profileCompletion,
      watchlist,
      watchedMarkets,
      watchedBuyers,
      alerts,
      triggeredAlerts,
      recentCropIds,
      sihDemo,
      lastTickAt,
      sourceLabel: provider.sourceLabel,
      isLiveGovernmentData: provider.isLiveGovernmentData,
      totalFarmAcres: farmerProfile?.farmSizeAcres ?? TOTAL_FARM_ACRES,
      profitSummary,
      healthDiagnostics,
      buyerMatches,
      smartAlerts,
      addFarmCrop,
      updateFarmCrop,
      updateCropStage,
      updateCropStatus,
      markCropHarvested,
      removeFarmCrop,
      setFarmerProfile,
      toggleWatchlist,
      toggleWatchMarket,
      toggleWatchBuyer,
      isCropWatched,
      isMarketWatched,
      isBuyerWatched,
      dismissSmartAlert,
      markSmartAlertRead,
      addAlert,
      removeAlert,
      dismissTriggeredAlert,
      markRecent,
      setSihDemo: setSihDemoState,
      forceTick,
    }),
    [
      quotes,
      flashing,
      farmCrops,
      farmerProfile,
      profileCompletion,
      watchlist,
      watchedMarkets,
      watchedBuyers,
      alerts,
      triggeredAlerts,
      recentCropIds,
      sihDemo,
      lastTickAt,
      provider.sourceLabel,
      provider.isLiveGovernmentData,
      profitSummary,
      healthDiagnostics,
      buyerMatches,
      smartAlerts,
      addFarmCrop,
      updateFarmCrop,
      updateCropStage,
      updateCropStatus,
      markCropHarvested,
      removeFarmCrop,
      setFarmerProfile,
      toggleWatchlist,
      toggleWatchMarket,
      toggleWatchBuyer,
      isCropWatched,
      isMarketWatched,
      isBuyerWatched,
      dismissSmartAlert,
      markSmartAlertRead,
      addAlert,
      removeAlert,
      dismissTriggeredAlert,
      markRecent,
    ],
  );

  return <AgriContext.Provider value={value}>{children}</AgriContext.Provider>;
}

export function useAgri() {
  const context = useContext(AgriContext);
  if (!context) {
    throw new Error("useAgri must be used within AgriProvider");
  }
  return context;
}

export function useFarmStats() {
  const { farmCrops, quotes, totalFarmAcres, isLiveGovernmentData } = useAgri();

  const farmValueSummary: FarmValueSummary = useMemo(
    () => calculateFarmValueSummary(farmCrops, quotes, isLiveGovernmentData),
    [farmCrops, quotes, isLiveGovernmentData],
  );

  const liveValue = farmValueSummary.totalValue;
  const previousValue = farmValueSummary.previousTotalValue;
  const valueDelta = farmValueSummary.valueDelta;
  const cropValues = farmValueSummary.cropBreakdowns.map((b) => {
    const fc = farmCrops.find((c) => c.id === b.farmCropId) || farmCrops[0];
    return {
      farmCrop: fc,
      current: b.totalValue,
      previous: b.previousTotalValue,
      delta: b.valueDelta,
    };
  });

  const cultivated = farmCrops.reduce((sum, crop) => sum + crop.areaAcres, 0);
  const opportunities = farmCrops.reduce((sum, farmCrop) => {
    const quote = quotes[farmCrop.cropId];
    return sum + (quote?.markets.length ?? 0);
  }, 0);
  const buyerCount = BUYERS.filter((buyer) =>
    farmCrops.some((farmCrop) => buyer.cropIds.includes(farmCrop.cropId)),
  ).length;

  const previousMap = Object.fromEntries(
    cropValues.map((item) => [item.farmCrop.id, item.previous]),
  );

  const insights = buildInsights(farmCrops, quotes, previousMap, totalFarmAcres);
  const primaryFarmCrop = farmCrops[0];
  const recommendation = buildSmartRecommendation(
    primaryFarmCrop,
    primaryFarmCrop ? quotes[primaryFarmCrop.cropId] : undefined,
  );

  return {
    cropValues,
    farmValueSummary,
    liveValue,
    previousValue,
    valueDelta,
    cultivated,
    cultivationPercent: Math.min(100, Math.round((cultivated / totalFarmAcres) * 100)),
    opportunities,
    buyerCount,
    insights,
    recommendation,
    primaryFarmCrop,
  };
}

export function growthStageLabel(stage: GrowthStage) {
  const labels: Record<GrowthStage, string> = {
    sowing: "Sowing",
    germination: "Germination",
    seedling: "Seedling",
    vegetative: "Vegetative",
    flowering: "Flowering",
    fruiting: "Fruiting",
    maturity: "Maturity",
    harvest: "Harvest Ready",
  };
  return labels[stage] || stage;
}

export { getCrop };
