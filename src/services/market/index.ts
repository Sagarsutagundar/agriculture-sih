import { ApiProvider } from "./ApiProvider";
import { DemoProvider } from "./DemoProvider";
import type { MarketDataProvider } from "./types";
import { WebSocketProvider } from "./WebSocketProvider";

class MarketDataService {
  private provider: MarketDataProvider;

  constructor(provider?: MarketDataProvider) {
    this.provider = provider ?? new DemoProvider();
  }

  getProvider() {
    return this.provider;
  }

  setProvider(provider: MarketDataProvider) {
    this.provider.stopSimulation?.();
    this.provider.disconnect?.();
    this.provider = provider;
  }

  useDemo() {
    this.setProvider(new DemoProvider());
    return this.provider;
  }

  async useLiveApiIfConfigured() {
    const url = process.env.NEXT_PUBLIC_MARKET_API_URL;
    if (!url) return this.provider;

    const api = new ApiProvider();
    try {
      await api.connect();
      this.setProvider(api);
    } catch {
      this.useDemo();
    }
    return this.provider;
  }

  async useWebSocketIfConfigured() {
    const url = process.env.NEXT_PUBLIC_MARKET_WS_URL;
    if (!url) return this.provider;

    const socketProvider = new WebSocketProvider();
    try {
      await socketProvider.connect();
      this.setProvider(socketProvider);
    } catch {
      this.useDemo();
    }
    return this.provider;
  }
}

export const marketDataService = new MarketDataService();
export { DemoProvider, ApiProvider, WebSocketProvider };
