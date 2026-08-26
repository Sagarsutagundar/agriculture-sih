"use client";

import { useState } from "react";
import "./HowItWorks.scss";

const steps = [
  {
    number: "01",
    icon: "🌱",
    title: "Tell us about your crop",
    description:
      "Add your crop, quantity, location, and other relevant information. You can also upload a crop image for health analysis.",
    visual: "crop",
  },
  {
    number: "02",
    icon: "🤖",
    title: "AI analyzes your options",
    description:
      "The platform combines crop information with market prices, demand, transportation costs, storage expenses, losses, and market risk.",
    visual: "analysis",
  },
  {
    number: "03",
    icon: "📊",
    title: "Compare your opportunities",
    description:
      "See different markets and selling strategies side by side, including their estimated costs, risks, and expected returns.",
    visual: "markets",
  },
  {
    number: "04",
    icon: "💰",
    title: "Get your best decision",
    description:
      "Receive a simple recommendation such as Sell Now, Wait, Store, Sell Elsewhere, or Split Sell.",
    visual: "decision",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(steps[0]);

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__container">
        <div className="how-it-works__heading">
          <span className="how-it-works__eyebrow">
            HOW IT WORKS
          </span>

          <h2>
            From your crop
            <span>to a smarter sale.</span>
          </h2>

          <p>
            Complex agricultural data becomes a simple, actionable decision
            designed around your situation.
          </p>
        </div>

        <div className="how-it-works__content">
          <div className="how-it-works__steps">
            {steps.map((step) => (
              <button
                key={step.number}
                type="button"
                className={`how-step ${
                  activeStep.number === step.number ? "is-active" : ""
                }`}
                onClick={() => setActiveStep(step)}
              >
                <span className="how-step__number">
                  {step.number}
                </span>

                <span className="how-step__icon">
                  {step.icon}
                </span>

                <span className="how-step__text">
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="how-it-works__visual">
            <div className="how-visual__header">
              <span>STEP {activeStep.number}</span>
              <span>AI DECISION ENGINE</span>
            </div>

            <div className="how-visual__main">
              {activeStep.visual === "crop" && (
                <div className="visual-card visual-card--crop">
                  <div className="visual-card__crop-icon">
                    🌾
                  </div>

                  <span>YOUR CROP</span>
                  <strong>Tomato</strong>

                  <div className="visual-input">
                    <span>Quantity</span>
                    <b>500 kg</b>
                  </div>

                  <div className="visual-input">
                    <span>Location</span>
                    <b>Your farm</b>
                  </div>
                </div>
              )}

              {activeStep.visual === "analysis" && (
                <div className="visual-card visual-card--analysis">
                  <div className="analysis-ring">
                    <span>AI</span>
                  </div>

                  <strong>Analyzing options...</strong>

                  <div className="analysis-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <small>
                    Market prices · Transport · Storage · Risk
                  </small>
                </div>
              )}

              {activeStep.visual === "markets" && (
                <div className="visual-card visual-card--markets">
                  <div className="market-row market-row--best">
                    <span>APMC Market</span>
                    <strong>₹48,620</strong>
                    <small>Best option</small>
                  </div>

                  <div className="market-row">
                    <span>Local Market</span>
                    <strong>₹43,200</strong>
                    <small>Medium risk</small>
                  </div>

                  <div className="market-row">
                    <span>City Market</span>
                    <strong>₹45,850</strong>
                    <small>Higher transport</small>
                  </div>
                </div>
              )}

              {activeStep.visual === "decision" && (
                <div className="visual-card visual-card--decision">
                  <div className="decision-icon">✓</div>

                  <span>RECOMMENDED ACTION</span>

                  <strong>Sell at APMC Market</strong>

                  <p>
                    Expected net profit is higher after transportation,
                    storage, losses, and market risk.
                  </p>

                  <div className="decision-profit">
                    <span>Expected profit</span>
                    <b>₹48,620</b>
                  </div>
                </div>
              )}
            </div>

            <div className="how-visual__footer">
              <span>← Click each step to explore</span>
              <span>● Live decision preview</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}