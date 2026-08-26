"use client";

import Button from "@/components/common/Button";
import "./PlatformCTA.scss";

export default function PlatformCTA() {
  return (
    <section className="platform-cta-section">
      <div className="platform-cta-container">
        <div className="platform-cta-card">
          <div className="platform-cta-card__content">
            <span className="platform-cta-badge">GET STARTED TODAY</span>
            <h2>
              Take Control of Your Farm's Future
              <span>Start Tracking Crops & Mandi Prices in Minutes</span>
            </h2>
            <p>
              Join thousands of progressive farmers using data-driven intelligence to boost plot
              yields, prevent pest risks, and sell at the highest-paying APMC markets.
            </p>

            <div className="platform-cta-actions">
              <Button
                onClick={() => {
                  window.location.href = "/dashboard?view=profile";
                }}
              >
                🌾 Set Up Your Farm Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                🚜 Explore Live Dashboard
              </Button>
            </div>

            <div className="platform-cta-trust-chips">
              <span>✓ 100% Free for Individual Farmers</span>
              <span>✓ 50+ Crops & Varieties Supported</span>
              <span>✓ Real-Time Mandi Benchmark Rates</span>
              <span>✓ Works on Any Mobile Device</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
