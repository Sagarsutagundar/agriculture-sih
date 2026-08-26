"use client";

import { useState } from "react";
import { useAgri, useFarmStats } from "@/context/AgriContext";
import { getCrop, categoryMeta, growthDurationLabel } from "@/services/cropService";
import { buildSmartRecommendation } from "@/services/recommendationService";
import {
  demandLabel,
  formatINR,
  formatPercent,
  formatPrice,
  formatSignedINR,
  relativeTime,
} from "@/lib/format";
import CropImage from "../CropImage";
import LivePriceCard from "../LivePriceCard";
import PriceTrendChart from "../PriceTrendChart";
import SmartRecommendationCard from "../SmartRecommendation";

export default function MarketDetailView({
  cropId,
  onBack,
}: {
  cropId: string;
  onBack: () => void;
}) {
  const {
    quotes,
    flashing,
    watchlist,
    toggleWatchlist,
    addAlert,
    farmCrops,
  } = useAgri();
  const { cropValues } = useFarmStats();
  const [threshold, setThreshold] = useState(0);
  const [direction, setDirection] = useState<"above" | "below">("above");

  const crop = getCrop(cropId);
  const quote = quotes[cropId];

  if (!crop || !quote) {
    return (
      <p>
        Crop not found.{" "}
        <button type="button" className="text-button" onClick={onBack}>
          Back
        </button>
      </p>
    );
  }

  const change = quote.currentPrice - quote.previousPrice;
  const changePercent =
    quote.previousPrice === 0 ? 0 : (change / quote.previousPrice) * 100;
  const farmCrop = farmCrops.find((item) => item.cropId === cropId);
  const recommendation = buildSmartRecommendation(farmCrop, quote);
  const farmValue = cropValues.find((item) => item.farmCrop.cropId === cropId);

  const closest = [...quote.markets].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const demandRank = { high: 4, stable: 3, medium: 2, low: 1 };
  const hottest = [...quote.markets].sort(
    (a, b) => demandRank[b.demand] - demandRank[a.demand],
  )[0];
  const best = [...quote.markets].sort((a, b) => b.price - a.price)[0];

  return (
    <>
      <button type="button" className="text-button" onClick={onBack}>
        ← Back to live market
      </button>

      <header className="detail-header">
        <CropImage crop={crop} className="detail-header__image" />
        <div>
          <span className="dashboard-header__eyebrow">
            {crop.emoji} {crop.name.toUpperCase()} MARKET DETAILS
          </span>
          <h1>{crop.name} Market Details</h1>
          <p>
            {categoryMeta(crop.category)?.label} · Growing duration{" "}
            {growthDurationLabel(crop)} · Harvest: {crop.harvestStage}
          </p>
          <div className="card-actions">
            <button type="button" onClick={() => toggleWatchlist(crop.id)}>
              {watchlist.includes(crop.id) ? "★ In watchlist" : "☆ Add to watchlist"}
            </button>
          </div>
        </div>
      </header>

      <LivePriceCard crop={crop} quote={quote} flashing={flashing[crop.id]} />

      <section className="detail-metrics">
        <article>
          <span>Current Price</span>
          <strong>{formatPrice(quote.currentPrice, crop.unit)}</strong>
        </article>
        <article>
          <span>Price Change</span>
          <strong className={change >= 0 ? "price-up" : "price-down"}>
            {formatSignedINR(change)} ({formatPercent(changePercent)})
          </strong>
        </article>
        <article>
          <span>Demand</span>
          <strong>{demandLabel(quote.demand)}</strong>
        </article>
        <article>
          <span>Last updated</span>
          <strong>{relativeTime(quote.lastUpdated)}</strong>
        </article>
      </section>

      {farmValue && (
        <p className={farmValue.delta >= 0 ? "price-up" : "price-down"}>
          Your estimated {crop.name} value: {formatINR(farmValue.current)}{" "}
          {farmValue.delta !== 0 && (
            <>
              ({farmValue.delta > 0 ? "↑" : "↓"} {formatINR(Math.abs(farmValue.delta))})
            </>
          )}
        </p>
      )}

      <section className="dashboard-price-chart">
        <div className="dashboard-price-chart__header">
          <span>7-DAY / 30-DAY / 3-MONTH TREND</span>
          <h2>Interactive price history</h2>
        </div>
        <PriceTrendChart quote={quote} />
      </section>

      <section className="dashboard-market">
        <div className="dashboard-market__header">
          <div>
            <span className="dashboard-market__label">MARKETS</span>
            <h2>Where {crop.name} is trading</h2>
          </div>
        </div>
        <div className="dashboard-market__table">
          <div className="dashboard-market__row dashboard-market__row--header">
            <span>Market</span>
            <span>Price</span>
            <span>Distance</span>
            <span>Demand</span>
          </div>
          {quote.markets.map((market) => (
            <div key={market.marketId} className="dashboard-market__row">
              <strong>{market.marketName}</strong>
              <span>{formatPrice(market.price, crop.unit)}</span>
              <span>{market.distanceKm.toFixed(1)} km</span>
              <span>{market.demand}</span>
            </div>
          ))}
        </div>
        <div className="reco-mini">
          <p>🏆 Best Price: {best.marketName}</p>
          <p>📍 Closest: {closest.marketName} ({closest.distanceKm.toFixed(1)} km)</p>
          <p>🔥 Highest Demand: {hottest.marketName}</p>
        </div>
      </section>

      <SmartRecommendationCard recommendation={recommendation} />

      <section className="alert-box">
        <h3>🔔 Price alert</h3>
        <p>
          Example: notify when {crop.name} crosses a price you choose.
        </p>
        <div className="filters-row">
          <select
            value={direction}
            onChange={(event) =>
              setDirection(event.target.value as "above" | "below")
            }
          >
            <option value="above">Crosses above</option>
            <option value="below">Falls below</option>
          </select>
          <input
            type="number"
            className="search-input"
            placeholder="Threshold"
            value={threshold || ""}
            onChange={(event) => setThreshold(Number(event.target.value))}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (!threshold) return;
              addAlert({ cropId: crop.id, direction, threshold });
              setThreshold(0);
            }}
          >
            Create alert
          </button>
        </div>
      </section>
    </>
  );
}
