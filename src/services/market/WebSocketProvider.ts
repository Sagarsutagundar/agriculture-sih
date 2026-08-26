import { createInitialQuotes } from "./quoteEngine";
import type { MarketDataProvider, QuoteListener } from "./types";

/**
 * Ready for true push updates. Unused until NEXT_PUBLIC_MARKET_WS_URL is set.
 */
export class WebSocketProvider implements MarketDataProvider {
  kind = "websocket" as const;
  sourceLabel = "LIVE MARKET DATA";
  isLiveGovernmentData = true;

  private quotes = createInitialQuotes();
  private listeners = new Set<QuoteListener>();
  private socket: WebSocket | null = null;
  private url = process.env.NEXT_PUBLIC_MARKET_WS_URL ?? "";

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

  connect() {
    if (!this.url) {
      return Promise.reject(new Error("NEXT_PUBLIC_MARKET_WS_URL is not configured"));
    }

    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      socket.onopen = () => resolve();
      socket.onerror = () => reject(new Error("Market WebSocket failed"));
      socket.onmessage = (event) => {
        this.quotes = JSON.parse(event.data) as typeof this.quotes;
        this.listeners.forEach((listener) => listener(this.quotes));
      };
    });
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
