"use client";

import type { Crop, CropQuote } from "@/data/types";
import { formatPercent, formatPrice, formatSignedINR, relativeTime } from "@/lib/format";

export default function LivePriceCard({
  crop,
  quote,
  flashing,
}: {
  crop: Crop;
  quote: CropQuote;
  flashing?: "up" | "down";
}) {
  const change = quote.currentPrice - quote.previousPrice;
  const changePercent =
    quote.previousPrice === 0 ? 0 : (change / quote.previousPrice) * 100;
  const primary =
    quote.markets.find((market) => market.marketId === quote.primaryMarketId) ??
    quote.markets[0];

  return (
    <div className={`live-price-card ${flashing ? `is-flash-${flashing}` : ""}`}>
      <div>
        <h3>
          {crop.emoji} {crop.name}
        </h3>
        <p>Current price</p>
        <strong>{formatPrice(quote.currentPrice, crop.unit)}</strong>
      </div>
      <ul>
        <li>Previous: {formatPrice(quote.previousPrice, crop.unit)}</li>
        <li className={change >= 0 ? "price-up" : "price-down"}>
          Trend: {formatSignedINR(change)} ({formatPercent(changePercent)})
        </li>
        <li>Market: {primary?.marketName}</li>
        <li>Last updated: {relativeTime(quote.lastUpdated)}</li>
        <li>Demand: {quote.demand}</li>
      </ul>
    </div>
  );
}
