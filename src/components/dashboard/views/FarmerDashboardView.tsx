"use client";

import { useMemo, useState } from "react";
import { useAgri, useFarmStats, growthStageLabel } from "@/context/AgriContext";
import { formatINR, formatPrice } from "@/lib/format";
import type { FarmCrop, PriceUnit } from "@/data/types";
import FarmerCropCard from "../FarmerCropCard";
import FarmerCropForm from "../FarmerCropForm";
import "./FarmerDashboardView.scss";

type FarmerDashboardViewProps = {
  onOpenCropMarket?: (cropId: string) => void;
  onOpenProfile?: () => void;
  onOpenCrops?: () => void;
  onOpenMarkets?: () => void;
  onOpenHealth?: () => void;
  onOpenProfit?: () => void;
  onOpenBuyers?: () => void;
  onOpenAlerts?: () => void;
};

export default function FarmerDashboardView({
  onOpenCropMarket = () => {},
  onOpenProfile = () => {},
  onOpenCrops = () => {},
  onOpenMarkets = () => {},
  onOpenHealth = () => {},
  onOpenProfit = () => {},
  onOpenBuyers = () => {},
  onOpenAlerts = () => {},
}: FarmerDashboardViewProps) {
  const {
    farmerProfile,
    profileCompletion,
    farmCrops,
    totalFarmAcres,
    addFarmCrop,
    updateCropStage,
    quotes,
    profitSummary,
    healthDiagnostics,
    buyerMatches,
    smartAlerts,
    dismissSmartAlert,
    lastTickAt,
    isLiveGovernmentData,
  } = useAgri();

  const { farmValueSummary, cultivated, cultivationPercent } = useFarmStats();
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);

  // Top critical or important alert to surface immediately in command ticker
  const topAlert = smartAlerts[0];

  // Pipeline growth stages breakdown
  const stageDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      sowing: 0,
      germination: 0,
      vegetative: 0,
      flowering: 0,
      fruiting: 0,
      maturity: 0,
      harvest: 0,
    };
    farmCrops.forEach((c) => {
      const s = c.growthStage === "seedling" ? "germination" : c.growthStage;
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [farmCrops]);

  // Primary active crop for spot intelligence preview
  const primaryCrop = farmCrops[0];
  const primaryQuote = primaryCrop ? quotes[primaryCrop.cropId] : undefined;
  const primaryHealth = healthDiagnostics[0];
  const primaryProfit = profitSummary.cropAnalyses[0];
  const topBuyerMatch = buyerMatches[0];

  function handleSaveNewCrop(cropData: Omit<FarmCrop, "id">) {
    addFarmCrop(cropData);
    setIsAddCropModalOpen(false);
  }

  return (
    <div className="farmer-dashboard-view">
      {/* 1. FARMER PROFILE BANNER */}
      <section className="farmer-banner-card">
        <div className="farmer-banner-card__left">
          <div className="farmer-banner-card__avatar">
            {farmerProfile.avatar || "👨🏽‍🌾"}
          </div>

          <div className="farmer-banner-card__details">
            <div className="farmer-banner-card__name-row">
              <h2>{farmerProfile.name || "Farmer"}</h2>
              <span className="profile-badge">
                {profileCompletion}% Profile Completed
              </span>
            </div>

            <p>
              📍 {farmerProfile.location || "Farm Location"}, {farmerProfile.district},{" "}
              {farmerProfile.state}
            </p>

            <div className="farmer-banner-card__meta-pills">
              <span>🌾 {totalFarmAcres} Total Acres</span>
              <span>💧 {farmerProfile.irrigationType.toUpperCase()} Irrigation</span>
              <span>🟤 {farmerProfile.soilType.toUpperCase()} Soil</span>
              <span>🌿 {farmerProfile.farmingType.toUpperCase()} Farming</span>
            </div>
          </div>
        </div>

        <div className="farmer-banner-card__actions">
          <button type="button" onClick={onOpenProfile}>
            ⚙️ Edit Farm Setup
          </button>
        </div>
      </section>

      {/* 2. COMMAND CENTER ALERT TICKER (SURFACE CRITICAL FIRST) */}
      {topAlert && (
        <section
          className={`command-alert-ticker ${
            topAlert.priority === "critical"
              ? "crit"
              : topAlert.priority === "important"
              ? "imp"
              : "info"
          }`}
        >
          <div className="ticker-left">
            <span className="ticker-badge">
              {topAlert.priority === "critical"
                ? "🔴 CRITICAL ACTION REQUIRED"
                : topAlert.priority === "important"
                ? "🟠 IMPORTANT NOTICE"
                : "🔵 INFORMATIONAL NOTICE"}
            </span>
            <strong>{topAlert.title}</strong>
            <p>{topAlert.message}</p>
          </div>

          <div className="ticker-actions">
            {topAlert.actionLabel && (
              <button
                type="button"
                className="ticker-action-btn"
                onClick={() => {
                  if (topAlert.relatedCropId && topAlert.type === "market") {
                    onOpenCropMarket(topAlert.relatedCropId);
                  } else if (topAlert.actionView === "health") {
                    onOpenHealth();
                  } else if (topAlert.actionView === "buyers") {
                    onOpenBuyers();
                  } else {
                    onOpenAlerts();
                  }
                }}
              >
                {topAlert.actionLabel} →
              </button>
            )}
            <button
              type="button"
              className="ticker-all-btn"
              onClick={onOpenAlerts}
            >
              View All Alerts ({smartAlerts.length})
            </button>
          </div>
        </section>
      )}

      {/* 3. QUICK ACTIONS BAR */}
      <section className="quick-actions-card">
        <div>
          <h3>Quick Farm Actions</h3>
          <p>Instant shortcuts to manage plots, scout health, and analyze pricing</p>
        </div>

        <div className="quick-actions-card__buttons">
          <button
            type="button"
            className="primary-btn"
            onClick={() => setIsAddCropModalOpen(true)}
          >
            + Add New Crop Plot
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenMarkets}>
            📊 Market Intelligence
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenProfit}>
            💰 Profit Advisor
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenHealth}>
            🩺 Crop Health Monitor
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenBuyers}>
            🤝 Buyer Network ({buyerMatches.length})
          </button>
        </div>
      </section>

      {/* 4. FARM OVERVIEW KPI GRID */}
      <section className="farmer-kpi-grid">
        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">🗺️</div>
          <span className="farmer-kpi-card__label">Cultivated Land</span>
          <p className="farmer-kpi-card__value">{cultivated} Acres</p>
          <span className="farmer-kpi-card__subtext">
            {cultivationPercent}% of {totalFarmAcres} total farm acres
          </span>
        </div>

        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">🌱</div>
          <span className="farmer-kpi-card__label">Active Crop Plots</span>
          <p className="farmer-kpi-card__value">{farmCrops.length} Crops</p>
          <span className="farmer-kpi-card__subtext">
            Under active stage monitoring
          </span>
        </div>

        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">💰</div>
          <span className="farmer-kpi-card__label">Projected Net Profit</span>
          <p className="farmer-kpi-card__value" style={{ color: "#2e7d32" }}>
            {formatINR(profitSummary.totalNetProfit)}
          </p>
          <span className="farmer-kpi-card__subtext">
            {profitSummary.overallMarginPercent}% overall profit margin
          </span>
        </div>

        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">🤝</div>
          <span className="farmer-kpi-card__label">Matching Buyers</span>
          <p className="farmer-kpi-card__value" style={{ color: "#1565c0" }}>
            {buyerMatches.length} Direct
          </p>
          <span className="farmer-kpi-card__subtext">
            Institutional & local procurement
          </span>
        </div>
      </section>

      {/* 5. DUAL INTELLIGENCE ROW: CROP HEALTH & MARKET INTELLIGENCE SNAPSHOT */}
      <div className="intel-split-grid">
        {/* Crop Health Monitor Snapshot */}
        <section className="dashboard-intel-card">
          <div className="dashboard-intel-card__header">
            <div>
              <span className="eyebrow">🩺 CROP HEALTH MONITOR</span>
              <h3>Field Scouting & Telemetry Snapshot</h3>
            </div>
            <button type="button" className="text-link-btn" onClick={onOpenHealth}>
              View All ({healthDiagnostics.length}) →
            </button>
          </div>

          {primaryHealth ? (
            <div className="dashboard-intel-card__body">
              <div className="preview-top-row">
                <div className="left">
                  <span className="emoji-circle">{primaryHealth.cropEmoji}</span>
                  <div>
                    <strong>{primaryHealth.cropName}</strong>
                    <small>
                      {growthStageLabel(primaryHealth.growthStage)} Stage •{" "}
                      {primaryHealth.lastInspection}
                    </small>
                  </div>
                </div>
                <div
                  className={`status-pill ${
                    primaryHealth.status === "Healthy" ? "healthy" : "attention"
                  }`}
                >
                  ● {primaryHealth.status} ({primaryHealth.healthScore}/100)
                </div>
              </div>

              <p className="summary-text">{primaryHealth.summary}</p>

              {primaryHealth.recommendations[0] && (
                <div className="rec-preview-box">
                  <span className="rec-badge">
                    {primaryHealth.recommendations[0].urgency}
                  </span>
                  <strong>{primaryHealth.recommendations[0].action}</strong>
                  <p>{primaryHealth.recommendations[0].detail}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No health diagnostics recorded yet.</p>
          )}
        </section>

        {/* Market Intelligence Snapshot */}
        <section className="dashboard-intel-card">
          <div className="dashboard-intel-card__header">
            <div>
              <span className="eyebrow">📊 MARKET INTELLIGENCE</span>
              <h3>APMC Mandi Modal Benchmark</h3>
            </div>
            <button type="button" className="text-link-btn" onClick={onOpenMarkets}>
              Compare Mandis →
            </button>
          </div>

          {primaryCrop && primaryQuote ? (
            <div className="dashboard-intel-card__body">
              <div className="preview-top-row">
                <div className="left">
                  <span className="emoji-circle">
                    {primaryProfit?.cropEmoji || "🌾"}
                  </span>
                  <div>
                    <strong>{primaryCrop.customCropName || primaryCrop.cropId.toUpperCase()}</strong>
                    <small>Regional Benchmark • Modal APMC Rate</small>
                  </div>
                </div>
                <div className="price-display-pill">
                  <strong>{formatPrice(primaryQuote.currentPrice, primaryProfit?.yieldUnit || "kg")}</strong>
                  <span className={primaryQuote.currentPrice >= primaryQuote.previousPrice ? "up" : "down"}>
                    {primaryQuote.currentPrice >= primaryQuote.previousPrice ? "↑" : "↓"}{" "}
                    {Math.abs(primaryQuote.currentPrice - primaryQuote.previousPrice)}
                  </span>
                </div>
              </div>

              <div className="mandi-best-pill">
                <span>Best Available Mandi:</span>
                <strong>
                  {primaryQuote.markets[0]?.marketName || "APMC Belagavi"} (
                  {formatINR(primaryQuote.markets[0]?.price || primaryQuote.currentPrice)})
                </strong>
              </div>

              <div className="quick-action-strip">
                <span>Regional Demand: <strong>{primaryQuote.demand.toUpperCase()}</strong></span>
                <button
                  type="button"
                  className="intel-sub-btn"
                  onClick={() => onOpenCropMarket(primaryCrop.cropId)}
                >
                  View Historical Trend →
                </button>
              </div>
            </div>
          ) : (
            <p>Market rates initializing...</p>
          )}
        </section>
      </div>

      {/* 6. DUAL INTELLIGENCE ROW: PROFIT ADVISOR & BUYER MATCHING */}
      <div className="intel-split-grid">
        {/* Profit Advisor Snapshot */}
        <section className="dashboard-intel-card">
          <div className="dashboard-intel-card__header">
            <div>
              <span className="eyebrow">💰 PROFIT ADVISOR</span>
              <h3>Crop Economics & Net Margin</h3>
            </div>
            <button type="button" className="text-link-btn" onClick={onOpenProfit}>
              Full Breakdown →
            </button>
          </div>

          {primaryProfit ? (
            <div className="dashboard-intel-card__body">
              <div className="preview-top-row">
                <div className="left">
                  <span className="emoji-circle">{primaryProfit.cropEmoji}</span>
                  <div>
                    <strong>{primaryProfit.cropName}</strong>
                    <small>{primaryProfit.areaAcres} Acres Cultivated</small>
                  </div>
                </div>
                <div className="profit-badge-pill">
                  Margin: {primaryProfit.profitMarginPercent}%
                </div>
              </div>

              <div className="profit-formula-strip">
                <div>
                  <small>Est. Revenue</small>
                  <strong>{formatINR(primaryProfit.estimatedRevenue)}</strong>
                </div>
                <span className="op">−</span>
                <div>
                  <small>Input Costs</small>
                  <strong style={{ color: "#d32f2f" }}>{formatINR(primaryProfit.totalCost)}</strong>
                </div>
                <span className="op">=</span>
                <div>
                  <small>Net Profit</small>
                  <strong style={{ color: "#2e7d32" }}>{formatINR(primaryProfit.netProfit)}</strong>
                </div>
              </div>

              <div className="cost-tags-row">
                {primaryProfit.costBreakdown.slice(0, 3).map((cb) => (
                  <span key={cb.category} className="mini-cost-tag">
                    {cb.icon} {cb.category}: {formatINR(cb.amount)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p>Calculate plot economics by adding a crop.</p>
          )}
        </section>

        {/* Buyer Network Snapshot */}
        <section className="dashboard-intel-card">
          <div className="dashboard-intel-card__header">
            <div>
              <span className="eyebrow">🤝 BUYER NETWORK</span>
              <h3>Algorithmic Demand Match</h3>
            </div>
            <button type="button" className="text-link-btn" onClick={onOpenBuyers}>
              Browse All ({buyerMatches.length}) →
            </button>
          </div>

          {topBuyerMatch ? (
            <div className="dashboard-intel-card__body">
              <div className="preview-top-row">
                <div className="left">
                  <span className="emoji-circle">💼</span>
                  <div>
                    <strong>{topBuyerMatch.buyer.name}</strong>
                    <small>{topBuyerMatch.buyer.type} • {topBuyerMatch.buyer.distanceKm} km</small>
                  </div>
                </div>
                <div className="match-score-pill">
                  ★ {topBuyerMatch.matchPercentage}% Match
                </div>
              </div>

              <div className="buyer-match-note">
                <strong>Requirement:</strong> {topBuyerMatch.buyer.requiredQuantity} {topBuyerMatch.buyer.quantityUnit} of {topBuyerMatch.matchedCropName} at ₹{topBuyerMatch.buyer.indicativePrice.toLocaleString("en-IN")}
              </div>

              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>
                {topBuyerMatch.matchReason}
              </p>

              <button
                type="button"
                className="action-connect-btn"
                onClick={onOpenBuyers}
              >
                Send Harvest Quote to Buyer →
              </button>
            </div>
          ) : (
            <p>No direct buyer matches found for current crops.</p>
          )}
        </section>
      </div>

      {/* DYNAMIC CURRENT CROP VALUE SECTION */}
      <section className="current-crop-value-card">
        <div className="current-crop-value-card__header">
          <div>
            <div className="badge-row">
              <span className="tag">MARKET BENCHMARK VALUATION</span>
              <span className="mock-badge">
                ● {isLiveGovernmentData ? "Live APMC Data" : "Simulated Benchmark"}
              </span>
            </div>
            <h2>Estimated Current Farm Crop Value</h2>
            <p>
              Calculated dynamically: <code>Plot Area × Estimated Yield × APMC Mandi Rate</code>
            </p>
          </div>

          <div className="total-value-display">
            <small>Total Estimated Farm Value</small>
            <strong>{formatINR(farmValueSummary.totalValue)}</strong>
            <span>
              {farmValueSummary.valueDelta >= 0 ? "+" : ""}
              {formatINR(farmValueSummary.valueDelta)} vs baseline
            </span>
          </div>
        </div>

        <div className="crop-value-table">
          <div className="crop-value-table__header">
            <span>Crop Plot</span>
            <span>Area</span>
            <span>Est. Yield</span>
            <span>Benchmark Rate</span>
            <span>Estimated Value</span>
            <span>Market Intel</span>
          </div>
          {farmValueSummary.cropBreakdowns.map((b) => (
            <div key={b.farmCropId} className="crop-value-table__row">
              <div className="crop-cell">
                <strong>{b.cropEmoji} {b.cropName}</strong>
                {b.variety && <small>{b.variety}</small>}
              </div>
              <span>{b.areaAcres} {b.areaUnit}</span>
              <span>{b.estimatedYield.toLocaleString("en-IN")} {b.yieldUnit}</span>
              <span>{formatPrice(b.marketPrice, b.yieldUnit)}</span>
              <strong className="value-cell">{formatINR(b.totalValue)}</strong>
              <div>
                <button
                  type="button"
                  className="table-link-btn"
                  onClick={() => onOpenCropMarket(b.cropId)}
                >
                  View Mandis →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. GROWTH STAGES LIFECYCLE PIPELINE */}
      <section className="growth-pipeline-card">
        <div className="growth-pipeline-card__header">
          <div>
            <h3>Farm Growth Stage Pipeline</h3>
            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Distribution of your {farmCrops.length} plots across the 7 lifecycle phases
            </span>
          </div>
        </div>

        <div className="growth-pipeline-card__stages">
          {[
            { id: "sowing", label: "Sowing", icon: "🌰" },
            { id: "germination", label: "Germination", icon: "🌱" },
            { id: "vegetative", label: "Vegetative", icon: "🌿" },
            { id: "flowering", label: "Flowering", icon: "🌸" },
            { id: "fruiting", label: "Fruiting", icon: "🍅" },
            { id: "maturity", label: "Maturity", icon: "🌾" },
            { id: "harvest", label: "Harvest", icon: "🚜" },
          ].map((stage) => {
            const count = stageDistribution[stage.id] || 0;
            return (
              <div
                key={stage.id}
                className={`growth-pipeline-card__stage-item ${count > 0 ? "has-crops" : ""}`}
              >
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-name">{stage.label}</span>
                <span className="stage-count">{count} Plots</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. ACTIVE CROP PLOTS GRID */}
      <section className="farmer-crops-section">
        <div className="farmer-crops-section__header">
          <div>
            <h3>Active Farm Plots ({farmCrops.length})</h3>
            <p>Manage lifecycle stages, observe field conditions, and track harvest timelines</p>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setIsAddCropModalOpen(true)}
          >
            + Add New Crop
          </button>
        </div>

        <div className="farmer-crops-section__grid">
          {farmCrops.map((crop) => (
            <FarmerCropCard
              key={crop.id}
              farmCrop={crop}
              onOpenMarket={onOpenCropMarket}
            />
          ))}
        </div>
      </section>

      {/* Add Crop Modal */}
      {isAddCropModalOpen && (
        <FarmerCropForm
          onSave={handleSaveNewCrop}
          onClose={() => setIsAddCropModalOpen(false)}
        />
      )}
    </div>
  );
}
