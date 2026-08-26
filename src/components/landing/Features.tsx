"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import "./Features.scss";

const features = [
  {
    id: "health",
    number: "01",
    icon: "🌱",
    title: "Crop Health AI",
    short: "Detect problems before they become losses.",
    description:
      "Analyze crop images to identify possible diseases, deficiencies, and crop-health issues.",
    points: [
      "AI-powered image analysis",
      "Possible disease detection",
      "Actionable recommendations",
    ],
    action: "Analyze Crop",
  },
  {
    id: "market",
    number: "02",
    icon: "📊",
    title: "Market Intelligence",
    short: "Know where your crop can earn more.",
    description:
      "Compare market prices, demand, transportation costs, trends, and market risks.",
    points: [
      "Compare nearby markets",
      "Track price trends",
      "Understand market risk",
    ],
    action: "Explore Markets",
  },
  {
    id: "profit",
    number: "03",
    icon: "💰",
    title: "Profit Advisor",
    short: "Choose the selling option with the best expected return.",
    description:
      "Our decision engine compares selling now, storing, splitting your crop, or choosing another market.",
    points: [
      "Expected net profit",
      "Storage and transport costs",
      "What-if analysis",
    ],
    action: "Calculate Profit",
  },
  {
    id: "buyers",
    number: "04",
    icon: "🤝",
    title: "Direct Buyers",
    short: "Find potential buyers without unnecessary intermediaries.",
    description:
      "Connect farmers with relevant buyers and discover better selling opportunities.",
    points: [
      "Buyer discovery",
      "Demand information",
      "Direct connections",
    ],
    action: "Find Buyers",
  },
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section id="features" className="features">
      <div className="features__container">
        <div className="features__heading">
          <div>
            <span className="features__eyebrow">
              ONE PLATFORM. EVERY DECISION.
            </span>

            <h2>
              Everything a farmer needs
              <span>to make smarter choices.</span>
            </h2>
          </div>

          <p>
            From crop health to the final sale, bring agricultural intelligence
            into one simple experience.
          </p>
        </div>

        <div className="features__interactive">
          <div className="features__tabs">
            {features.map((feature) => (
              <button
                key={feature.id}
                type="button"
                className={`feature-tab ${
                  activeFeature.id === feature.id ? "is-active" : ""
                }`}
                onClick={() => setActiveFeature(feature)}
              >
                <span className="feature-tab__number">
                  {feature.number}
                </span>

                <span className="feature-tab__icon">
                  {feature.icon}
                </span>

                <span className="feature-tab__content">
                  <strong>{feature.title}</strong>
                  <small>{feature.short}</small>
                </span>

                <span className="feature-tab__arrow">→</span>
              </button>
            ))}
          </div>

          <div className="features__preview">
            <div className="features__preview-header">
              <div className="features__preview-icon">
                {activeFeature.icon}
              </div>

              <span>AI-powered insight</span>
            </div>

            <h3>{activeFeature.title}</h3>

            <p>{activeFeature.description}</p>

            <div className="features__points">
              {activeFeature.points.map((point) => (
                <div key={point} className="features__point">
                  <span>✓</span>
                  {point}
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                const routes: Record<string, string> = {
                  health: "/dashboard?view=health",
                  market: "/dashboard?view=markets",
                  profit: "/dashboard?view=profit",
                  buyers: "/dashboard?view=buyers",
                };
                window.location.href = routes[activeFeature.id] ?? "/dashboard";
              }}
            >
              {activeFeature.action}
            </Button>

            <div className="features__preview-decoration">
              {activeFeature.id === "health" && (
                <>
                  <span>🌱</span>
                  <span>●</span>
                  <span>✓</span>
                </>
              )}

              {activeFeature.id === "market" && (
                <>
                  <span>₹</span>
                  <span>↗</span>
                  <span>📈</span>
                </>
              )}

              {activeFeature.id === "profit" && (
                <>
                  <span>₹48,620</span>
                  <span>+12.8%</span>
                </>
              )}

              {activeFeature.id === "buyers" && (
                <>
                  <span>🤝</span>
                  <span>12 buyers nearby</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}