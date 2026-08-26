"use client";

import type { Crop, FarmCrop, CropQuote } from "@/data/types";
import { growthStageLabel } from "@/context/AgriContext";
import { formatINR, formatPrice } from "@/lib/format";
import Badge from "@/components/common/Badge";
import CropImage from "./CropImage";
import "./FarmerCropCard.scss";

const GROWTH_STAGES = [
  "seedling",
  "sowing",
  "vegetative",
  "flowering",
  "fruiting",
  "maturity",
  "harvest",
] as const;

function stageIndex(stage: string): number {
  const idx = GROWTH_STAGES.indexOf(stage as (typeof GROWTH_STAGES)[number]);
  return idx === -1 ? 0 : idx;
}

function stageBadgeVariant(
  stage: string,
): "success" | "warning" | "info" | "neutral" | "danger" {
  if (stage === "harvest") return "success";
  if (stage === "maturity") return "warning";
  if (stage === "fruiting" || stage === "flowering") return "info";
  return "neutral";
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
  crop: Crop;
  farmCrop: FarmCrop;
  quote?: CropQuote;
  onEdit: () => void;
  onDelete: () => void;
  onOpenMarket: () => void;
};

function computeEstimatedProgress(farmCrop: FarmCrop): number {
  if (farmCrop.sowingDate && farmCrop.expectedHarvestDate) {
    const start = new Date(farmCrop.sowingDate).getTime();
    const end = new Date(farmCrop.expectedHarvestDate).getTime();
    const now = Date.now();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      if (now <= start) return 5;
      if (now >= end) return 100;
      return Math.min(98, Math.max(5, Math.round(((now - start) / (end - start)) * 100)));
    }
  }
  const currentStageIdx = stageIndex(farmCrop.growthStage);
  return Math.round(((currentStageIdx + 1) / GROWTH_STAGES.length) * 100);
}

export default function FarmerCropCard({
  crop,
  farmCrop,
  quote,
  onEdit,
  onDelete,
  onOpenMarket,
}: FarmerCropCardProps) {
  const currentStageIdx = stageIndex(farmCrop.growthStage);
  const progressPercent = computeEstimatedProgress(farmCrop);
  const estimatedValue = quote
    ? farmCrop.estimatedYield * quote.currentPrice
    : 0;
  const isHarvestReady =
    farmCrop.growthStage === "harvest" || farmCrop.daysToHarvest <= 0 || progressPercent >= 100;

  return (
    <article className="farmer-crop-card">
      {/* Card header */}
      <div className="farmer-crop-card__header">
        <div className="farmer-crop-card__image-wrap">
          <CropImage crop={crop} />
        </div>
        <div className="farmer-crop-card__title-group">
          <h3 className="farmer-crop-card__name">
            {crop.emoji} {crop.name}
          </h3>
          {farmCrop.variety && (
            <span className="farmer-crop-card__variety">{farmCrop.variety}</span>
          )}
          <Badge variant={stageBadgeVariant(farmCrop.growthStage)}>
            {growthStageLabel(farmCrop.growthStage)}
          </Badge>
        </div>
        {isHarvestReady && (
          <span
            className="farmer-crop-card__harvest-pill"
            aria-label="Harvest ready"
          >
            🌾 Ready
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
        <div className="farmer-crop-card__progress-track">
          <div
            className="farmer-crop-card__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="farmer-crop-card__stage-dots" aria-hidden="true">
          {GROWTH_STAGES.map((stage, idx) => (
            <span
              key={stage}
              className={`farmer-crop-card__stage-dot ${idx <= currentStageIdx ? "is-done" : ""} ${idx === currentStageIdx ? "is-current" : ""}`}
              title={growthStageLabel(stage)}
            />
          ))}
        </div>
        <div className="farmer-crop-card__stage-labels" aria-hidden="true">
          <span>Seedling</span>
          <span>Vegetative</span>
          <span>Harvest</span>
        </div>
      </div>

      {/* Details grid */}
      <dl className="farmer-crop-card__details">
        <div className="farmer-crop-card__detail-item">
          <dt>Area</dt>
          <dd>{farmCrop.areaAcres} acres</dd>
        </div>
        <div className="farmer-crop-card__detail-item">
          <dt>Yield</dt>
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
          <dd>{formatDate(farmCrop.expectedHarvestDate)}</dd>
        </div>
        {farmCrop.daysToHarvest > 0 && (
          <div className="farmer-crop-card__detail-item">
            <dt>Days to Harvest</dt>
            <dd>{farmCrop.daysToHarvest} days</dd>
          </div>
        )}
        <div className="farmer-crop-card__detail-item farmer-crop-card__detail-item--wide">
          <dt>Estimated Value</dt>
          <dd>
            {quote ? (
              <span className="farmer-crop-card__value">
                {formatINR(estimatedValue)}
                <small> · {formatPrice(quote.currentPrice, crop.unit)}</small>
              </span>
            ) : (
              <span className="farmer-crop-card__no-price">No market price yet</span>
            )}
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
        <button type="button" className="ghost-btn" onClick={onOpenMarket}>
          Market
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
  );
}
