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
import type {
  CropQuote,
  FarmCrop,
  FarmerProfile,
  GrowthStage,
  PriceAlert,
} from "@/data/types";
import { getCrop } from "@/services/cropService";
import { buildInsights } from "@/services/insightsService";
import { marketDataService } from "@/services/market";
import { DemoProvider } from "@/services/market/DemoProvider";
import { buildSmartRecommendation } from "@/services/recommendationService";

const STORAGE_KEYS = {
  farm: "agrismart.farmCrops",
  watchlist: "agrismart.watchlist",
  alerts: "agrismart.alerts",
  recent: "agrismart.recent",
  sih: "agrismart.sihDemo",
  profile: "agrismart.farmerProfile",
};

const DEFAULT_FARM: FarmCrop[] = [
  {
    id: "farm-tomato",
    cropId: "tomato",
    areaAcres: 2,
    estimatedYield: 1000,
    growthStage: "maturity",
    daysToHarvest: 12,
  },
  {
    id: "farm-potato",
    cropId: "potato",
    areaAcres: 1.5,
    estimatedYield: 800,
    growthStage: "vegetative",
    daysToHarvest: 40,
  },
  {
    id: "farm-onion",
    cropId: "onion",
    areaAcres: 1,
    estimatedYield: 600,
    growthStage: "flowering",
    daysToHarvest: 28,
  },
  {
    id: "farm-rice",
    cropId: "rice",
    areaAcres: 3.5,
    estimatedYield: 40,
    growthStage: "vegetative",
    daysToHarvest: 55,
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

type AgriContextValue = {
  quotes: Record<string, CropQuote>;
  flashing: Record<string, "up" | "down">;
  farmCrops: FarmCrop[];
  farmerProfile: FarmerProfile | null;
  watchlist: string[];
  alerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];
  recentCropIds: string[];
  sihDemo: boolean;
  lastTickAt: number;
  sourceLabel: string;
  isLiveGovernmentData: boolean;
  totalFarmAcres: number;
  addFarmCrop: (input: Omit<FarmCrop, "id">) => void;
  updateFarmCrop: (id: string, patch: Partial<FarmCrop>) => void;
  removeFarmCrop: (id: string) => void;
  setFarmerProfile: (profile: FarmerProfile) => void;
  toggleWatchlist: (cropId: string) => void;
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
  const [farmerProfile, setFarmerProfileState] = useState<FarmerProfile | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(["tomato", "mango"]);
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
    setAlerts(readJson(STORAGE_KEYS.alerts, []));
    setRecentCropIds(readJson(STORAGE_KEYS.recent, ["tomato"]));
    setSihDemoState(readJson(STORAGE_KEYS.sih, true));
    setFarmerProfileState(readJson<FarmerProfile | null>(STORAGE_KEYS.profile, null));
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
      { ...input, id: `farm-${input.cropId}-${Date.now()}` },
    ]);
  }, []);

  const updateFarmCrop = useCallback((id: string, patch: Partial<FarmCrop>) => {
    setFarmCrops((current) =>
      current.map((crop) => (crop.id === id ? { ...crop, ...patch } : crop)),
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

  const value = useMemo(
    () => ({
      quotes,
      flashing,
      farmCrops,
      farmerProfile,
      watchlist,
      alerts,
      triggeredAlerts,
      recentCropIds,
      sihDemo,
      lastTickAt,
      sourceLabel: provider.sourceLabel,
      isLiveGovernmentData: provider.isLiveGovernmentData,
      totalFarmAcres: farmerProfile?.farmSizeAcres ?? TOTAL_FARM_ACRES,
      addFarmCrop,
      updateFarmCrop,
      removeFarmCrop,
      setFarmerProfile,
      toggleWatchlist,
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
      watchlist,
      alerts,
      triggeredAlerts,
      recentCropIds,
      sihDemo,
      lastTickAt,
      provider.sourceLabel,
      provider.isLiveGovernmentData,
      addFarmCrop,
      updateFarmCrop,
      removeFarmCrop,
      setFarmerProfile,
      toggleWatchlist,
      addAlert,
      removeAlert,
      dismissTriggeredAlert,
      markRecent,
      forceTick,
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
  const { farmCrops, quotes, totalFarmAcres } = useAgri();

  const cropValues = farmCrops.map((farmCrop) => {
    const quote = quotes[farmCrop.cropId];
    const current = quote ? farmCrop.estimatedYield * quote.currentPrice : 0;
    const previous = quote ? farmCrop.estimatedYield * quote.previousPrice : 0;
    return { farmCrop, current, previous, delta: current - previous };
  });

  const liveValue = cropValues.reduce((sum, item) => sum + item.current, 0);
  const previousValue = cropValues.reduce((sum, item) => sum + item.previous, 0);
  const valueDelta = liveValue - previousValue;
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
    liveValue,
    previousValue,
    valueDelta,
    cultivated,
    cultivationPercent: Math.round((cultivated / totalFarmAcres) * 100),
    opportunities,
    buyerCount,
    insights,
    recommendation,
    primaryFarmCrop,
  };
}

export function growthStageLabel(stage: GrowthStage) {
  const labels: Record<GrowthStage, string> = {
    seedling: "Seedling",
    sowing: "Sowing",
    vegetative: "Vegetative",
    flowering: "Flowering",
    fruiting: "Fruiting",
    maturity: "Maturity",
    harvest: "Harvest Ready",
  };
  return labels[stage];
}

export { getCrop };
