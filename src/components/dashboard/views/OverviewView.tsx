"use client";

import { useMemo } from "react";
import { useAgri, useFarmStats } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { formatINR, formatPrice, relativeTime } from "@/lib/format";
import DataModeBanner from "../DataModeBanner";
import SmartRecommendationCard from "../SmartRecommendation";
import SmartInsights from "../SmartInsights";
import PriceTrendChart from "../PriceTrendChart";

type OverviewViewProps = {
  onOpenMarkets: () => void;
  onOpenCrops: () => void;
  onOpenCropMarket: (cropId: string) => void;
};

export default function OverviewView({
  onOpenMarkets,
  onOpenCrops,
  onOpenCropMarket,
}: OverviewViewProps) {
  const { quotes, farmCrops, lastTickAt, flashing } = useAgri();
  const {
    liveValue,
    valueDelta,
    opportunities,
    buyerCount,
    insights,
    recommendation,
    primaryFarmCrop,
  } = useFarmStats();

  const chartQuote = primaryFarmCrop ? quotes[primaryFarmCrop.cropId] : undefined;
  const chartCrop = primaryFarmCrop ? getCrop(primaryFarmCrop.cropId) : undefined;

  const comparison = useMemo(() => {
    if (!chartQuote) return [];
    return [...chartQuote.markets].sort((a, b) => b.price - a.price);
  }, [chartQuote]);

  return (
    <>
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">FARMER DASHBOARD</span>
        <h1>Good morning, Raj 👋</h1>
        <p>Here&apos;s what&apos;s happening with your farm today.</p>
      </header>

      <DataModeBanner />

      <section className="dashboard-stats">
        <button type="button" className="dashboard-stat dashboard-stat--action" onClick={onOpenCrops}>
          <span>🌱</span>
          <p>Active Crops</p>
          <strong>{farmCrops.length}</strong>
        </button>

        <div className={`dashboard-stat ${valueDelta > 0 ? "is-flash-up" : valueDelta < 0 ? "is-flash-down" : ""}`}>
          <span>₹</span>
          <p>Live Estimated Crop Value</p>
          <strong>{formatINR(liveValue)}</strong>
          <small className="live-pill">
            <span className="live-pill__dot" />
            LIVE
          </small>
          {valueDelta !== 0 && (
            <em className={valueDelta > 0 ? "price-up" : "price-down"}>
              {valueDelta > 0 ? "↑" : "↓"} {formatINR(Math.abs(valueDelta))}
            </em>
          )}
        </div>

        <button type="button" className="dashboard-stat dashboard-stat--action" onClick={onOpenMarkets}>
          <span>📊</span>
          <p>Market Opportunities</p>
          <strong>{opportunities}</strong>
        </button>

        <div className="dashboard-stat">
          <span>🤝</span>
          <p>Potential Buyers</p>
          <strong>{buyerCount}</strong>
        </div>
      </section>

      <SmartRecommendationCard
        recommendation={recommendation}
        onOpenMarket={onOpenMarkets}
      />

      <SmartInsights insights={insights} />

      <section className="dashboard-market">
        <div className="dashboard-market__header">
          <div>
            <span className="dashboard-market__label">MARKET INTELLIGENCE</span>
            <h2>Where should you sell?</h2>
            <p>
              Compare today&apos;s market opportunities
              {chartCrop ? ` for ${chartCrop.name}` : ""}.
            </p>
          </div>
          <button type="button" onClick={onOpenMarkets}>
            View all markets →
          </button>
        </div>

        <div className="dashboard-market__table">
          <div className="dashboard-market__row dashboard-market__row--header">
            <span>Market</span>
            <span>Price</span>
            <span>Distance</span>
            <span>Demand</span>
          </div>
          {comparison.map((market) => (
            <div key={market.marketId} className="dashboard-market__row">
              <strong>{market.marketName}</strong>
              <span>
                {chartCrop
                  ? formatPrice(market.price, chartCrop.unit)
                  : `₹${market.price}`}
              </span>
              <span>{market.distanceKm.toFixed(1)} km</span>
              <span className={market.demand === "high" ? "risk--low" : "risk--medium"}>
                {market.demand}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-price-chart">
        <div className="dashboard-price-chart__header">
          <span>PRICE TREND</span>
          <h2>
            {chartCrop ? `${chartCrop.name} market price` : "Market price"}
          </h2>
          <p>
            Interactive history with high, low, average and current price.
            Updated {relativeTime(lastTickAt)}.
          </p>
        </div>
        {chartQuote && chartCrop ? (
          <div className={flashing[chartCrop.id] ? `is-flash-${flashing[chartCrop.id]}` : ""}>
            <PriceTrendChart quote={chartQuote} />
            <button
              type="button"
              className="text-button"
              onClick={() => onOpenCropMarket(chartCrop.id)}
            >
              Open full {chartCrop.name} market details →
            </button>
          </div>
        ) : (
          <p>Add a crop to see price history.</p>
        )}
      </section>
    </>
  );
}
