"use client";

import { useMemo, useState } from "react";
import { CROP_CATEGORIES } from "@/data/categories";
import type { Crop, CropCategory, FarmCrop, GrowthStage } from "@/data/types";
import { searchCrops, growthDurationLabel, categoryMeta, getCrop } from "@/services/cropService";
import { formatPrice } from "@/lib/format";
import { useAgri } from "@/context/AgriContext";
import CropImage from "./CropImage";

const STAGES: GrowthStage[] = [
  "sowing",
  "vegetative",
  "flowering",
  "maturity",
  "harvest",
];

type CropSelectorProps = {
  onClose: () => void;
  editing?: FarmCrop | null;
};

export default function CropSelector({ onClose, editing }: CropSelectorProps) {
  const { quotes, addFarmCrop, updateFarmCrop } = useAgri();
  const [step, setStep] = useState<1 | 2 | 3>(editing ? 3 : 1);
  const [category, setCategory] = useState<CropCategory | "all">(
    "all",
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Crop | null>(null);
  const [areaAcres, setAreaAcres] = useState(editing?.areaAcres ?? 1);
  const [estimatedYield, setEstimatedYield] = useState(
    editing?.estimatedYield ?? 100,
  );
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    editing?.growthStage ?? "vegetative",
  );
  const [daysToHarvest, setDaysToHarvest] = useState(
    editing?.daysToHarvest ?? 30,
  );

  const crops = useMemo(
    () => searchCrops(query, category),
    [query, category],
  );

  function chooseCrop(crop: Crop) {
    setSelected(crop);
    setEstimatedYield(crop.unit === "quintal" ? 40 : 1000);
    setDaysToHarvest(Math.round((crop.averageGrowthDays.min + crop.averageGrowthDays.max) / 4));
    setStep(3);
  }

  function save() {
    const cropId = editing?.cropId ?? selected?.id;
    if (!cropId) return;
    const payload = {
      cropId,
      areaAcres: Number(areaAcres) || 0,
      estimatedYield: Number(estimatedYield) || 0,
      growthStage,
      daysToHarvest: Number(daysToHarvest) || 0,
    };
    if (editing) {
      updateFarmCrop(editing.id, payload);
    } else {
      addFarmCrop(payload);
    }
    onClose();
  }

  const preview = selected ?? (editing ? getCrop(editing.cropId) ?? null : null);
  const quote = preview ? quotes[preview.id] : undefined;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="crop-selector-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <span className="dashboard-header__eyebrow">CROP CATALOG</span>
            <h2 id="crop-selector-title">
              {editing ? "Edit crop" : "Add a crop"}
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {step === 1 && (
          <>
            <p className="modal__hint">Step 1 · Select a crop category</p>
            <div className="category-grid">
              {CROP_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="category-card"
                  onClick={() => {
                    setCategory(item.id);
                    setStep(2);
                  }}
                >
                  <span>{item.emoji}</span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="modal__toolbar">
              <button type="button" className="text-button" onClick={() => setStep(1)}>
                ← Categories
              </button>
              <input
                className="search-input"
                placeholder="🔍 Search crops — try tom, man, rice..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="crop-pick-grid">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  className="crop-pick-card"
                  onClick={() => chooseCrop(crop)}
                >
                  <CropImage crop={crop} />
                  <strong>{crop.emoji} {crop.name}</strong>
                  <small>{categoryMeta(crop.category)?.label}</small>
                </button>
              ))}
              {crops.length === 0 && <p>No crops match that search.</p>}
            </div>
          </>
        )}

        {step === 3 && (preview || editing) && (
          <div className="crop-form">
            {!editing && (
              <button type="button" className="text-button" onClick={() => setStep(2)}>
                ← Back to catalog
              </button>
            )}
            {preview && (
              <div className="crop-form__preview">
                <CropImage crop={preview} />
                <div>
                  <h3>
                    {preview.emoji} {preview.name}
                  </h3>
                  <p>{categoryMeta(preview.category)?.label}</p>
                  <ul>
                    <li>
                      Sample current market price:{" "}
                      {formatPrice(quote?.currentPrice ?? preview.samplePrice, preview.unit)}
                    </li>
                    <li>Average growing duration: {growthDurationLabel(preview)}</li>
                    <li>Recommended harvest stage: {preview.harvestStage}</li>
                    <li>Price trend: {quote?.trend === "rising" ? "📈 Rising" : quote?.trend === "falling" ? "📉 Falling" : "➡️ Stable"}</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="form-grid">
              <label>
                Cultivated area (acres)
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={areaAcres}
                  onChange={(event) => setAreaAcres(Number(event.target.value))}
                />
              </label>
              <label>
                Estimated yield ({preview?.unit ?? "kg"})
                <input
                  type="number"
                  min={0}
                  value={estimatedYield}
                  onChange={(event) => setEstimatedYield(Number(event.target.value))}
                />
              </label>
              <label>
                Growth stage
                <select
                  value={growthStage}
                  onChange={(event) =>
                    setGrowthStage(event.target.value as GrowthStage)
                  }
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Days to harvest
                <input
                  type="number"
                  min={0}
                  value={daysToHarvest}
                  onChange={(event) => setDaysToHarvest(Number(event.target.value))}
                />
              </label>
            </div>

            <div className="modal__actions">
              <button type="button" className="ghost-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={save}>
                {editing ? "Save changes" : "Add to farm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
