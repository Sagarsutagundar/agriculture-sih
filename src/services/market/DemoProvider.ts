import type { CropQuote } from "@/data/types";
import { applyQuoteTick, createInitialQuotes } from "./quoteEngine";
import type { MarketDataProvider, QuoteListener } from "./types";

export class DemoProvider implements MarketDataProvider {
  kind = "demo" as const;
  sourceLabel = "Demo Mode – Sample Market Prices";
  isLiveGovernmentData = false;

  private quotes = createInitialQuotes();
  private listeners = new Set<QuoteListener>();
  private timer: ReturnType<typeof setInterval> | null = null;

  getQuotes() {
    return this.quotes;
  }

  getQuote(cropId: string) {
    return this.quotes[cropId];
  }

  subscribe(listener: QuoteListener) {
    this.listeners.add(listener);
    listener(this.quotes);
    return () => {
      this.listeners.delete(listener);
    };
  }

  startSimulation(intervalMs = 14000) {
    this.stopSimulation();
    this.timer = setInterval(() => {
      this.tickOnce();
    }, intervalMs);
  }

  stopSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tickOnce() {
    const featured = ["tomato", "potato", "onion", "mango", "rice", "wheat"];
    const extra = Object.keys(this.quotes).filter(() => Math.random() > 0.9);
    const { quotes } = applyQuoteTick(this.quotes, [...featured, ...extra]);
    this.quotes = quotes;
    this.listeners.forEach((listener) => listener(this.quotes));
  }
}
