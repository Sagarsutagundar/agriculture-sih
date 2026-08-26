"use client";

import { useState } from "react";
import { useAgri, growthStageLabel } from "@/context/AgriContext";
import type { CropHealthDiagnostic } from "@/data/types";
import "./HealthView.scss";

export default function HealthView() {
  const { farmCrops, healthDiagnostics } = useAgri();
  const [inspectingDiagnostic, setInspectingDiagnostic] =
    useState<CropHealthDiagnostic | null>(null);

  if (farmCrops.length === 0) {
    return (
      <div className="crop-health-view">
        <header className="health-header">
          <div className="health-header__left">
            <span className="eyebrow">🩺 CROP HEALTH MONITOR</span>
            <h1>Field Health Diagnostics & Scouting</h1>
            <p>No crops currently registered on your farm plots.</p>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3>Add a crop to begin monitoring field health diagnostics</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="crop-health-view">
      {/* Header */}
      <header className="health-header">
        <div className="health-header__left">
          <span className="eyebrow">
            <span>🩺</span> AGRICULTURAL SCOUTING & DIAGNOSTICS
          </span>
          <h1>Crop Health Monitor & Field Advisory</h1>
          <p>
            Automated health evaluations synthesizing growth stages, soil moisture tension, pest
            scouting thresholds, and micro-climate indicators.
          </p>
        </div>

        <div className="health-header__badge">
          <span className="status-text">
            <span>●</span> All Plots Monitored
          </span>
          <small>Rule-based diagnostic telemetry active</small>
        </div>
      </header>

      {/* Grid of Crop Health Cards */}
      <div className="health-cards-grid">
        {healthDiagnostics.map((diag) => {
          const farmCrop = farmCrops.find((c) => c.id === diag.farmCropId);
          const topIssue = diag.issues[0];
          const topRec = diag.recommendations[0];

          const cardStatusClass =
            diag.status === "Needs Attention"
              ? "status-attention"
              : diag.status === "Ready for Harvest"
              ? "status-harvest"
              : "status-healthy";

          const stripStatusClass =
            diag.status === "Needs Attention"
              ? "attention"
              : diag.status === "Ready for Harvest"
              ? "harvest"
              : "healthy";

          return (
            <article
              key={diag.farmCropId}
              className={`health-monitor-card ${cardStatusClass}`}
            >
              {/* Card Top */}
              <div className="health-monitor-card__top">
                <div className="crop-meta-block">
                  <div className="crop-avatar">{diag.cropEmoji}</div>
                  <div>
                    <h3>{diag.cropName}</h3>
                    <span className="stage-text">
                      {growthStageLabel(diag.growthStage)} Stage •{" "}
                      {farmCrop?.areaAcres || 1} Acres
                    </span>
                  </div>
                </div>

                <div className="health-score-pill">
                  <strong>{diag.healthScore}/100</strong>
                  <small>Health Score</small>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`health-monitor-card__status-strip ${stripStatusClass}`}>
                <span className="status-icon">
                  {diag.status === "Healthy"
                    ? "✓"
                    : diag.status === "Needs Attention"
                    ? "⚠️"
                    : "🌾"}
                </span>
                <div className="status-details">
                  <strong>{diag.status}</strong>
                  <small>{diag.lastInspection}</small>
                </div>
              </div>

              {/* Summary */}
              <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                {diag.summary}
              </p>

              {/* Agronomic Sensors */}
              <div className="health-monitor-card__telemetry">
                <div>
                  <small>Soil Moisture Reading</small>
                  <strong>{diag.soilMoisture}</strong>
                </div>
                <div>
                  <small>Pest / Disease Pressure</small>
                  <strong>{diag.pestPressure}</strong>
                </div>
              </div>

              {/* Detected Issues */}
              {diag.issues.length > 0 && (
                <div className="health-monitor-card__issues-box">
                  <span className="section-label">Field Scouting Observations</span>
                  {topIssue && (
                    <div className={`issue-item ${topIssue.riskLevel}`}>
                      <span className="bullet">
                        {topIssue.riskLevel === "medium" ? "🟠" : "🔵"}
                      </span>
                      <div className="issue-content">
                        <strong>
                          {topIssue.title} ({topIssue.riskLevel.toUpperCase()} RISK)
                        </strong>
                        <p>{topIssue.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Action */}
              {topRec && (
                <div className="health-monitor-card__recommendation-box">
                  <span className={`urgency-badge ${topRec.urgency.replace(" ", "-")}`}>
                    {topRec.urgency}
                  </span>
                  <strong>{topRec.action}</strong>
                  <p>{topRec.detail}</p>
                  <small>Impact: {topRec.impact}</small>
                </div>
              )}

              {/* Action Buttons */}
              <div className="health-monitor-card__actions">
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  Harvest in {farmCrop?.daysToHarvest ?? 0} days
                </span>
                <button
                  type="button"
                  className="inspect-btn"
                  onClick={() => setInspectingDiagnostic(diag)}
                >
                  Deep Health View →
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Deep Inspection Modal */}
      {inspectingDiagnostic && (
        <div
          className="health-modal-overlay"
          onClick={() => setInspectingDiagnostic(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="health-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="health-modal-card__header">
              <h2>
                {inspectingDiagnostic.cropEmoji} {inspectingDiagnostic.cropName} — Complete Diagnostic Report
              </h2>
              <button
                type="button"
                onClick={() => setInspectingDiagnostic(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ background: "#e8f5e9", color: "#1b5e20", padding: "8px 16px", borderRadius: "8px", fontWeight: 800 }}>
                Score: {inspectingDiagnostic.healthScore}/100
              </div>
              <div>
                <strong>Status: {inspectingDiagnostic.status}</strong>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Stage: {growthStageLabel(inspectingDiagnostic.growthStage)} • {inspectingDiagnostic.lastInspection}
                </div>
              </div>
            </div>

            <div style={{ background: "#fafbf9", padding: "16px", borderRadius: "10px", border: "1px solid var(--color-border-light)" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Agronomic Scouting Summary</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                {inspectingDiagnostic.summary}
              </p>
            </div>

            <div>
              <h4 style={{ margin: "0 0 10px 0" }}>All Identified Risks & Issues ({inspectingDiagnostic.issues.length})</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {inspectingDiagnostic.issues.map((iss) => (
                  <div
                    key={iss.id}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border-light)",
                      background: iss.riskLevel === "medium" ? "#fff8e1" : "#f5f5f5",
                    }}
                  >
                    <strong>
                      {iss.riskLevel === "medium" ? "🟠" : "🔵"} {iss.title}
                    </strong>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      {iss.description}
                    </p>
                    <small style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                      Detected: {iss.detectedAt}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 10px 0" }}>Agronomist Recommended Actions ({inspectingDiagnostic.recommendations.length})</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {inspectingDiagnostic.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      background: "#f1f8e9",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#2e7d32", textTransform: "uppercase" }}>
                      {rec.urgency}
                    </span>
                    <strong style={{ display: "block", color: "#1b5e20", margin: "4px 0" }}>
                      {rec.action}
                    </strong>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      {rec.detail}
                    </p>
                    <small style={{ color: "#2e7d32", fontWeight: 600 }}>
                      Expected Outcome: {rec.impact}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="primary-btn"
              style={{
                background: "var(--color-primary)",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => setInspectingDiagnostic(null)}
            >
              Close Diagnostic Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
