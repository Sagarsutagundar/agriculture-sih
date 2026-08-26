"use client";

import { useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { formatINR } from "@/lib/format";

export default function WatchlistView({
  onOpenCrop,
}: {
  onOpenCrop: (cropId: string) => void;
}) {
  const {
    watchlist,
    toggleWatchlist,
    alerts,
    removeAlert,
    recentCropIds,
    quotes,
  } = useAgri();

  return (
    <>
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">WATCHLIST & ALERTS</span>
        <h1>Favorites and price alerts</h1>
      </header>

      <h3 className="section-kicker">Favorite crops</h3>
      <div className="chip-row">
        {watchlist.map((cropId) => {
          const crop = getCrop(cropId);
          const quote = quotes[cropId];
          if (!crop) return null;
          return (
            <button
              key={cropId}
              type="button"
              className="chip"
              onClick={() => onOpenCrop(cropId)}
            >
              {crop.emoji} {crop.name} {quote ? formatINR(quote.currentPrice) : ""}
              <span
                role="presentation"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleWatchlist(cropId);
                }}
              >
                ✕
              </span>
            </button>
          );
        })}
        {watchlist.length === 0 && <p>Star crops in the live market to watch them.</p>}
      </div>

      <h3 className="section-kicker">Price alerts</h3>
      <div className="buyer-grid">
        {alerts.map((alert) => {
          const crop = getCrop(alert.cropId);
          return (
            <article key={alert.id} className="buyer-card">
              <h3>
                🔔 {crop?.name} {alert.direction} {formatINR(alert.threshold)}
              </h3>
              <p>{alert.triggeredAt ? "Triggered" : "Watching"}</p>
              <button type="button" className="danger-btn" onClick={() => removeAlert(alert.id)}>
                Remove
              </button>
            </article>
          );
        })}
        {alerts.length === 0 && <p>Create alerts from any crop&apos;s market details page.</p>}
      </div>

      <h3 className="section-kicker">Recently viewed</h3>
      <div className="chip-row">
        {recentCropIds.map((cropId) => {
          const crop = getCrop(cropId);
          if (!crop) return null;
          return (
            <button key={cropId} type="button" className="chip" onClick={() => onOpenCrop(cropId)}>
              {crop.emoji} {crop.name}
            </button>
          );
        })}
      </div>
    </>
  );
}
