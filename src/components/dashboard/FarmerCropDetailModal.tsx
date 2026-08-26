"use client";

import { useMemo } from "react";
import type { Crop, CropHealthStatus, CropQuote, FarmCrop, GrowthStage } from "@/data/types";
import { growthStageLabel } from "@/context/AgriContext";
import { formatINR, formatPrice } from "@/lib/format";
import Badge from "@/components/common/Badge";
import CropImage from "./CropImage";
import "./FarmerCropDetailModal.scss";

const LIFECYCLE_STAGES: {
  id: GrowthStage;
  label: string;
  icon: string;
  description: string;
}[] = [
  { id: "sowing", label: "Sowing", icon: "🌰", description: "Seedbed prepared, seeds sown at optimal depth" },
  { id: "germination", label: "Germination", icon: "🌱", description: "First sprout emerges from soil surface" },
  { id: "vegetative", label: "Vegetative Growth", icon: "🌿", description: "Rapid canopy, leaf expansion & root development" },
  { id: "flowering", label: "Flowering", icon: "🌸", description: "Blossoms bloom; crucial pollination window" },
  { id: "fruiting", label: "Fruiting / Podding", icon: "🍅", description: "Fruit/grain set and expansion" },
  { id: "maturity", label: "Maturity", icon: "🌾", description: "Crop fills, hardens & reaches peak sugar/starch" },
  { id: "harvest", label: "Harvest Ready", icon: "🚜", description: "Optimal harvest window; ready for mandi dispatch" },
];

function stageIndex(stage: GrowthStage): number {
  if (stage === "seedling") return 1; // Map seedling to germination stage
  const idx = LIFECYCLE_STAGES.findIndex((s) => s.id === stage);
  return idx === -1 ? 0 : idx;
}

function statusBadgeVariant(
  status?: CropHealthStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "Healthy":
      return "success";
    case "Ready for Harvest":
      return "success";
    case "Growing":
      return "info";
    case "Needs Attention":
      return "warning";
    case "Harvested":
      return "neutral";
    default:
      return "info";
  }
}

function formatDate(isoDate?: string): string {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

type FarmerCropDetailModalProps = {
  crop: Crop;
  farmCrop: FarmCrop;
  quote?: CropQuote;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStage: (stage: GrowthStage) => void;
  onUpdateStatus: (status: CropHealthStatus) => void;
  onMarkHarvested: () => void;
  onOpenMarket: () => void;
};

export default function FarmerCropDetailModal({
  crop,
  farmCrop,
  quote,
  onClose,
  onEdit,
  onDelete,
  onUpdateStage,
  onUpdateStatus,
  onMarkHarvested,
  onOpenMarket,
}: FarmerCropDetailModalProps) {
  const currentStageIdx = stageIndex(farmCrop.growthStage);
  const currentStageMeta = LIFECYCLE_STAGES[currentStageIdx] || LIFECYCLE_STAGES[0];

  // Calculate dynamic progress percent
  const progressPercent = useMemo(() => {
    if (farmCrop.growthStage === "harvest" || farmCrop.status === "Harvested") return 100;
    if (farmCrop.sowingDate && farmCrop.expectedHarvestDate) {
      const start = new Date(farmCrop.sowingDate).getTime();
      const end = new Date(farmCrop.expectedHarvestDate).getTime();
      const now = Date.now();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        if (now <= start) return 5;
        if (now >= end) return 98;
        return Math.min(98, Math.max(5, Math.round(((now - start) / (end - start)) * 100)));
      }
    }
    return Math.round(((currentStageIdx + 1) / LIFECYCLE_STAGES.length) * 100);
  }, [farmCrop, currentStageIdx]);

  const currentPrice = quote?.currentPrice ?? crop.samplePrice;
  const estimatedTotalValue = farmCrop.estimatedYield * currentPrice;
  const areaUnit = farmCrop.areaUnit || "acres";
  const yieldPerUnit =
    farmCrop.areaAcres > 0
      ? (farmCrop.estimatedYield / farmCrop.areaAcres).toFixed(1)
      : "—";

  const nextStage =
    currentStageIdx < LIFECYCLE_STAGES.length - 1
      ? LIFECYCLE_STAGES[currentStageIdx + 1]
      : null;

  return (
    <div className="crop-detail-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="crop-detail-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-crop-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="crop-detail-modal-header">
          <div className="crop-detail-modal-header__info">
            <div className="crop-detail-modal-header__thumb">
              <CropImage crop={crop} />
            </div>
            <div>
              <div className="title-row">
                <h2 id="modal-crop-title">
                  {crop.emoji} {crop.name}
                </h2>
                <Badge variant={statusBadgeVariant(farmCrop.status)}>
                  {farmCrop.status || "Growing"}
                </Badge>
              </div>
              <p className="crop-subline">
                {farmCrop.variety ? `${farmCrop.variety} · ` : ""}
                {farmCrop.areaAcres} {areaUnit} cultivated · Category: {crop.category}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="crop-detail-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <div className="crop-detail-modal-body">
          {/* 1. Interactive Lifecycle Timeline */}
          <section className="crop-detail-section">
            <div className="section-title-wrap">
              <h3>🌾 Crop Lifecycle & Growth Timeline</h3>
              <span className="progress-indicator-pill">
                Progress: <strong>{progressPercent}%</strong>
              </span>
            </div>

            {/* Stepper track */}
            <div className="lifecycle-track-wrapper">
              <div
                className="lifecycle-track-fill"
                style={{
                  width: `${Math.min(
                    100,
                    (currentStageIdx / (LIFECYCLE_STAGES.length - 1)) * 100,
                  )}%`,
                }}
              />
              <div className="lifecycle-nodes">
                {LIFECYCLE_STAGES.map((st, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      className={`lifecycle-node ${isDone ? "is-done" : ""} ${
                        isCurrent ? "is-current" : ""
                      }`}
                      onClick={() => onUpdateStage(st.id)}
                      title={`Switch to ${st.label}`}
                    >
                      <span className="node-icon">{st.icon}</span>
                      <span className="node-label">{st.label}</span>
                      {isCurrent && <span className="node-current-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Stage Card */}
            <div className="current-stage-card">
              <div className="current-stage-card__header">
                <div>
                  <span className="stage-eyebrow">CURRENT ACTIVE STAGE</span>
                  <h4>
                    {currentStageMeta.icon} {currentStageMeta.label}
                  </h4>
                </div>
                {nextStage && (
                  <button
                    type="button"
                    className="advance-stage-btn"
                    onClick={() => onUpdateStage(nextStage.id)}
                  >
                    Advance to {nextStage.label} →
                  </button>
                )}
              </div>
              <p>{currentStageMeta.description}</p>
            </div>
          </section>

          {/* 2. Key Metrics Grid */}
          <section className="crop-detail-section">
            <h3>📊 Cultivation & Harvest Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Cultivated Area</span>
                <strong className="metric-value">
                  {farmCrop.areaAcres} {areaUnit}
                </strong>
                <small className="metric-hint">Active plot footprint</small>
              </div>

              <div className="metric-box">
                <span className="metric-label">Expected Total Yield</span>
                <strong className="metric-value">
                  {farmCrop.estimatedYield} {crop.unit}
                </strong>
                <small className="metric-hint">
                  ~{yieldPerUnit} {crop.unit} / {areaUnit}
                </small>
              </div>

              <div className="metric-box">
                <span className="metric-label">Sowing Date</span>
                <strong className="metric-value">
                  {formatDate(farmCrop.sowingDate)}
                </strong>
                <small className="metric-hint">Planted in field</small>
              </div>

              <div className="metric-box">
                <span className="metric-label">Expected Harvest</span>
                <strong className="metric-value">
                  {formatDate(farmCrop.expectedHarvestDate)}
                </strong>
                <small className="metric-hint">
                  {farmCrop.daysToHarvest > 0
                    ? `${farmCrop.daysToHarvest} days remaining`
                    : "Harvest window reached"}
                </small>
              </div>
            </div>
          </section>

          {/* 3. Valuation & Market Intelligence */}
          <section className="crop-detail-section">
            <h3>💰 Dynamic Crop Valuation</h3>
            <div className="valuation-card">
              <div className="valuation-card__left">
                <span className="val-label">Estimated Current Market Value</span>
                <div className="val-number">{formatINR(estimatedTotalValue)}</div>
                <div className="val-formula">
                  Calculation: {farmCrop.estimatedYield} {crop.unit} ×{" "}
                  {formatPrice(currentPrice, crop.unit)}
                </div>
                <span className="val-source">
                  Benchmark Source:{" "}
                  {quote
                    ? "Live APMC Simulated Feed"
                    : "Seasonal APMC Mandi Benchmark"}
                </span>
              </div>
              <div className="valuation-card__right">
                <button
                  type="button"
                  className="open-market-btn"
                  onClick={onOpenMarket}
                >
                  View Mandi Comparison →
                </button>
              </div>
            </div>
          </section>

          {/* 4. Crop Health Status Controller */}
          <section className="crop-detail-section">
            <h3>🩺 Crop Condition & Field Notes</h3>
            <div className="status-controller-row">
              <label>Field Condition Status:</label>
              <div className="status-pills">
                {(
                  [
                    "Growing",
                    "Healthy",
                    "Needs Attention",
                    "Ready for Harvest",
                    "Harvested",
                  ] as CropHealthStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`status-pill-btn ${
                      farmCrop.status === st ? "is-selected" : ""
                    } is-${st.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => onUpdateStatus(st)}
                  >
                    {st === "Healthy" && "✓ "}
                    {st === "Needs Attention" && "⚠️ "}
                    {st === "Ready for Harvest" && "🌾 "}
                    {st === "Harvested" && "📦 "}
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {farmCrop.statusNote && (
              <div className="field-note-box">
                <strong>Field Observation:</strong>
                <p>{farmCrop.statusNote}</p>
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer Actions */}
        <footer className="crop-detail-modal-footer">
          <div className="footer-left">
            <button
              type="button"
              className="danger-btn"
              onClick={onDelete}
            >
              🗑️ Delete Crop
            </button>
          </div>

          <div className="footer-right">
            {farmCrop.growthStage !== "harvest" && farmCrop.status !== "Harvested" && (
              <button
                type="button"
                className="harvest-btn"
                onClick={onMarkHarvested}
              >
                🌾 Mark as Harvested
              </button>
            )}
            <button type="button" className="ghost-btn" onClick={onEdit}>
              ✏️ Edit Crop Details
            </button>
            <button type="button" className="primary-btn" onClick={onClose}>
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
