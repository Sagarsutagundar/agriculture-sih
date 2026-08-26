"use client";

import { useMemo, useState } from "react";
import { CROP_CATEGORIES } from "@/data/categories";
import type { CropCategory, FarmCrop } from "@/data/types";
import { useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import FarmerCropCard from "../FarmerCropCard";
import FarmerCropForm from "../FarmerCropForm";

export default function CropsView({
  onOpenCropMarket,
}: {
  onOpenCropMarket: (cropId: string) => void;
}) {
  const { farmCrops, quotes, removeFarmCrop, addFarmCrop, updateFarmCrop } = useAgri();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CropCategory | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FarmCrop | null>(null);

  const filtered = useMemo(() => {
    return farmCrops.filter((farmCrop) => {
      const crop = getCrop(farmCrop.cropId);
      if (!crop) return false;
      if (category !== "all" && crop.category !== category) return false;
      if (!query.trim()) return true;
      return crop.searchTerms.some((term) => term.includes(query.toLowerCase()));
    });
  }, [farmCrops, category, query]);

  function handleSave(cropData: Omit<FarmCrop, "id">) {
    if (editing) {
      updateFarmCrop(editing.id, cropData);
    } else {
      addFarmCrop(cropData);
    }
    setEditing(null);
    setFormOpen(false);
  }

  return (
    <>
      <header className="dashboard-header dashboard-header--split">
        <div>
          <span className="dashboard-header__eyebrow">MY CROPS</span>
          <h1>Your Cultivated Crops ({farmCrops.length})</h1>
          <p>Add, edit or remove crops. Growth stages and estimated values update in real time.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add New Crop
        </button>
      </header>

      <div className="filters-row">
        <input
          className="search-input"
          placeholder="Search your crops..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CropCategory | "all")
          }
        >
          <option value="all">All categories</option>
          {CROP_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="farm-crop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {filtered.map((farmCrop) => {
          const crop = getCrop(farmCrop.cropId);
          if (!crop) return null;
          return (
            <FarmerCropCard
              key={farmCrop.id}
              crop={crop}
              farmCrop={farmCrop}
              quote={quotes[crop.id]}
              onEdit={() => {
                setEditing(farmCrop);
                setFormOpen(true);
              }}
              onDelete={() => {
                if (window.confirm(`Remove ${crop.name} from your farm?`)) {
                  removeFarmCrop(farmCrop.id);
                }
              }}
              onOpenMarket={() => onOpenCropMarket(crop.id)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>No matching crops found. Add one to get started.</p>
        </div>
      )}

      {formOpen && (
        <FarmerCropForm
          initialCrop={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
