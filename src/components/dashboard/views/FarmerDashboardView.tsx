"use client";
import { useState } from "react";
import { useAgri, useFarmStats, growthStageLabel } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { formatINR } from "@/lib/format";
import type { FarmCrop, GrowthStage } from "@/data/types";
import FarmerCropCard from "../FarmerCropCard";
import FarmerCropForm from "../FarmerCropForm";
import "./FarmerDashboardView.scss";

const ALL_STAGES: { id: GrowthStage; label: string; icon: string }[] = [
  { id: "seedling", label: "Seedling", icon: "🌱" },
  { id: "sowing", label: "Sowing", icon: "🌰" },
  { id: "vegetative", label: "Vegetative", icon: "🌿" },
  { id: "flowering", label: "Flowering", icon: "🌸" },
  { id: "fruiting", label: "Fruiting", icon: "🍅" },
  { id: "maturity", label: "Maturity", icon: "🌾" },
  { id: "harvest", label: "Harvest", icon: "🚜" },
];

type FarmerDashboardViewProps = {
  onOpenCropMarket: (cropId: string) => void;
  onOpenProfile: () => void;
  onOpenCrops: () => void;
  onOpenMarkets: () => void;
  onOpenHealth: () => void;
};

export default function FarmerDashboardView({
  onOpenCropMarket,
  onOpenProfile,
  onOpenCrops,
  onOpenMarkets,
  onOpenHealth,
}: FarmerDashboardViewProps) {
  const {
    farmerProfile,
    farmCrops,
    quotes,
    addFarmCrop,
    updateFarmCrop,
    removeFarmCrop,
  } = useAgri();

  const { liveValue, cultivated } = useFarmStats();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<FarmCrop | null>(null);

  const profile = farmerProfile ?? {
    name: "Raj Kumar",
    phone: "9876543210",
    email: "raj.kumar@agri.in",
    state: "Maharashtra",
    district: "Nashik",
    location: "Dindori Taluka",
    farmSizeAcres: 10,
    farmingType: "organic" as const,
    irrigationType: "drip" as const,
    soilType: "black" as const,
  };

  const harvestReadyCount = farmCrops.filter(
    (c) => c.growthStage === "harvest" || c.daysToHarvest <= 0,
  ).length;

  const stageCounts = ALL_STAGES.reduce<Record<GrowthStage, number>>(
    (acc, st) => {
      acc[st.id] = farmCrops.filter((c) => c.growthStage === st.id).length;
      return acc;
    },
    {} as Record<GrowthStage, number>,
  );

  function handleSaveCrop(cropData: Omit<FarmCrop, "id">) {
    if (editingCrop) {
      updateFarmCrop(editingCrop.id, cropData);
    } else {
      addFarmCrop(cropData);
    }
    setEditingCrop(null);
    setFormOpen(false);
  }

  return (
    <div className="farmer-dashboard-view">
      {/* 1. Farmer Profile Summary Banner */}
      <section className="farmer-banner-card">
        <div className="farmer-banner-card__left">
          <div className="farmer-banner-card__avatar">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="farmer-banner-card__details">
            <h2>{profile.name}</h2>
            <p>
              📍 {profile.location ? `${profile.location}, ` : ""}
              {profile.district}, {profile.state}
            </p>
            <div className="farmer-banner-card__meta-pills">
              <span>🌾 {profile.farmSizeAcres} Acres</span>
              <span>
                🌿 {profile.farmingType.charAt(0).toUpperCase() + profile.farmingType.slice(1)} Farming
              </span>
              <span>
                💧 {profile.irrigationType.charAt(0).toUpperCase() + profile.irrigationType.slice(1)} Irrigation
              </span>
              <span>
                🌱 {profile.soilType.charAt(0).toUpperCase() + profile.soilType.slice(1)} Soil
              </span>
            </div>
          </div>
        </div>
        <div className="farmer-banner-card__actions">
          <button type="button" onClick={onOpenProfile}>
            ✏️ Edit Farm Profile
          </button>
        </div>
      </section>

      {/* 2. Farm Overview KPI Summary Cards */}
      <section className="farmer-kpi-grid">
        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">🗺️</div>
          <span className="farmer-kpi-card__label">Total Farm Area</span>
          <p className="farmer-kpi-card__value">{profile.farmSizeAcres} Acres</p>
          <span className="farmer-kpi-card__subtext">
            {cultivated.toFixed(1)} Acres under cultivation
          </span>
        </div>

        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">🌱</div>
          <span className="farmer-kpi-card__label">Active Crops</span>
          <p className="farmer-kpi-card__value">{farmCrops.length}</p>
          <span className="farmer-kpi-card__subtext">Across {farmCrops.length} plot zones</span>
        </div>

        <div className="farmer-kpi-card">
          <div className="farmer-kpi-card__icon">🚜</div>
          <span className="farmer-kpi-card__label">Harvest Ready</span>
          <p className="farmer-kpi-card__value">{harvestReadyCount}</p>
          <span className="farmer-kpi-card__subtext">
            {harvestReadyCount > 0 ? "Ready for market sale" : "Growing on schedule"}
          </span>
        </div>

        <div className="farmer-kpi-card">
          <span className="farmer-kpi-card__estimate-badge">Estimated</span>
          <div className="farmer-kpi-card__icon">💰</div>
          <span className="farmer-kpi-card__label">Farm Crop Value</span>
          <p className="farmer-kpi-card__value">{formatINR(liveValue)}</p>
          <span className="farmer-kpi-card__subtext">
            Based on APMC rates & yield
          </span>
        </div>
      </section>

      {/* 3. Crop Growth Pipeline Visual Progress */}
      <section className="growth-pipeline-card">
        <div className="growth-pipeline-card__header">
          <div>
            <h3>Crop Growth Stage Distribution</h3>
            <span>Live pipeline overview across all your cultivated fields</span>
          </div>
        </div>
        <div className="growth-pipeline-card__stages">
          {ALL_STAGES.map((stage) => {
            const count = stageCounts[stage.id];
            return (
              <div
                key={stage.id}
                className={`growth-pipeline-card__stage-item ${count > 0 ? "has-crops" : ""}`}
              >
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-name">{stage.label}</span>
                <span className="stage-count">{count} {count === 1 ? "crop" : "crops"}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Quick Actions Banner */}
      <section className="quick-actions-card">
        <div>
          <h3>⚡ Quick Management Actions</h3>
          <p>Instant shortcuts to manage crops, track mandi prices, and configure your farm</p>
        </div>
        <div className="quick-actions-card__buttons">
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setEditingCrop(null);
              setFormOpen(true);
            }}
          >
            + Add New Crop
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenCrops}>
            Manage Crops
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenMarkets}>
            Live Mandi Rates
          </button>
          <button type="button" className="ghost-btn" onClick={onOpenHealth}>
            Field Health
          </button>
        </div>
      </section>

      {/* 5. Smart Farmer Insights (Derived from active crops) */}
      {farmCrops.length > 0 && (
        <section className="dashboard-recommendation" style={{ marginTop: 0 }}>
          <div>
            <span className="dashboard-recommendation__label">💡 FARM INSIGHTS</span>
            <h2>Actionable Field Observations</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {farmCrops.map((fc) => {
                const cropMeta = getCrop(fc.cropId);
                const quote = quotes[fc.cropId];
                if (!cropMeta) return null;
                const isNearingHarvest = fc.daysToHarvest > 0 && fc.daysToHarvest <= 20;
                return (
                  <p key={fc.id} style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                    • <strong>{cropMeta.name}:</strong> Currently in{" "}
                    <strong>{growthStageLabel(fc.growthStage)}</strong> stage ({fc.areaAcres} acres).{" "}
                    {isNearingHarvest
                      ? `Approaching estimated harvest in ${fc.daysToHarvest} days.`
                      : fc.growthStage === "harvest"
                      ? "Harvest ready — check mandi prices below to schedule harvest sales."
                      : "Routine scouting and optimal irrigation recommended."}{" "}
                    {quote && (
                      <span>
                        Estimated Mandi Rate: ₹{quote.currentPrice}/{cropMeta.unit}{" "}
                        ({quote.trend === "rising" ? "📈 Rising" : quote.trend === "falling" ? "📉 Falling" : "➡️ Stable"}).
                      </span>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. Active Crops List */}
      <section className="farmer-crops-section">
        <div className="farmer-crops-section__header">
          <h3>Your Field Crops ({farmCrops.length})</h3>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setEditingCrop(null);
              setFormOpen(true);
            }}
          >
            + Add Crop
          </button>
        </div>

        {farmCrops.length === 0 ? (
          <div className="empty-crops-card">
            <span className="icon">🌱</span>
            <h4>No crops added to your farm yet</h4>
            <p>Start by adding your first cultivated crop to track growth and estimated value.</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setEditingCrop(null);
                setFormOpen(true);
              }}
            >
              Add First Crop
            </button>
          </div>
        ) : (
          <div className="farmer-crops-section__grid">
            {farmCrops.map((fc) => {
              const cropMeta = getCrop(fc.cropId);
              if (!cropMeta) return null;
              return (
                <FarmerCropCard
                  key={fc.id}
                  crop={cropMeta}
                  farmCrop={fc}
                  quote={quotes[fc.cropId]}
                  onEdit={() => {
                    setEditingCrop(fc);
                    setFormOpen(true);
                  }}
                  onDelete={() => {
                    if (window.confirm(`Are you sure you want to remove ${cropMeta.name} from your farm?`)) {
                      removeFarmCrop(fc.id);
                    }
                  }}
                  onOpenMarket={() => onOpenCropMarket(fc.cropId)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* 7. Relevant Crop Mandi Intelligence */}
      {farmCrops.length > 0 && (
        <section className="dashboard-market" style={{ marginTop: 0 }}>
          <div className="dashboard-market__header">
            <div>
              <span className="dashboard-market__label">COMMODITY RATES FOR YOUR CROPS</span>
              <h2>Estimated Mandi Rates & Opportunities</h2>
              <p>Real-time simulated APMC rates specifically matched to what you are growing.</p>
            </div>
            <button type="button" onClick={onOpenMarkets}>
              All Mandi Rates →
            </button>
          </div>
          <div className="dashboard-market__table">
            <div className="dashboard-market__row dashboard-market__row--header">
              <span>Crop & Mandi</span>
              <span>Estimated Rate</span>
              <span>Your Est. Crop Value</span>
              <span>Demand Status</span>
            </div>
            {farmCrops.map((fc) => {
              const cropMeta = getCrop(fc.cropId);
              const quote = quotes[fc.cropId];
              if (!cropMeta || !quote) return null;
              const bestMarket = quote.markets[0];
              const value = fc.estimatedYield * quote.currentPrice;
              return (
                <div key={fc.id} className="dashboard-market__row">
                  <div>
                    <strong>{cropMeta.emoji} {cropMeta.name}</strong>
                    <small style={{ display: "block", color: "var(--color-text-muted)" }}>
                      {bestMarket ? `${bestMarket.marketName} (${bestMarket.distanceKm.toFixed(1)} km)` : "Primary APMC"}
                    </small>
                  </div>
                  <span>₹{quote.currentPrice} / {cropMeta.unit}</span>
                  <strong style={{ color: "var(--color-primary-dark)" }}>{formatINR(value)}</strong>
                  <span className={quote.demand === "high" ? "risk--low" : "risk--medium"}>
                    {quote.demand.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Crop Modal Form */}
      {formOpen && (
        <FarmerCropForm
          initialCrop={editingCrop}
          onSave={handleSaveCrop}
          onClose={() => {
            setFormOpen(false);
            setEditingCrop(null);
          }}
        />
      )}
    </div>
  );
}
