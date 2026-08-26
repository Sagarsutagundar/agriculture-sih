"use client";

import { useAgri } from "@/context/AgriContext";

export default function DataModeBanner() {
  const { isLiveGovernmentData, sourceLabel, lastTickAt, sihDemo } = useAgri();

  return (
    <div
      className={`data-banner ${
        isLiveGovernmentData ? "data-banner--live" : "data-banner--demo"
      }`}
    >
      <div>
        <strong>
          {isLiveGovernmentData ? "LIVE MARKET DATA" : sourceLabel}
        </strong>
        <span>
          {isLiveGovernmentData
            ? "Connected to the configured market API."
            : "Live API Ready – Showing Demo Data. Sample prices are configurable until a government/API source is connected."}
        </span>
      </div>
      <div className="data-banner__meta">
        {sihDemo && !isLiveGovernmentData && (
          <span className="live-pill">
            <span className="live-pill__dot" />
            LIVE DEMO
          </span>
        )}
        <small>
          Last updated {new Date(lastTickAt).toLocaleTimeString("en-IN")}
        </small>
      </div>
    </div>
  );
}
