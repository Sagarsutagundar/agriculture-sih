"use client";

import { useState } from "react";
import "./FarmerWorkflow.scss";

const WORKFLOW_STEPS = [
  {
    step: "01",
    icon: "👨🏽‍🌾",
    title: "Farmer Profile",
    subtitle: "Identity & Verification",
    description:
      "Register your farming details, contact information, and customized profile preferences in seconds.",
    highlight: "100% data privacy & personalized experience",
  },
  {
    step: "02",
    icon: "📍",
    title: "Farm Setup",
    subtitle: "Land & Soil Profiling",
    description:
      "Map your state, district, farm acreage, soil classification (black, alluvial, red), and irrigation systems.",
    highlight: "Calibrates yield & hyper-local weather models",
  },
  {
    step: "03",
    icon: "🌱",
    title: "Add Crops",
    subtitle: "Plot Registration",
    description:
      "Select crops from our 50+ crop catalog or enter custom varieties. Record planting dates and acreages.",
    highlight: "Instant harvest date & yield projection",
  },
  {
    step: "04",
    icon: "🚜",
    title: "Farmer Dashboard",
    subtitle: "Unified Central Hub",
    description:
      "Monitor farm-wide status, cultivated acreages, APMC mandi rates, and calculated dynamic crop values in real time.",
    highlight: "All farm metrics updated in one glance",
  },
  {
    step: "05",
    icon: "🌾",
    title: "Monitor Crops",
    subtitle: "Lifecycle & Scouting",
    description:
      "Track your crops through all 7 growth stages from sowing to germination, flowering, maturity, and harvest.",
    highlight: "Interactive stage timeline with field observations",
  },
  {
    step: "06",
    icon: "⚡",
    title: "Take Quick Actions",
    subtitle: "Mandi Sales & AI Decisions",
    description:
      "Connect with direct verified buyers, compare nearby APMC markets, and schedule optimal harvest dates.",
    highlight: "Maximize profit per quintal/kg",
  },
];

export default function FarmerWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="farmer-workflow-section">
      <div className="farmer-workflow-container">
        <div className="workflow-heading">
          <span className="workflow-eyebrow">THE FARMER JOURNEY</span>
          <h2>
            How AgriSmart Powers Your Farm
            <span>From Sowing to Final Market Sale</span>
          </h2>
          <p>
            An intuitive, structured journey designed to make modern agricultural technology
            effortless for every farmer.
          </p>
        </div>

        {/* Stepper Flow Cards */}
        <div className="workflow-grid">
          {WORKFLOW_STEPS.map((item, index) => (
            <div
              key={item.step}
              className={`workflow-card ${activeStep === index ? "is-active" : ""}`}
              onClick={() => setActiveStep(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveStep(index);
              }}
            >
              <div className="workflow-card__top">
                <span className="step-badge">STEP {item.step}</span>
                <span className="step-icon">{item.icon}</span>
              </div>
              <h3 className="step-title">{item.title}</h3>
              <span className="step-subtitle">{item.subtitle}</span>
              <p className="step-desc">{item.description}</p>
              <div className="step-highlight">
                <span className="check">✓</span>
                <small>{item.highlight}</small>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <span className="step-connector-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="workflow-footer-banner">
          <div>
            <strong>Ready to set up your digital farm profile?</strong>
            <span>Takes under 2 minutes. No paperwork or credit card required.</span>
          </div>
          <button
            type="button"
            className="workflow-start-btn"
            onClick={() => {
              window.location.href = "/dashboard?view=profile";
            }}
          >
            Start Farm Setup Now →
          </button>
        </div>
      </div>
    </section>
  );
}
