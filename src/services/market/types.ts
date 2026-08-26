import type { CropQuote, MarketProviderKind } from "@/data/types";

export type QuoteListener = (quotes: Record<string, CropQuote>) => void;

export type MarketDataProvider = {
  kind: MarketProviderKind;
  sourceLabel: string;
  isLiveGovernmentData: boolean;
  getQuotes(): Record<string, CropQuote>;
  getQuote(cropId: string): CropQuote | undefined;
  subscribe(listener: QuoteListener): () => void;
  startSimulation?(intervalMs?: number): void;
  stopSimulation?(): void;
  tickOnce?(): void;
  connect?(): Promise<void>;
  disconnect?(): void;
};
