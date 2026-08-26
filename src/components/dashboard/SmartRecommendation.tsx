"use client";

import type { SmartRecommendation } from "@/services/recommendationService";
import { formatINR, formatPrice } from "@/lib/format";

export default function SmartRecommendationCard({
  recommendation,
  onOpenMarket,
}: {
  recommendation: SmartRecommendation | null;
  onOpenMarket?: () => void;
}) {
  if (!recommendation) {
    return (
      <section className="dashboard-recommendation">
        <div>
          <span className="dashboard-recommendation__label">
            RULE-BASED SMART RECOMMENDATION
          </span>
          <h2>Add a crop to get a selling recommendation</h2>
          <p>
            Recommendations use current price, distance, demand and trend. AI/ML
            scoring can replace this later without changing the dashboard.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-recommendation">
      <div>
        <span className="dashboard-recommendation__label">
          🤖 RULE-BASED SMART RECOMMENDATION
        </span>
        <h2>
          Sell {recommendation.cropName} at {recommendation.bestMarketName}
        </h2>
        <p>
          Best selling recommendation based on current crop, market price,
          distance, demand and trend. This is a rule-based engine until real
          AI/ML logic is connected.
        </p>
        <ul className="reco-list">
          {recommendation.reasons.map((reason) => (
            <li key={reason}>✓ {reason}</li>
          ))}
        </ul>
        {onOpenMarket && (
          <button type="button" className="text-button" onClick={onOpenMarket}>
            View all markets →
          </button>
        )}
      </div>
      <div className="dashboard-recommendation__value">
        <span>Best price</span>
        <strong>
          {formatPrice(recommendation.bestPrice, recommendation.unit)}
        </strong>
        <span>Estimated revenue {formatINR(recommendation.estimatedRevenue)}</span>
        {recommendation.improvementVsLocal > 0 && (
          <span>
            Potential improvement {formatINR(recommendation.improvementVsLocal)} vs Local Market
          </span>
        )}
      </div>
    </section>
  );
}
