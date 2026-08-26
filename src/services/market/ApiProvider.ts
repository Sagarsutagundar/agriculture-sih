import { createInitialQuotes } from "./quoteEngine";
import type { MarketDataProvider, QuoteListener } from "./types";

/**
 * Ready for a government/Agmarknet-style HTTP API.
 * Until NEXT_PUBLIC_MARKET_API_URL is set, this provider is unused.
 */
export class ApiProvider implements MarketDataProvider {
  kind = "api" as const;
  sourceLabel = "LIVE MARKET DATA";
  isLiveGovernmentData = true;

  private quotes = createInitialQuotes();
  private listeners = new Set<QuoteListener>();
  private endpoint = process.env.NEXT_PUBLIC_MARKET_API_URL ?? "";

  getQuotes() {
    return this.quotes;
  }

  getQuote(cropId: string) {
    return this.quotes[cropId];
  }

  subscribe(listener: QuoteListener) {
    this.listeners.add(listener);
    listener(this.quotes);
    return () => this.listeners.delete(listener);
  }

  async connect() {
    if (!this.endpoint) {
      throw new Error("NEXT_PUBLIC_MARKET_API_URL is not configured");
    }

    const response = await fetch(this.endpoint, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Market API failed: ${response.status}`);
    }

    const payload = (await response.json()) as typeof this.quotes;
    this.quotes = payload;
    this.listeners.forEach((listener) => listener(this.quotes));
  }
}
