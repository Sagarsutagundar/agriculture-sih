"use client";

import type { Insight } from "@/services/insightsService";

export default function SmartInsights({ insights }: { insights: Insight[] }) {
  return (
    <section className="insights-panel">
      <div className="insights-panel__header">
        <span>SMART INSIGHTS</span>
        <h2>What changed on your farm</h2>
      </div>
      <div className="insights-list">
        {insights.length === 0 && <p>Insights will appear as market data updates.</p>}
        {insights.map((insight) => (
          <article key={insight.id} className={`insight insight--${insight.tone}`}>
            {insight.text}
          </article>
        ))}
      </div>
    </section>
  );
}
