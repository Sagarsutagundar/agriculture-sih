"use client";

import { useMemo, useState } from "react";
import { CROP_CATEGORIES } from "@/data/categories";
import type { CropCategory, CropHealthStatus, FarmCrop } from "@/data/types";
import { useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import FarmerCropCard from "../FarmerCropCard";
import FarmerCropForm from "../FarmerCropForm";

const STATUS_FILTERS: { id: CropHealthStatus | "all"; label: string }[] = [
  { id: "all", label: "All Crops" },
  { id: "Growing", label: "Growing" },
  { id: "Healthy", label: "Healthy" },
  { id: "Needs Attention", label: "Needs Attention" },
  { id: "Ready for Harvest", label: "Ready for Harvest" },
  { id: "Harvested", label: "Harvested" },
];

export default function CropsView({
  onOpenCropMarket,
}: {
  onOpenCropMarket: (cropId: string) => void;
}) {
  const { farmCrops, quotes, removeFarmCrop, addFarmCrop, updateFarmCrop } = useAgri();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CropCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CropHealthStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FarmCrop | null>(null);

  const filtered = useMemo(() => {
    return farmCrops.filter((farmCrop) => {
      const crop = getCrop(farmCrop.cropId);
      if (!crop) return false;
      if (category !== "all" && crop.category !== category) return false;
      if (statusFilter !== "all") {
        const cropStatus = farmCrop.status || "Growing";
        if (cropStatus !== statusFilter) return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        crop.searchTerms.some((term) => term.includes(q)) ||
        (farmCrop.variety && farmCrop.variety.toLowerCase().includes(q)) ||
        (farmCrop.customCropName && farmCrop.customCropName.toLowerCase().includes(q))
      );
    });
  }, [farmCrops, category, statusFilter, query]);

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
          <span className="dashboard-header__eyebrow">MY CROPS & PLOTS</span>
          <h1>Your Cultivated Crops ({farmCrops.length})</h1>
          <p>
            Manage active crops, track growth stages from sowing to harvest, and monitor live estimated
            market values.
          </p>
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

      {/* Filters row */}
      <div className="filters-row">
        <input
          className="search-input"
          placeholder="Search by crop, variety or category..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CropCategory | "all")
          }
        >
          <option value="all">All Categories</option>
          {CROP_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as CropHealthStatus | "all")
          }
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div
        className="farm-crop-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
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
                if (window.confirm(`Are you sure you want to delete ${crop.name}?`)) {
                  removeFarmCrop(farmCrop.id);
                }
              }}
              onOpenMarket={() => onOpenCropMarket(crop.id)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "2px dashed var(--color-border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 36 }}>🌱</span>
          <h3 style={{ margin: 0, fontSize: 18, color: "var(--color-text-primary)" }}>
            No matching crops found
          </h3>
          <p style={{ color: "var(--color-text-secondary)", margin: 0, maxWidth: 400 }}>
            {query || category !== "all" || statusFilter !== "all"
              ? "Try adjusting your search query or filters."
              : "You have not added any cultivated crops to your farm yet."}
          </p>
          <button
            type="button"
            className="primary-btn"
            style={{ marginTop: 8 }}
            onClick={() => {
              setQuery("");
              setCategory("all");
              setStatusFilter("all");
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Add New Crop
          </button>
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
