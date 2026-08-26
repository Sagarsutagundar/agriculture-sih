"use client";

import { useState } from "react";
import type { Crop, CropHealthStatus, CropQuote, FarmCrop, GrowthStage } from "@/data/types";
import { growthStageLabel, useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { formatINR, formatPrice } from "@/lib/format";
import Badge from "@/components/common/Badge";
import CropImage from "./CropImage";
import FarmerCropDetailModal from "./FarmerCropDetailModal";
import "./FarmerCropCard.scss";

const LIFECYCLE_STAGES: GrowthStage[] = [
  "sowing",
  "germination",
  "vegetative",
  "flowering",
  "fruiting",
  "maturity",
  "harvest",
];

function stageIndex(stage: GrowthStage): number {
  if (stage === "seedling") return 1;
  const idx = LIFECYCLE_STAGES.indexOf(stage);
  return idx === -1 ? 0 : idx;
}

function statusBadgeVariant(
  status?: CropHealthStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "Healthy":
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

type FarmerCropCardProps = {
  crop?: Crop;
  farmCrop: FarmCrop;
  quote?: CropQuote;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenMarket?: (cropId: string) => void;
};

function computeEstimatedProgress(farmCrop: FarmCrop): number {
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
  const currentStageIdx = stageIndex(farmCrop.growthStage);
  return Math.round(((currentStageIdx + 1) / LIFECYCLE_STAGES.length) * 100);
}

export default function FarmerCropCard({
  crop: propCrop,
  farmCrop,
  quote,
  onEdit = () => {},
  onDelete = () => {},
  onOpenMarket = () => {},
}: FarmerCropCardProps) {
  const { updateCropStage, updateCropStatus, markCropHarvested } = useAgri();
  const [detailOpen, setDetailOpen] = useState(false);

  const crop =
    propCrop ||
    getCrop(farmCrop.cropId) || {
      id: farmCrop.cropId,
      name: farmCrop.customCropName || "Crop",
      emoji: "🌱",
      category: "vegetable" as const,
      samplePrice: 50,
      unit: "kg" as const,
      averageGrowthDays: { min: 60, max: 90 },
      harvestStage: "maturity",
    };

  const currentStageIdx = stageIndex(farmCrop.growthStage);
  const progressPercent = computeEstimatedProgress(farmCrop);
  const currentPrice = quote?.currentPrice ?? crop.samplePrice;
  const estimatedValue = farmCrop.estimatedYield * currentPrice;
  const areaUnit = farmCrop.areaUnit || "acres";

  const isHarvestReady =
    farmCrop.growthStage === "harvest" ||
    farmCrop.status === "Ready for Harvest" ||
    farmCrop.daysToHarvest <= 0;

  const isHarvested = farmCrop.status === "Harvested";

  return (
    <>
      <article className="farmer-crop-card">
        {/* Card header */}
        <div className="farmer-crop-card__header">
          <div className="farmer-crop-card__image-wrap">
            <CropImage crop={crop} />
          </div>
          <div className="farmer-crop-card__title-group">
            <div className="crop-title-badges">
              <h3 className="farmer-crop-card__name">
                {crop.emoji} {farmCrop.customCropName || crop.name}
              </h3>
            </div>
            {farmCrop.variety && (
              <span className="farmer-crop-card__variety">{farmCrop.variety}</span>
            )}
            <div className="badge-row">
              <Badge variant={statusBadgeVariant(farmCrop.status)}>
                {farmCrop.status || "Growing"}
              </Badge>
              <span className="stage-pill">
                {growthStageLabel(farmCrop.growthStage)}
              </span>
            </div>
          </div>

          {isHarvestReady && !isHarvested && (
            <span
              className="farmer-crop-card__harvest-pill"
              aria-label="Harvest ready"
            >
              🌾 Ready
            </span>
          )}

          {isHarvested && (
            <span className="farmer-crop-card__harvested-pill">
              ✓ Harvested
            </span>
          )}
        </div>

        {/* Stage progress bar */}
        <div
          className="farmer-crop-card__progress"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Growth progress: ${progressPercent}%`}
        >
          <div className="progress-label-row">
            <span>Lifecycle Progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="farmer-crop-card__progress-track">
            <div
              className="farmer-crop-card__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="farmer-crop-card__stage-dots" aria-hidden="true">
            {LIFECYCLE_STAGES.map((stage, idx) => (
              <span
                key={stage}
                className={`farmer-crop-card__stage-dot ${
                  idx <= currentStageIdx ? "is-done" : ""
                } ${idx === currentStageIdx ? "is-current" : ""}`}
                title={growthStageLabel(stage)}
              />
            ))}
          </div>
        </div>

        {/* Details grid */}
        <dl className="farmer-crop-card__details">
          <div className="farmer-crop-card__detail-item">
            <dt>Cultivated Area</dt>
            <dd>
              {farmCrop.areaAcres} {areaUnit}
            </dd>
          </div>
          <div className="farmer-crop-card__detail-item">
            <dt>Estimated Yield</dt>
            <dd>
              {farmCrop.estimatedYield} {crop.unit}
            </dd>
          </div>
          <div className="farmer-crop-card__detail-item">
            <dt>Sowing Date</dt>
            <dd>{formatDate(farmCrop.sowingDate)}</dd>
          </div>
          <div className="farmer-crop-card__detail-item">
            <dt>Expected Harvest</dt>
            <dd>
              {isHarvested ? "Completed" : formatDate(farmCrop.expectedHarvestDate)}
            </dd>
          </div>
          <div className="farmer-crop-card__detail-item farmer-crop-card__detail-item--wide">
            <dt>Current Estimated Crop Value</dt>
            <dd>
              <span className="farmer-crop-card__value">
                {formatINR(estimatedValue)}
                <small> · {formatPrice(currentPrice, crop.unit)}</small>
              </span>
            </dd>
          </div>
        </dl>

        {/* Status note */}
        {farmCrop.statusNote && (
          <p className="farmer-crop-card__status-note">
            <span aria-hidden="true">📋</span> {farmCrop.statusNote}
          </p>
        )}

        {/* Actions */}
        <div className="farmer-crop-card__actions">
          <button
            type="button"
            className="detail-btn"
            onClick={() => setDetailOpen(true)}
          >
            🔍 View Details
          </button>
          <button type="button" className="ghost-btn" onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={onDelete}
            aria-label={`Delete ${crop.name}`}
          >
            Delete
          </button>
        </div>
      </article>

      {/* Crop Detail Modal */}
      {detailOpen && (
        <FarmerCropDetailModal
          crop={crop}
          farmCrop={farmCrop}
          quote={quote}
          onClose={() => setDetailOpen(false)}
          onEdit={() => {
            setDetailOpen(false);
            onEdit();
          }}
          onDelete={() => {
            setDetailOpen(false);
            onDelete();
          }}
          onUpdateStage={(stage) => updateCropStage(farmCrop.id, stage)}
          onUpdateStatus={(status) => updateCropStatus(farmCrop.id, status)}
          onMarkHarvested={() => markCropHarvested(farmCrop.id)}
          onOpenMarket={() => {
            setDetailOpen(false);
            onOpenMarket(farmCrop.cropId);
          }}
        />
      )}
    </>
  );
}
