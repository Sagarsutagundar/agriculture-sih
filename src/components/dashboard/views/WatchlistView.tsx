"use client";

import { useMemo, useState } from "react";
import { useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { BUYERS } from "@/data/buyers";
import { MARKETS } from "@/data/markets";
import { formatINR } from "@/lib/format";
import type { AlertPriority } from "@/data/types";
import "./WatchlistView.scss";

type PriorityFilter = "all" | AlertPriority;

export default function WatchlistView({
  onOpenCrop = () => {},
  onNavigate = () => {},
}: {
  onOpenCrop?: (cropId: string) => void;
  onNavigate?: (view: string) => void;
}) {
  const {
    smartAlerts,
    dismissSmartAlert,
    markSmartAlertRead,
    watchlist,
    toggleWatchlist,
    watchedMarkets,
    toggleWatchMarket,
    watchedBuyers,
    toggleWatchBuyer,
    quotes,
  } = useAgri();

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  // Priority counts
  const criticalCount = smartAlerts.filter((a) => a.priority === "critical").length;
  const importantCount = smartAlerts.filter((a) => a.priority === "important").length;
  const infoCount = smartAlerts.filter((a) => a.priority === "info").length;

  const filteredAlerts = useMemo(() => {
    if (priorityFilter === "all") return smartAlerts;
    return smartAlerts.filter((a) => a.priority === priorityFilter);
  }, [smartAlerts, priorityFilter]);

  // Icons for alert types
  const typeIcons: Record<string, string> = {
    market: "📈",
    crop: "🌱",
    harvest: "🚜",
    buyer: "🤝",
    weather: "🌦️",
  };

  return (
    <div className="watchlist-alerts-view">
      {/* Header */}
      <header className="alerts-header">
        <div className="alerts-header__left">
          <span className="eyebrow">
            <span>🔔</span> FARMER INTELLIGENCE & EVENT STREAM
          </span>
          <h1>Alert Center & Entity Watchlist</h1>
          <p>
            Real-time critical notices prioritized by immediacy, alongside your personal watchlist
            of tracked commodities, regional mandis, and corporate buyers.
          </p>
        </div>

        <div className="alerts-header__badge">
          <div className="counter-item">
            <strong className="crit">{criticalCount}</strong>
            <small>Critical</small>
          </div>
          <div className="counter-item">
            <strong className="imp">{importantCount}</strong>
            <small>Important</small>
          </div>
          <div className="counter-item">
            <strong className="info">{infoCount}</strong>
            <small>Info</small>
          </div>
        </div>
      </header>

      {/* Priority Filter Bar */}
      <section className="alerts-filter-bar">
        <div className="priority-tabs">
          <button
            type="button"
            className={priorityFilter === "all" ? "is-active" : ""}
            onClick={() => setPriorityFilter("all")}
          >
            All Alerts ({smartAlerts.length})
          </button>
          <button
            type="button"
            className={priorityFilter === "critical" ? "is-active" : ""}
            onClick={() => setPriorityFilter("critical")}
          >
            <span className="dot red" /> 🔴 Critical ({criticalCount})
          </button>
          <button
            type="button"
            className={priorityFilter === "important" ? "is-active" : ""}
            onClick={() => setPriorityFilter("important")}
          >
            <span className="dot orange" /> 🟠 Important ({importantCount})
          </button>
          <button
            type="button"
            className={priorityFilter === "info" ? "is-active" : ""}
            onClick={() => setPriorityFilter("info")}
          >
            <span className="dot blue" /> 🔵 Information ({infoCount})
          </button>
        </div>

        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          Prioritized automatically by farm risk
        </span>
      </section>

      {/* Alert Stream List */}
      <section className="alerts-stream-list">
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--color-surface)", borderRadius: "var(--radius-xl)" }}>
            <h3>No {priorityFilter !== "all" ? priorityFilter : ""} alerts currently active</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Your farm plots and monitored markets are operating within normal thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const icon = typeIcons[alert.type] || "🔔";
            const isCrit = alert.priority === "critical";
            const isImp = alert.priority === "important";
            const pClass = isCrit ? "crit" : isImp ? "imp" : "info";

            return (
              <article
                key={alert.id}
                className={`alert-card-smart ${pClass} ${alert.isRead ? "is-read" : ""}`}
              >
                <div className={`alert-type-icon-box ${alert.type}`}>
                  {icon}
                </div>

                <div className="alert-content-wrap">
                  <div className="top-meta">
                    <span className={`priority-badge ${pClass}`}>
                      {alert.priority}
                    </span>
                    <span className="type-label">{alert.type} signal</span>
                    <span className="timestamp">{alert.relativeTime}</span>
                  </div>

                  <h3>{alert.title}</h3>
                  <p>{alert.message}</p>

                  <div className="alert-actions-row">
                    {alert.actionLabel && (
                      <button
                        type="button"
                        className="action-link-btn"
                        onClick={() => {
                          if (alert.relatedCropId && alert.type === "market") {
                            onOpenCrop(alert.relatedCropId);
                          } else if (alert.actionView) {
                            onNavigate(alert.actionView);
                          }
                        }}
                      >
                        {alert.actionLabel} →
                      </button>
                    )}

                    {!alert.isRead && (
                      <button
                        type="button"
                        className="read-toggle-btn"
                        onClick={() => markSmartAlertRead(alert.id)}
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      type="button"
                      className="dismiss-btn"
                      onClick={() => dismissSmartAlert(alert.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Multi-Entity Watchlist Section */}
      <section className="multi-watchlist-section">
        <h2>
          <span>★</span> Your Followed Entities
        </h2>

        <div className="watchlist-3col-grid">
          {/* Tracked Crops */}
          <div className="watchlist-column-card">
            <h4>🌱 Tracked Crops ({watchlist.length})</h4>
            <div className="items-list">
              {watchlist.map((cropId) => {
                const crop = getCrop(cropId);
                const quote = quotes[cropId];
                if (!crop) return null;

                return (
                  <div key={cropId} className="watchlist-item">
                    <div className="info">
                      <span>{crop.emoji}</span>
                      <div>
                        <strong>{crop.name}</strong>
                        <small>
                          {quote ? formatINR(quote.currentPrice) : formatINR(crop.samplePrice)} / {crop.unit}
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-cross"
                      title="Unwatch Crop"
                      onClick={() => toggleWatchlist(cropId)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {watchlist.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                  No crops added yet. Star crops in Market Intelligence.
                </p>
              )}
            </div>
          </div>

          {/* Tracked Markets */}
          <div className="watchlist-column-card">
            <h4>🏢 Monitored Mandis ({watchedMarkets.length})</h4>
            <div className="items-list">
              {watchedMarkets.map((marketId) => {
                const m = MARKETS.find((item) => item.id === marketId);
                return (
                  <div key={marketId} className="watchlist-item">
                    <div className="info">
                      <span>📍</span>
                      <div>
                        <strong>{m?.name || marketId}</strong>
                        <small>{m?.distanceKm ? `${m.distanceKm} km away` : "Regional Mandi"}</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-cross"
                      title="Unwatch Market"
                      onClick={() => toggleWatchMarket(marketId)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {watchedMarkets.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                  No markets tracked. Click &apos;Track&apos; on regional mandi tables.
                </p>
              )}
            </div>
          </div>

          {/* Followed Buyers */}
          <div className="watchlist-column-card">
            <h4>🤝 Followed Buyers ({watchedBuyers.length})</h4>
            <div className="items-list">
              {watchedBuyers.map((buyerId) => {
                const b = BUYERS.find((item) => item.id === buyerId);
                return (
                  <div key={buyerId} className="watchlist-item">
                    <div className="info">
                      <span>💼</span>
                      <div>
                        <strong>{b?.name || buyerId}</strong>
                        <small>{b?.location || "Procurement Buyer"}</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-cross"
                      title="Unfollow Buyer"
                      onClick={() => toggleWatchBuyer(buyerId)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {watchedBuyers.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                  No buyers followed yet. Follow buyers in Buyer Network.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
