"use client";

import { useState } from "react";
import "./CropManagementPreview.scss";

const PREVIEW_STAGES = [
  { id: "sowing", label: "Sowing", icon: "🌰", progress: 14 },
  { id: "germination", label: "Germination", icon: "🌱", progress: 28 },
  { id: "vegetative", label: "Vegetative", icon: "🌿", progress: 45 },
  { id: "flowering", label: "Flowering", icon: "🌸", progress: 62 },
  { id: "fruiting", label: "Fruiting", icon: "🍅", progress: 80 },
  { id: "maturity", label: "Maturity", icon: "🌾", progress: 92 },
  { id: "harvest", label: "Harvest Ready", icon: "🚜", progress: 100 },
];

export default function CropManagementPreview() {
  const [activeStageIdx, setActiveStageIdx] = useState(4); // "Fruiting"
  const [selectedCrop, setSelectedCrop] = useState<"tomato" | "potato" | "onion">("tomato");

  const cropData = {
    tomato: {
      name: "Tomato (Arka Rakshak)",
      emoji: "🍅",
      area: "2.0 Acres",
      yield: "1,000 kg",
      rate: "₹50 / kg",
      value: "₹50,000",
      status: "Healthy",
      sowing: "15 Oct 2026",
      harvest: "15 Jan 2027",
    },
    potato: {
      name: "Potato (Kufri Jyoti)",
      emoji: "🥔",
      area: "1.5 Acres",
      yield: "800 kg",
      rate: "₹30 / kg",
      value: "₹24,000",
      status: "Growing",
      sowing: "01 Nov 2026",
      harvest: "20 Feb 2027",
    },
    onion: {
      name: "Onion (Bhima Super)",
      emoji: "🧅",
      area: "1.0 Acre",
      yield: "600 kg",
      rate: "₹40 / kg",
      value: "₹24,000",
      status: "Needs Attention",
      sowing: "20 Sep 2026",
      harvest: "10 Jan 2027",
    },
  };

  const current = cropData[selectedCrop];
  const activeStage = PREVIEW_STAGES[activeStageIdx];

  return (
    <section className="crop-preview-section">
      <div className="crop-preview-container">
        <div className="crop-preview-header">
          <span className="crop-preview-tag">INTERACTIVE CROP MANAGEMENT PREVIEW</span>
          <h2>
            Total Field Transparency
            <span>Monitor Lifecycle, Plot Health & Harvest Value</span>
          </h2>
          <p>
            Experience how AgriSmart structures every crop into actionable milestones,
            from seed emergence to lucrative APMC dispatch.
          </p>
        </div>

        {/* Interactive Showcase Card */}
        <div className="crop-showcase-card">
          {/* Crop Selector Tabs */}
          <div className="crop-tabs-bar">
            {(["tomato", "potato", "onion"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={`crop-tab-btn ${selectedCrop === k ? "is-selected" : ""}`}
                onClick={() => setSelectedCrop(k)}
              >
                <span>{cropData[k].emoji}</span>
                <span>{cropData[k].name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div className="crop-showcase-main">
            {/* Left Card Preview */}
            <div className="crop-preview-card">
              <div className="crop-card-top">
                <span className="crop-emoji-box">{current.emoji}</span>
                <div className="crop-info">
                  <h3>{current.name}</h3>
                  <div className="crop-pills">
                    <span className="pill status-healthy">{current.status}</span>
                    <span className="pill stage-pill">{activeStage.label}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="preview-progress-box">
                <div className="progress-text">
                  <span>Lifecycle Progress</span>
                  <strong>{activeStage.progress}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${activeStage.progress}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="preview-metrics-grid">
                <div>
                  <small>Plot Area</small>
                  <strong>{current.area}</strong>
                </div>
                <div>
                  <small>Est. Yield</small>
                  <strong>{current.yield}</strong>
                </div>
                <div>
                  <small>Current Mandi Rate</small>
                  <strong>{current.rate}</strong>
                </div>
                <div>
                  <small>Dynamic Crop Value</small>
                  <strong className="val-highlight">{current.value}</strong>
                </div>
              </div>
            </div>

            {/* Right Interactive Lifecycle Stepper */}
            <div className="lifecycle-controller-box">
              <h4>Interactive Lifecycle Timeline</h4>
              <p>Click any growth stage below to preview lifecycle tracking:</p>

              <div className="preview-stage-buttons">
                {PREVIEW_STAGES.map((st, idx) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`stage-btn ${idx === activeStageIdx ? "is-current" : ""} ${
                      idx < activeStageIdx ? "is-passed" : ""
                    }`}
                    onClick={() => setActiveStageIdx(idx)}
                  >
                    <span className="icon">{st.icon}</span>
                    <span className="name">{st.label}</span>
                    {idx === activeStageIdx && <span className="active-dot" />}
                  </button>
                ))}
              </div>

              <div className="stage-explanation-box">
                <strong>
                  Stage {activeStageIdx + 1} of 7: {activeStage.icon} {activeStage.label}
                </strong>
                <p>
                  At this stage, crop water management and nutrition scouting are vital.
                  AgriSmart automatically computes days to harvest and alerts you when commodity prices
                  in nearby mandis reach profitable peaks.
                </p>
                <button
                  type="button"
                  className="try-dashboard-link"
                  onClick={() => {
                    window.location.href = "/dashboard?view=crops";
                  }}
                >
                  Manage Your Crops in Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
