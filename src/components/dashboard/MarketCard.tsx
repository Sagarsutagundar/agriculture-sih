"use client";

import { demandLabel, formatPercent, formatPrice, formatSignedINR, relativeTime } from "@/lib/format";
import type { Crop, CropQuote } from "@/data/types";
import { categoryMeta } from "@/services/cropService";
import CropImage from "./CropImage";

type MarketCardProps = {
  crop: Crop;
  quote: CropQuote;
  flashing?: "up" | "down";
  watched?: boolean;
  onOpen: () => void;
  onWatch: () => void;
};

export default function MarketCard({
  crop,
  quote,
  flashing,
  watched,
  onOpen,
  onWatch,
}: MarketCardProps) {
  const change = quote.currentPrice - quote.previousPrice;
  const changePercent =
    quote.previousPrice === 0 ? 0 : (change / quote.previousPrice) * 100;
  const primary =
    quote.markets.find((market) => market.marketId === quote.primaryMarketId) ??
    quote.markets[0];

  return (
    <article className={`market-card ${flashing ? `is-flash-${flashing}` : ""}`}>
      <CropImage crop={crop} />
      <div className="market-card__body">
        <div className="market-card__top">
          <div>
            <h3>
              {crop.emoji} {crop.name}
            </h3>
            <small>{categoryMeta(crop.category)?.label}</small>
          </div>
          <button
            type="button"
            className={`star-btn ${watched ? "is-active" : ""}`}
            onClick={onWatch}
            aria-label="Toggle watchlist"
          >
            {watched ? "★" : "☆"}
          </button>
        </div>

        <strong className={change >= 0 ? "price-up" : "price-down"}>
          {formatPrice(quote.currentPrice, crop.unit)}
        </strong>
        <p className={change >= 0 ? "price-up" : "price-down"}>
          {formatSignedINR(change)} today · {formatPercent(changePercent)}
        </p>
        <p>🔥 {demandLabel(quote.demand)}</p>
        <p>📍 {primary?.marketName}</p>
        <div className="market-card__live">
          <span className="live-pill">
            <span className="live-pill__dot" />
            DEMO LIVE
          </span>
          <small>Updated {relativeTime(quote.lastUpdated)}</small>
        </div>
        <button type="button" className="primary-btn" onClick={onOpen}>
          View Market Details
        </button>
      </div>
    </article>
  );
}
