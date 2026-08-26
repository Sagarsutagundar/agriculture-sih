"use client";

import type { Crop, FarmCrop, CropQuote } from "@/data/types";
import { formatINR, formatPrice } from "@/lib/format";
import { categoryMeta } from "@/services/cropService";
import { growthStageLabel } from "@/context/AgriContext";
import CropImage from "./CropImage";

type CropCardProps = {
  crop: Crop;
  farmCrop: FarmCrop;
  quote?: CropQuote;
  flashing?: "up" | "down";
  onEdit: () => void;
  onDelete: () => void;
  onOpenMarket: () => void;
};

export default function CropCard({
  crop,
  farmCrop,
  quote,
  flashing,
  onEdit,
  onDelete,
  onOpenMarket,
}: CropCardProps) {
  const value = quote ? farmCrop.estimatedYield * quote.currentPrice : 0;
  const previous = quote ? farmCrop.estimatedYield * quote.previousPrice : 0;
  const delta = value - previous;

  return (
    <article className={`farm-crop-card ${flashing ? `is-flash-${flashing}` : ""}`}>
      <CropImage crop={crop} />
      <div>
        <h3>
          {crop.emoji} {crop.name}
        </h3>
        <small>{categoryMeta(crop.category)?.label}</small>
        <ul>
          <li>Area: {farmCrop.areaAcres} acres</li>
          <li>
            Yield: {farmCrop.estimatedYield} {crop.unit}
          </li>
          <li>Stage: {growthStageLabel(farmCrop.growthStage)}</li>
          <li>Harvest in {farmCrop.daysToHarvest} days</li>
          <li>
            Market: {quote ? formatPrice(quote.currentPrice, crop.unit) : "—"}
          </li>
          <li>
            Estimated crop value: <strong>{formatINR(value)}</strong>
          </li>
        </ul>
        {delta !== 0 && (
          <p className={delta > 0 ? "price-up" : "price-down"}>
            {delta > 0 ? "↑" : "↓"} Estimated revenue {delta > 0 ? "increased" : "decreased"} by{" "}
            {formatINR(Math.abs(delta))}
          </p>
        )}
        <div className="card-actions">
          <button type="button" onClick={onOpenMarket}>
            Market
          </button>
          <button type="button" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="danger-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
