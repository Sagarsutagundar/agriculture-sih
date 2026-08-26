"use client";
import { useState, useMemo, type FormEvent } from "react";
import { CROPS } from "@/data/crops";
import type { FarmCrop, GrowthStage } from "@/data/types";
import { getCrop } from "@/services/cropService";
import CropImage from "./CropImage";
import "./FarmerCropForm.scss";

const GROWTH_STAGES: { id: GrowthStage; label: string; icon: string }[] = [
  { id: "seedling", label: "Seedling", icon: "🌱" },
  { id: "sowing", label: "Sowing", icon: "🌰" },
  { id: "vegetative", label: "Vegetative", icon: "🌿" },
  { id: "flowering", label: "Flowering", icon: "🌸" },
  { id: "fruiting", label: "Fruiting", icon: "🍅" },
  { id: "maturity", label: "Maturity", icon: "🌾" },
  { id: "harvest", label: "Harvest Ready", icon: "🚜" },
];

type FarmerCropFormProps = {
  initialCrop?: FarmCrop | null;
  onSave: (cropData: Omit<FarmCrop, "id">) => void;
  onClose: () => void;
};

export default function FarmerCropForm({
  initialCrop,
  onSave,
  onClose,
}: FarmerCropFormProps) {
  const [cropId, setCropId] = useState(initialCrop?.cropId ?? CROPS[0]?.id ?? "tomato");
  const [variety, setVariety] = useState(initialCrop?.variety ?? "");
  const [areaAcres, setAreaAcres] = useState<number | string>(initialCrop?.areaAcres ?? 1);
  const [estimatedYield, setEstimatedYield] = useState<number | string>(
    initialCrop?.estimatedYield ?? 500,
  );
  const [sowingDate, setSowingDate] = useState(() =>
    initialCrop?.sowingDate ?? new Date().toISOString().split("T")[0],
  );
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(() =>
    initialCrop?.expectedHarvestDate ??
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    initialCrop?.growthStage ?? "vegetative",
  );
  const [daysToHarvest, setDaysToHarvest] = useState<number | string>(
    initialCrop?.daysToHarvest ?? 45,
  );
  const [statusNote, setStatusNote] = useState(initialCrop?.statusNote ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCropMeta = useMemo(() => getCrop(cropId), [cropId]);

  function handleCropChange(newCropId: string) {
    setCropId(newCropId);
    const meta = getCrop(newCropId);
    if (meta && !initialCrop) {
      setEstimatedYield(meta.unit === "quintal" ? 30 : 800);
      const avgDays = Math.round((meta.averageGrowthDays.min + meta.averageGrowthDays.max) / 2);
      setDaysToHarvest(Math.round(avgDays / 2));
      const targetDate = new Date(Date.now() + avgDays * 24 * 60 * 60 * 1000);
      setExpectedHarvestDate(targetDate.toISOString().split("T")[0]);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!cropId) newErrors.cropId = "Please select a crop";
    if (!areaAcres || Number(areaAcres) <= 0) {
      newErrors.areaAcres = "Cultivated area must be greater than 0";
    }
    if (estimatedYield === "" || Number(estimatedYield) < 0) {
      newErrors.estimatedYield = "Estimated yield cannot be negative";
    }
    if (!sowingDate) {
      newErrors.sowingDate = "Sowing date is required";
    }
    if (!expectedHarvestDate) {
      newErrors.expectedHarvestDate = "Expected harvest date is required";
    }
    if (sowingDate && expectedHarvestDate && sowingDate > expectedHarvestDate) {
      newErrors.expectedHarvestDate = "Harvest date cannot be earlier than sowing date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      cropId,
      variety: variety.trim() || undefined,
      areaAcres: Number(areaAcres),
      estimatedYield: Number(estimatedYield),
      sowingDate,
      expectedHarvestDate,
      growthStage,
      daysToHarvest: Number(daysToHarvest) || 0,
      statusNote: statusNote.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="farmer-crop-form-modal" role="presentation" onClick={onClose}>
      <div
        className="farmer-crop-form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="farmer-crop-form-card__header">
          <div>
            <span className="dashboard-header__eyebrow">
              {initialCrop ? "EDIT CROP" : "NEW CROP"}
            </span>
            <h2 id="crop-form-title">
              {initialCrop ? `Edit ${selectedCropMeta?.name ?? "Crop"}` : "Add Crop to Farm"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="farmer-crop-form-card__body">
            {selectedCropMeta && (
              <div className="crop-preview-box">
                <div className="crop-preview-box__image">
                  <CropImage crop={selectedCropMeta} />
                </div>
                <div className="crop-preview-box__info">
                  <strong>
                    {selectedCropMeta.emoji} {selectedCropMeta.name} ({selectedCropMeta.category})
                  </strong>
                  <span>
                    Unit: {selectedCropMeta.unit} · Recommended Harvest:{" "}
                    {selectedCropMeta.harvestStage}
                  </span>
                </div>
              </div>
            )}

            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="cropSelect">
                  Crop Name <span className="required">*</span>
                </label>
                <select
                  id="cropSelect"
                  value={cropId}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className={errors.cropId ? "has-error" : ""}
                >
                  {CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({c.category})
                    </option>
                  ))}
                </select>
                {errors.cropId && <p className="field-error">{errors.cropId}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="variety">Crop Variety (Optional)</label>
                <input
                  id="variety"
                  type="text"
                  placeholder="e.g. Hybrid F1, Desi, Sona Masuri"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                />
                <p className="field-hint">Helps track seeds & specialized market prices</p>
              </div>
            </div>

            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="areaAcres">
                  Cultivated Area (Acres) <span className="required">*</span>
                </label>
                <input
                  id="areaAcres"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  className={errors.areaAcres ? "has-error" : ""}
                />
                {errors.areaAcres && <p className="field-error">{errors.areaAcres}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="estimatedYield">
                  Estimated Yield ({selectedCropMeta?.unit ?? "kg"}){" "}
                  <span className="required">*</span>
                </label>
                <input
                  id="estimatedYield"
                  type="number"
                  min="0"
                  value={estimatedYield}
                  onChange={(e) => setEstimatedYield(e.target.value)}
                  className={errors.estimatedYield ? "has-error" : ""}
                />
                {errors.estimatedYield && (
                  <p className="field-error">{errors.estimatedYield}</p>
                )}
              </div>
            </div>

            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="sowingDate">
                  Sowing / Planting Date <span className="required">*</span>
                </label>
                <input
                  id="sowingDate"
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className={errors.sowingDate ? "has-error" : ""}
                />
                {errors.sowingDate && <p className="field-error">{errors.sowingDate}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="expectedHarvestDate">
                  Expected Harvest Date <span className="required">*</span>
                </label>
                <input
                  id="expectedHarvestDate"
                  type="date"
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  className={errors.expectedHarvestDate ? "has-error" : ""}
                />
                {errors.expectedHarvestDate && (
                  <p className="field-error">{errors.expectedHarvestDate}</p>
                )}
              </div>
            </div>

            <div className="form-field">
              <label>Current Growth Stage</label>
              <div className="stage-selector-pills">
                {GROWTH_STAGES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={growthStage === st.id ? "is-selected" : ""}
                    onClick={() => setGrowthStage(st.id)}
                  >
                    {st.icon} {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="daysToHarvest">Days Remaining to Harvest</label>
                <input
                  id="daysToHarvest"
                  type="number"
                  min="0"
                  value={daysToHarvest}
                  onChange={(e) => setDaysToHarvest(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="statusNote">Field Condition / Notes</label>
                <input
                  id="statusNote"
                  type="text"
                  placeholder="e.g. 80% flowering, applied organic compost"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <footer className="farmer-crop-form-card__footer">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {initialCrop ? "Update Crop" : "Save to My Crops"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
