"use client";

import { useAgri, useFarmStats } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { buildSmartRecommendation } from "@/services/recommendationService";
import { formatINR, formatPrice } from "@/lib/format";
import SmartRecommendationCard from "../SmartRecommendation";

export default function ProfitView({
  onOpenCrop,
}: {
  onOpenCrop: (cropId: string) => void;
}) {
  const { farmCrops, quotes } = useAgri();
  const { liveValue, cropValues, recommendation } = useFarmStats();

  return (
    <>
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">PROFIT ADVISOR</span>
        <h1>Rule-based selling advisor</h1>
        <p>
          Compare estimated crop value across your fields. AI/ML can replace
          this scoring later.
        </p>
      </header>

      <div className="dashboard-stat" style={{ maxWidth: 360 }}>
        <span>💰</span>
        <p>Live farm crop value</p>
        <strong>{formatINR(liveValue)}</strong>
      </div>

      <SmartRecommendationCard
        recommendation={recommendation}
        onOpenMarket={() =>
          recommendation ? onOpenCrop(recommendation.cropId) : undefined
        }
      />

      <div className="farm-crop-grid">
        {farmCrops.map((farmCrop) => {
          const crop = getCrop(farmCrop.cropId);
          const quote = quotes[farmCrop.cropId];
          if (!crop || !quote) return null;
          const rec = buildSmartRecommendation(farmCrop, quote);
          const value = cropValues.find((item) => item.farmCrop.id === farmCrop.id);
          return (
            <article key={farmCrop.id} className="farm-crop-card">
              <div>
                <h3>
                  {crop.emoji} {crop.name}
                </h3>
                <ul>
                  <li>Yield {farmCrop.estimatedYield} {crop.unit}</li>
                  <li>Price {formatPrice(quote.currentPrice, crop.unit)}</li>
                  <li>Value {formatINR(value?.current ?? 0)}</li>
                  <li>Best market {rec?.bestMarketName}</li>
                </ul>
                <button type="button" className="primary-btn" onClick={() => onOpenCrop(crop.id)}>
                  Open market details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
