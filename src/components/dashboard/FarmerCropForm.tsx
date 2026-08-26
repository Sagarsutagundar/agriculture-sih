"use client";

import { useState, useMemo, type FormEvent } from "react";
import { CROPS } from "@/data/crops";
import type { AreaUnit, CropHealthStatus, FarmCrop, GrowthStage } from "@/data/types";
import { getCrop } from "@/services/cropService";
import CropImage from "./CropImage";
import "./FarmerCropForm.scss";

const LIFECYCLE_STAGES: { id: GrowthStage; label: string; icon: string }[] = [
  { id: "sowing", label: "Sowing", icon: "🌰" },
  { id: "germination", label: "Germination", icon: "🌱" },
  { id: "vegetative", label: "Vegetative", icon: "🌿" },
  { id: "flowering", label: "Flowering", icon: "🌸" },
  { id: "fruiting", label: "Fruiting", icon: "🍅" },
  { id: "maturity", label: "Maturity", icon: "🌾" },
  { id: "harvest", label: "Harvest Ready", icon: "🚜" },
];

const HEALTH_STATUSES: CropHealthStatus[] = [
  "Growing",
  "Healthy",
  "Needs Attention",
  "Ready for Harvest",
  "Harvested",
];

const AREA_UNITS: { id: AreaUnit; label: string }[] = [
  { id: "acres", label: "Acres" },
  { id: "hectares", label: "Hectares" },
  { id: "bigha", label: "Bigha" },
  { id: "guntha", label: "Guntha" },
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
  const [customCropName, setCustomCropName] = useState(initialCrop?.customCropName ?? "");
  const [variety, setVariety] = useState(initialCrop?.variety ?? "");
  const [areaAcres, setAreaAcres] = useState<number | string>(initialCrop?.areaAcres ?? 1.5);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>(initialCrop?.areaUnit ?? "acres");
  const [estimatedYield, setEstimatedYield] = useState<number | string>(
    initialCrop?.estimatedYield ?? 600,
  );
  const [sowingDate, setSowingDate] = useState(() =>
    initialCrop?.sowingDate ?? new Date().toISOString().split("T")[0],
  );
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(() =>
    initialCrop?.expectedHarvestDate ??
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    initialCrop?.growthStage === "seedling" ? "germination" : initialCrop?.growthStage ?? "vegetative",
  );
  const [status, setStatus] = useState<CropHealthStatus>(initialCrop?.status ?? "Growing");
  const [statusNote, setStatusNote] = useState(initialCrop?.statusNote ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCropMeta = useMemo(() => getCrop(cropId), [cropId]);

  function handleCropChange(newCropId: string) {
    setCropId(newCropId);
    const meta = getCrop(newCropId);
    if (meta && !initialCrop) {
      setEstimatedYield(meta.unit === "quintal" ? 30 : 600);
      const avgDays = Math.round(
        (meta.averageGrowthDays.min + meta.averageGrowthDays.max) / 2,
      );
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
      newErrors.expectedHarvestDate =
        "Harvest date cannot be earlier than sowing date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Calculate days to harvest
      const now = Date.now();
      const harvestTime = new Date(expectedHarvestDate).getTime();
      const diffDays = Math.max(0, Math.ceil((harvestTime - now) / (1000 * 60 * 60 * 24)));

      onSave({
        cropId,
        customCropName: customCropName.trim() || undefined,
        variety: variety.trim() || undefined,
        areaAcres: Number(areaAcres),
        areaUnit,
        estimatedYield: Number(estimatedYield),
        sowingDate,
        expectedHarvestDate,
        growthStage,
        status,
        daysToHarvest: growthStage === "harvest" || status === "Harvested" ? 0 : diffDays,
        statusNote: statusNote.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
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
              {initialCrop ? "EDIT PLOT CROP" : "ADD NEW CROP"}
            </span>
            <h2 id="crop-form-title">
              {initialCrop
                ? `Edit ${initialCrop.customCropName || selectedCropMeta?.name || "Crop"}`
                : "Add Cultivated Crop"}
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
            {/* Crop Preview Header */}
            {selectedCropMeta && (
              <div className="crop-preview-box">
                <div className="crop-preview-box__image">
                  <CropImage crop={selectedCropMeta} />
                </div>
                <div className="crop-preview-box__info">
                  <strong>
                    {selectedCropMeta.emoji} {selectedCropMeta.name} (
                    {selectedCropMeta.category})
                  </strong>
                  <span>
                    Unit: {selectedCropMeta.unit} · Recommended Harvest:{" "}
                    {selectedCropMeta.harvestStage}
                  </span>
                </div>
              </div>
            )}

            {/* SECTION 1: Crop Selection & Variety */}
            <div className="form-section">
              <h3 className="form-section-title">🌾 Crop Selection & Variety</h3>
              <div className="form-field-group">
                <div className="form-field">
                  <label htmlFor="cropSelect">
                    Crop Type <span className="required">*</span>
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
                  <label htmlFor="variety">Variety / Hybrid (Optional)</label>
                  <input
                    id="variety"
                    type="text"
                    placeholder="e.g. Arka Rakshak, Kufri Jyoti, Basmati 1121"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                  />
                  <p className="field-hint">Helps calibrate seed yields and market grade</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: Area & Yield */}
            <div className="form-section">
              <h3 className="form-section-title">📐 Area & Expected Yield</h3>
              <div className="form-field-group">
                <div className="form-field">
                  <label htmlFor="areaAcres">
                    Cultivated Area <span className="required">*</span>
                  </label>
                  <div className="input-with-select">
                    <input
                      id="areaAcres"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(e.target.value)}
                      className={errors.areaAcres ? "has-error" : ""}
                      required
                    />
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                    >
                      {AREA_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.areaAcres && <p className="field-error">{errors.areaAcres}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="estimatedYield">
                    Estimated Total Yield ({selectedCropMeta?.unit ?? "kg"}){" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    id="estimatedYield"
                    type="number"
                    min="0"
                    value={estimatedYield}
                    onChange={(e) => setEstimatedYield(e.target.value)}
                    className={errors.estimatedYield ? "has-error" : ""}
                    required
                  />
                  {errors.estimatedYield && (
                    <p className="field-error">{errors.estimatedYield}</p>
                  )}
                  <p className="field-hint">
                    Total expected harvest quantity for this plot
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: Dates & Lifecycle */}
            <div className="form-section">
              <h3 className="form-section-title">📅 Sowing & Harvest Schedule</h3>
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
                    required
                  />
                  {errors.sowingDate && (
                    <p className="field-error">{errors.sowingDate}</p>
                  )}
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
                    required
                  />
                  {errors.expectedHarvestDate && (
                    <p className="field-error">{errors.expectedHarvestDate}</p>
                  )}
                </div>
              </div>

              {/* Lifecycle Stage Picker */}
              <div className="form-field" style={{ marginTop: 16 }}>
                <label>Current Growth Stage</label>
                <div className="stage-selector-pills">
                  {LIFECYCLE_STAGES.map((st) => (
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
            </div>

            {/* SECTION 4: Health Status & Notes */}
            <div className="form-section">
              <h3 className="form-section-title">🩺 Health Condition & Field Notes</h3>
              <div className="form-field">
                <label>Current Crop Health Status</label>
                <div className="status-selector-row">
                  {HEALTH_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`status-btn ${status === st ? "is-selected" : ""}`}
                      onClick={() => setStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field" style={{ marginTop: 12 }}>
                <label htmlFor="statusNote">Field Condition / Observations</label>
                <input
                  id="statusNote"
                  type="text"
                  placeholder="e.g. Vigorous flowering, applied bio-fungicide, drip fertigation at 80%"
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
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving crop..."
                : initialCrop
                ? "Update Crop"
                : "Save Crop to Farm"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
