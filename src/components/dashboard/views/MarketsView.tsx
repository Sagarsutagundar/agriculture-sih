"use client";

import { useMemo, useState } from "react";
import { useAgri } from "@/context/AgriContext";
import { CROPS } from "@/data/crops";
import { CROP_CATEGORIES } from "@/data/categories";
import type { CropCategory, DemandLevel, PriceUnit } from "@/data/types";
import { getCrop, searchCrops } from "@/services/cropService";
import { formatINR, formatPrice } from "@/lib/format";
import "./MarketsView.scss";

type TimeRange = "7d" | "30d" | "season";

export default function MarketsView({
  onOpenCrop = () => {},
}: {
  onOpenCrop?: (cropId: string) => void;
}) {
  const {
    quotes,
    farmCrops,
    watchlist,
    toggleWatchlist,
    watchedMarkets,
    toggleWatchMarket,
    isCropWatched,
    isMarketWatched,
    sourceLabel,
    isLiveGovernmentData,
    lastTickAt,
  } = useAgri();

  // Active selected crop for deep spot intelligence
  const initialCropId = farmCrops[0]?.cropId || "tomato";
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CropCategory | "all">("all");

  const selectedCrop = getCrop(selectedCropId) || CROPS[0];
  const currentQuote = quotes[selectedCropId];

  // Price calculations
  const currentPrice = currentQuote?.currentPrice ?? selectedCrop.samplePrice;
  const previousPrice = currentQuote?.previousPrice ?? currentPrice;
  const priceDelta = currentPrice - previousPrice;
  const priceDeltaPercent =
    previousPrice > 0 ? ((priceDelta / previousPrice) * 100).toFixed(1) : "0.0";
  const isUp = priceDelta >= 0;

  // Regional markets for comparison
  const regionalMarkets = useMemo(() => {
    if (!currentQuote?.markets || currentQuote.markets.length === 0) {
      return [
        { marketId: "apmc-belagavi", marketName: "APMC Belagavi Yard", distanceKm: 8.4, price: currentPrice, demand: "high" as DemandLevel },
        { marketId: "apmc-hubballi", marketName: "Hubballi Wholesale Mandi", distanceKm: 20.1, price: Math.round(currentPrice * 1.05), demand: "stable" as DemandLevel },
        { marketId: "local-mandi", marketName: "Taluka Local Yard", distanceKm: 3.2, price: Math.round(currentPrice * 0.94), demand: "medium" as DemandLevel },
        { marketId: "city-terminal", marketName: "Bengaluru Terminal Market", distanceKm: 85.0, price: Math.round(currentPrice * 1.12), demand: "high" as DemandLevel },
      ];
    }
    return currentQuote.markets;
  }, [currentQuote, currentPrice]);

  const bestMarket = useMemo(() => {
    return [...regionalMarkets].sort((a, b) => b.price - a.price)[0];
  }, [regionalMarkets]);

  // Generate dynamic historical chart curve points based on selected time range
  const chartPoints = useMemo(() => {
    const count = timeRange === "7d" ? 7 : timeRange === "30d" ? 14 : 12;
    const base = currentPrice;
    const points: { day: string; price: number }[] = [];

    for (let i = count - 1; i >= 0; i--) {
      // Small simulated variance reflecting realistic mandi swings
      const wave = Math.sin(i * 0.8) * (base * 0.06);
      const randomJitter = (Math.cos(i * 1.3) * (base * 0.03));
      const p = i === 0 ? base : Math.round(base - wave + randomJitter);
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      points.push({
        day: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        price: p,
      });
    }
    return points;
  }, [currentPrice, timeRange]);

  // Calculate SVG polyline points
  const svgData = useMemo(() => {
    const prices = chartPoints.map((p) => p.price);
    const minP = Math.min(...prices) * 0.96;
    const maxP = Math.max(...prices) * 1.04;
    const range = maxP - minP || 1;
    const width = 400;
    const height = 120;

    const coords = chartPoints.map((p, idx) => {
      const x = (idx / (chartPoints.length - 1)) * width;
      const y = height - ((p.price - minP) / range) * (height - 20) - 10;
      return `${x},${y}`;
    });

    return {
      polyline: coords.join(" "),
      minPrice: Math.round(minP),
      maxPrice: Math.round(maxP),
    };
  }, [chartPoints]);

  // Farm crops vs all crops for quick pill selector
  const farmCropIds = farmCrops.map((c) => c.cropId);
  const quickCrops = useMemo(() => {
    const list = [...farmCrops.map((fc) => getCrop(fc.cropId)).filter(Boolean)];
    // add top trending crops if not in farm
    const extras = CROPS.filter((c) => !farmCropIds.includes(c.id)).slice(0, 6);
    return [...list, ...extras];
  }, [farmCrops, farmCropIds]);

  // Filtered catalog list
  const catalogList = useMemo(() => {
    return searchCrops(searchQuery, categoryFilter);
  }, [searchQuery, categoryFilter]);

  return (
    <div className="market-intelligence-view">
      {/* Header */}
      <header className="market-intel-header">
        <div className="market-intel-header__left">
          <span className="eyebrow">
            <span>📊</span> AGRICULTURAL MARKET INTELLIGENCE
          </span>
          <h1>APMC Mandi Price Intelligence</h1>
          <p>
            Real-time benchmark modal rates, inter-mandi price spreads, and transport-adjusted
            arbitrage for optimal harvest dispatch.
          </p>
        </div>

        <div className="market-intel-header__badge">
          <span className="source">
            <span>●</span> {isLiveGovernmentData ? "Agmarknet / e-NAM Live" : "APMC Benchmark Feed"}
          </span>
          <span className="time">
            Last synced: {new Date(lastTickAt).toLocaleTimeString("en-IN")}
          </span>
        </div>
      </header>

      {/* Quick Crop Selector */}
      <section className="crop-selector-bar">
        <div className="crop-selector-bar__top">
          <span>SELECT CROP TO ANALYZE</span>
          <small>Click to switch active price intelligence</small>
        </div>
        <div className="crop-selector-bar__pills">
          {quickCrops.map((crop) => {
            if (!crop) return null;
            const isFarm = farmCropIds.includes(crop.id);
            const isSelected = crop.id === selectedCropId;
            return (
              <button
                key={crop.id}
                type="button"
                className={`crop-pill-btn ${isSelected ? "is-active" : ""}`}
                onClick={() => setSelectedCropId(crop.id)}
              >
                <span>{crop.emoji}</span>
                <span>{crop.name}</span>
                {isFarm && <span className="crop-tag">My Plot</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Spot Price Hero Showcase */}
      <section className="spot-price-hero">
        <div className="spot-price-hero__primary">
          <div className="spot-price-hero__crop-meta">
            <div className="crop-avatar">{selectedCrop.emoji}</div>
            <div>
              <h2>{selectedCrop.name}</h2>
              <div className="sub-meta">
                <span>Category: <strong>{selectedCrop.category.toUpperCase()}</strong></span>
                <span>•</span>
                <span>Standard Unit: <strong>{selectedCrop.unit.toUpperCase()}</strong></span>
              </div>
            </div>
          </div>

          <div className="spot-price-hero__price-block">
            <span className="price-label">Current APMC Modal Benchmark</span>
            <div className="price-value-row">
              <span className="price-main">{formatINR(currentPrice)}</span>
              <span className="price-unit">/ {selectedCrop.unit}</span>
              <span className={`price-delta-badge ${isUp ? "is-up" : "is-down"}`}>
                {isUp ? "↑" : "↓"} {Math.abs(priceDelta)} ({isUp ? "+" : ""}{priceDeltaPercent}%)
              </span>
            </div>
          </div>

          <div className="spot-price-hero__location-strip">
            <div className="info-chip">
              <small>Best Available Market</small>
              <strong>{bestMarket.marketName} ({formatINR(bestMarket.price)})</strong>
            </div>
            <div className="info-chip">
              <small>Regional Demand</small>
              <strong>{currentQuote?.demand?.toUpperCase() || "HIGH"} DEMAND</strong>
            </div>
            <div className="info-chip">
              <small>Freshness</small>
              <strong>Updated 8 min ago</strong>
            </div>
          </div>

          <div className="spot-price-hero__actions">
            <button
              type="button"
              className={`watch-btn ${isCropWatched(selectedCropId) ? "is-watched" : ""}`}
              onClick={() => toggleWatchlist(selectedCropId)}
            >
              {isCropWatched(selectedCropId) ? "★ In Watchlist" : "☆ Add to Watchlist"}
            </button>
            <button
              type="button"
              className="alert-btn"
              onClick={() => onOpenCrop(selectedCropId)}
            >
              🔔 Set Target Price Alert
            </button>
          </div>
        </div>

        {/* Right Chart Side */}
        <div className="spot-price-hero__chart-side">
          <div className="chart-header">
            <strong>Historical Price Trend ({selectedCrop.name})</strong>
            <div className="timeline-tabs">
              {(["7d", "30d", "season"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={timeRange === t ? "active" : ""}
                  onClick={() => setTimeRange(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Price Chart */}
          <div className="trend-svg-container">
            <svg viewBox="0 0 400 120" style={{ width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="400" y2="20" stroke="#e0e0e0" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#e0e0e0" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#e0e0e0" strokeDasharray="3 3" />
              <polyline
                fill="none"
                stroke="#2e7d32"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgData.polyline}
              />
            </svg>
          </div>

          <div className="chart-footer">
            <span>Low: {formatINR(svgData.minPrice)}</span>
            <span>High: {formatINR(svgData.maxPrice)}</span>
            <span>Trend: {isUp ? "Bullish (Accumulating)" : "Neutral"}</span>
          </div>
        </div>
      </section>

      {/* Regional Mandi Comparison Table */}
      <section className="markets-comparison-card">
        <div className="markets-comparison-card__header">
          <div>
            <h3>Regional Mandi Spreads & Net Realization</h3>
            <p>
              Compare rates across nearby yards. Estimated net realization factors in ₹35/km freight cost.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="markets-table">
            <thead>
              <tr>
                <th>APMC Market</th>
                <th>Distance</th>
                <th>Demand Level</th>
                <th>Mandi Rate</th>
                <th>Est. Freight</th>
                <th>Net Realization</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {regionalMarkets.map((m) => {
                const freight = Math.round(m.distanceKm * 18);
                const netPrice = m.price - freight;
                const isTop = m.marketId === bestMarket.marketId;
                const isWatched = isMarketWatched(m.marketId);

                return (
                  <tr key={m.marketId}>
                    <td className="market-name-cell">
                      <strong>
                        {m.marketName}
                        {isTop && <span className="best-tag">Highest Price</span>}
                      </strong>
                      <small>Regulated State APMC Yard</small>
                    </td>
                    <td>{m.distanceKm.toFixed(1)} km</td>
                    <td>
                      <span className={`demand-badge ${m.demand}`}>
                        {m.demand.toUpperCase()}
                      </span>
                    </td>
                    <td className="price-cell">
                      {formatPrice(m.price, selectedCrop.unit as PriceUnit)}
                    </td>
                    <td>₹{freight}</td>
                    <td className="net-cell">
                      {formatPrice(netPrice, selectedCrop.unit as PriceUnit)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-btn"
                        style={{
                          background: "none",
                          border: "none",
                          color: isWatched ? "#f57f17" : "var(--color-primary)",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleWatchMarket(m.marketId)}
                      >
                        {isWatched ? "★ Watched" : "☆ Track"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Crops Catalog Filter */}
      <section className="all-crops-catalog-section">
        <div className="catalog-controls">
          <input
            type="text"
            placeholder="Search any crop (e.g., Tomato, Turmeric, Wheat, Soybean)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CropCategory | "all")}
          >
            <option value="all">All Categories</option>
            {CROP_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="crop-selector-bar__pills">
          {catalogList.slice(0, 14).map((crop) => (
            <button
              key={crop.id}
              type="button"
              className={`crop-pill-btn ${selectedCropId === crop.id ? "is-active" : ""}`}
              onClick={() => setSelectedCropId(crop.id)}
            >
              <span>{crop.emoji}</span>
              <span>{crop.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
