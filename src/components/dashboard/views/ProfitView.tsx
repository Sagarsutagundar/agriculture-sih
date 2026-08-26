"use client";

import { useState } from "react";
import { useAgri } from "@/context/AgriContext";
import { formatINR, formatPrice } from "@/lib/format";
import "./ProfitView.scss";

export default function ProfitView({
  onOpenCrop = () => {},
}: {
  onOpenCrop?: (cropId: string) => void;
}) {
  const { farmCrops, profitSummary, quotes } = useAgri();

  // Active crop selector
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const activeAnalysis =
    profitSummary.cropAnalyses[selectedCropIndex] || profitSummary.cropAnalyses[0];

  if (!activeAnalysis) {
    return (
      <div className="profit-advisor-view">
        <header className="profit-header">
          <div className="profit-header__left">
            <span className="eyebrow">💰 PROFIT ADVISOR</span>
            <h1>Crop Profitability & Decision Support</h1>
            <p>No active crops currently planted on your farm.</p>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3>Add crops to your farm to unlock profit advisory insights</h3>
        </div>
      </div>
    );
  }

  // Calculate What-if regional premium scenario
  const regionalPremiumRevenue = Math.round(activeAnalysis.estimatedRevenue * 1.15);
  const regionalPremiumProfit = regionalPremiumRevenue - activeAnalysis.totalCost;
  const extraGain = regionalPremiumProfit - activeAnalysis.netProfit;

  return (
    <div className="profit-advisor-view">
      {/* Header */}
      <header className="profit-header">
        <div className="profit-header__left">
          <span className="eyebrow">
            <span>💰</span> AGRICULTURAL DECISION SUPPORT
          </span>
          <h1>Crop Profit Advisor & Cost Analyzer</h1>
          <p>
            Dynamic margin projections based on cultivated acreage, real-time APMC mandi modal
            rates, and university-benchmarked input cost models.
          </p>
        </div>

        <div className="profit-header__farm-badge">
          <small>Total Projected Farm Net Profit</small>
          <strong>{formatINR(profitSummary.totalNetProfit)}</strong>
          <span>Overall Margin: {profitSummary.overallMarginPercent}%</span>
        </div>
      </header>

      {/* Farm-wide KPI Grid */}
      <section className="profit-kpi-grid">
        <div className="profit-kpi-card">
          <small>Total Gross Projected Revenue</small>
          <strong>{formatINR(profitSummary.totalRevenue)}</strong>
          <span>Across {profitSummary.cropAnalyses.length} active cultivated plots</span>
        </div>

        <div className="profit-kpi-card">
          <small>Total Estimated Production Cost</small>
          <strong className="cost">{formatINR(profitSummary.totalCost)}</strong>
          <span>Includes seeds, labor, fertilizer, water & freight</span>
        </div>

        <div className="profit-kpi-card">
          <small>Top Earning Crop</small>
          <strong className="positive">
            {profitSummary.topEarningCrop
              ? `${profitSummary.topEarningCrop.cropEmoji} ${profitSummary.topEarningCrop.cropName}`
              : "N/A"}
          </strong>
          <span>
            {profitSummary.topEarningCrop
              ? `${formatINR(profitSummary.topEarningCrop.netProfit)} net`
              : "—"}
          </span>
        </div>

        <div className="profit-kpi-card">
          <small>Highest Margin Plot</small>
          <strong className="positive">
            {profitSummary.highestMarginCrop
              ? `${profitSummary.highestMarginCrop.profitMarginPercent}%`
              : "N/A"}
          </strong>
          <span>
            {profitSummary.highestMarginCrop
              ? `${profitSummary.highestMarginCrop.cropName} (${profitSummary.highestMarginCrop.areaAcres} Acres)`
              : "—"}
          </span>
        </div>
      </section>

      {/* Active Crop Selector Tabs */}
      <div className="crop-selector-bar">
        <div className="crop-selector-bar__top">
          <span>SELECT PLOT TO INSPECT COST BREAKDOWN</span>
          <small>Click to calculate specific plot economics</small>
        </div>
        <div className="crop-selector-bar__pills">
          {profitSummary.cropAnalyses.map((analysis, idx) => (
            <button
              key={analysis.farmCropId}
              type="button"
              className={`crop-pill-btn ${idx === selectedCropIndex ? "is-active" : ""}`}
              onClick={() => setSelectedCropIndex(idx)}
            >
              <span>{analysis.cropEmoji}</span>
              <span>{analysis.cropName}</span>
              <span className="crop-tag">{analysis.areaAcres} Ac</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Crop Analysis Card */}
      <section className="active-crop-analysis-card">
        <div className="active-crop-analysis-card__header">
          <div className="crop-title-row">
            <div className="crop-icon">{activeAnalysis.cropEmoji}</div>
            <div>
              <h2>
                {activeAnalysis.cropName}
                {activeAnalysis.variety && ` (${activeAnalysis.variety})`}
              </h2>
              <p>
                Cultivated Area: <strong>{activeAnalysis.areaAcres} Acres</strong> • Est. Total Yield:{" "}
                <strong>
                  {activeAnalysis.estimatedYield.toLocaleString("en-IN")}{" "}
                  {activeAnalysis.yieldUnit}
                </strong>{" "}
                • Mandi Rate:{" "}
                <strong>{formatPrice(activeAnalysis.marketPrice, activeAnalysis.yieldUnit)}</strong>
              </p>
            </div>
          </div>

          <div className="margin-pill">
            Profit Margin: {activeAnalysis.profitMarginPercent}%
          </div>
        </div>

        {/* 4 Pillars Formula */}
        <div className="profit-pillars-grid">
          <div className="pillar-box revenue-box">
            <small>Estimated Gross Revenue</small>
            <strong>{formatINR(activeAnalysis.estimatedRevenue)}</strong>
            <span className="formula-note">
              Yield ({activeAnalysis.estimatedYield.toLocaleString("en-IN")} {activeAnalysis.yieldUnit}) × Rate
            </span>
          </div>

          <div className="pillar-box cost-box">
            <small>Estimated Production Cost</small>
            <strong>{formatINR(activeAnalysis.totalCost)}</strong>
            <span className="formula-note">
              ₹{activeAnalysis.costPerUnit} / {activeAnalysis.yieldUnit} cost of cultivation
            </span>
          </div>

          <div className="pillar-box profit-box">
            <small>Estimated Net Profit</small>
            <strong>{formatINR(activeAnalysis.netProfit)}</strong>
            <span className="formula-note">Gross Revenue − Total Input Cost</span>
          </div>

          <div className="pillar-box margin-box">
            <small>Return on Investment (ROI)</small>
            <strong>{activeAnalysis.roiPercent}%</strong>
            <span className="formula-note">Net Profit ÷ Total Production Cost</span>
          </div>
        </div>

        {/* Cost Breakdown Details */}
        <div className="breakdown-section">
          <div className="breakdown-header">
            <h3>Itemized Production Cost Breakdown (Per Acre & Total)</h3>
            <span>Calibrated against State University Cost of Cultivation Standards</span>
          </div>

          <div className="cost-items-grid">
            {activeAnalysis.costBreakdown.map((item) => (
              <div key={item.category} className="cost-item-card">
                <div className="left">
                  <span className="icon">{item.icon}</span>
                  <span className="cat">{item.category}</span>
                </div>
                <div className="right">
                  <strong>{formatINR(item.amount)}</strong>
                  <small>{item.percentage}% of cost</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What-if Selling Scenario */}
        <div className="scenario-card">
          <div className="scenario-card__left">
            <h4>💡 Profit Optimization Advisory: Direct Exporter / High-Mandi Arbitrage</h4>
            <p>
              By grading this lot into A-Grade crates and delivering to a premium regional APMC,
              indicative rates rise by ~15%.
            </p>
          </div>
          <div className="scenario-pill">
            Potential Extra Gain: +{formatINR(extraGain)} (Total Profit: {formatINR(regionalPremiumProfit)})
          </div>
        </div>
      </section>

      {/* Farm Crops Comparison Table */}
      <section className="crops-profit-table-card">
        <h3>Farm-wide Plot Economics Comparison</h3>
        <p>Comparative summary across all currently active crops on your farm.</p>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Crop Plot</th>
                <th>Area</th>
                <th>Est. Yield</th>
                <th>Current Mandi Rate</th>
                <th>Gross Revenue</th>
                <th>Total Cost</th>
                <th>Net Profit</th>
                <th>Margin</th>
                <th>Market Intel</th>
              </tr>
            </thead>
            <tbody>
              {profitSummary.cropAnalyses.map((c) => (
                <tr key={c.farmCropId}>
                  <td>
                    <strong>
                      {c.cropEmoji} {c.cropName}
                    </strong>
                  </td>
                  <td>{c.areaAcres} Ac</td>
                  <td>
                    {c.estimatedYield.toLocaleString("en-IN")} {c.yieldUnit}
                  </td>
                  <td>{formatPrice(c.marketPrice, c.yieldUnit)}</td>
                  <td>{formatINR(c.estimatedRevenue)}</td>
                  <td style={{ color: "#c62828" }}>{formatINR(c.totalCost)}</td>
                  <td className="profit-val">{formatINR(c.netProfit)}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: c.profitMarginPercent >= 30 ? "#e8f5e9" : "#fff3e0",
                        color: c.profitMarginPercent >= 30 ? "#2e7d32" : "#ef6c00",
                      }}
                    >
                      {c.profitMarginPercent}%
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => onOpenCrop(c.cropId)}
                    >
                      View Mandis →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
