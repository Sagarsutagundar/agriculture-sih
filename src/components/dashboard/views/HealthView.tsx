"use client";

import { useAgri, growthStageLabel } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import CropImage from "../CropImage";

export default function HealthView() {
  const { farmCrops } = useAgri();

  return (
    <>
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">CROP HEALTH</span>
        <h1>Field health overview</h1>
        <p>
          Image-based AI diagnosis can plug in later. For now, growth stage and
          harvest windows come from your crop configuration.
        </p>
      </header>

      <div className="farm-crop-grid">
        {farmCrops.map((farmCrop) => {
          const crop = getCrop(farmCrop.cropId);
          if (!crop) return null;
          const status =
            farmCrop.daysToHarvest <= 14
              ? "Harvest window approaching"
              : farmCrop.growthStage === "maturity"
                ? "Watch fruit quality daily"
                : "Routine scouting recommended";
          return (
            <article key={farmCrop.id} className="farm-crop-card">
              <CropImage crop={crop} />
              <div>
                <h3>
                  {crop.emoji} {crop.name}
                </h3>
                <ul>
                  <li>Stage: {growthStageLabel(farmCrop.growthStage)}</li>
                  <li>Days to harvest: {farmCrop.daysToHarvest}</li>
                  <li>Typical duration: {crop.averageGrowthDays.min}–{crop.averageGrowthDays.max} days</li>
                  <li>Recommended harvest: {crop.harvestStage}</li>
                  <li>{status}</li>
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
