"use client";

import { useMemo, useState } from "react";
import { useAgri } from "@/context/AgriContext";
import { BUYERS } from "@/data/buyers";
import { getCrop } from "@/services/cropService";
import { formatINR } from "@/lib/format";
import "./BuyersView.scss";

type TabFilter = "matched" | "all";

export default function BuyersView() {
  const { farmCrops, buyerMatches, watchedBuyers, toggleWatchBuyer, isBuyerWatched } =
    useAgri();

  const [activeTab, setActiveTab] = useState<TabFilter>("matched");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedBuyerIds, setConnectedBuyerIds] = useState<string[]>([]);

  // Toggle connection / harvest inquiry
  function handleConnect(buyerId: string) {
    if (connectedBuyerIds.includes(buyerId)) {
      setConnectedBuyerIds((prev) => prev.filter((id) => id !== buyerId));
    } else {
      setConnectedBuyerIds((prev) => [...prev, buyerId]);
    }
  }

  // Filtered buyers
  const displayedBuyers = useMemo(() => {
    const list = BUYERS.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesType = b.type.toLowerCase().includes(q);
        const matchesLoc = b.location.toLowerCase().includes(q);
        const matchesCrops = b.cropIds.some((cid) =>
          getCrop(cid)?.name.toLowerCase().includes(q),
        );
        if (!matchesName && !matchesType && !matchesLoc && !matchesCrops) {
          return false;
        }
      }

      if (activeTab === "matched") {
        const farmCropIds = farmCrops.map((c) => c.cropId);
        return b.cropIds.some((cid) => farmCropIds.includes(cid));
      }

      return true;
    });

    return list;
  }, [activeTab, searchQuery, farmCrops]);

  return (
    <div className="buyer-network-view">
      {/* Header */}
      <header className="buyer-header">
        <div className="buyer-header__left">
          <span className="eyebrow">
            <span>🤝</span> DIRECT FARM-TO-BUYER MARKETPLACE
          </span>
          <h1>Buyer Network & Demand Matching</h1>
          <p>
            Verified institutional aggregators, modern retail chains, and APMC commission agents
            matched directly against your projected harvest volume.
          </p>
        </div>

        <div className="buyer-header__badge">
          <strong>{buyerMatches.length} Direct Matches</strong>
          <small>Based on your {farmCrops.length} active cultivated plots</small>
        </div>
      </header>

      {/* Tabs & Search Filter */}
      <section className="buyer-filters-bar">
        <div className="filter-tabs">
          <button
            type="button"
            className={activeTab === "matched" ? "is-active" : ""}
            onClick={() => setActiveTab("matched")}
          >
            Matched to My Crops ({buyerMatches.length})
          </button>
          <button
            type="button"
            className={activeTab === "all" ? "is-active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All Regional Buyers ({BUYERS.length})
          </button>
        </div>

        <div className="filter-search-box">
          <input
            type="text"
            placeholder="Search by buyer name, city, crop requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Best Matches Spotlight */}
      {activeTab === "matched" && buyerMatches.length > 0 && (
        <section className="best-matches-section">
          <div className="best-matches-section__heading">
            <h3>
              <span>🎯</span> Algorithmic Procurement Matches
            </h3>
            <small>
              Scored by volume alignment, transport distance, and price competitiveness
            </small>
          </div>

          <div className="buyers-grid">
            {buyerMatches.slice(0, 3).map((match) => {
              const b = match.buyer;
              const isConnected = connectedBuyerIds.includes(b.id);
              const isWatched = isBuyerWatched(b.id);

              return (
                <article
                  key={`best-${b.id}`}
                  className="buyer-card-smart is-matched"
                >
                  <div className="match-badge-header">
                    <span className="match-percent-pill">
                      ★ {match.matchPercentage}% MATCH
                    </span>
                    <span className="verified-chip">✓ Verified Buyer</span>
                  </div>

                  <div className="buyer-card-smart__header">
                    <div>
                      <h3>{b.name}</h3>
                      <span className="buyer-type-label">{b.type}</span>
                    </div>
                    <span className="rating-pill">⭐ {b.rating}</span>
                  </div>

                  {/* Requirements */}
                  <div className="buyer-card-smart__req-grid">
                    <div>
                      <small>Crop Demanded</small>
                      <strong>
                        {match.matchedCropEmoji} {match.matchedCropName}
                      </strong>
                    </div>
                    <div>
                      <small>Target Lot Size</small>
                      <strong>
                        {b.requiredQuantity} {b.quantityUnit}
                      </strong>
                    </div>
                    <div>
                      <small>Indicative Offer Rate</small>
                      <strong className="price-highlight">
                        ₹{b.indicativePrice.toLocaleString("en-IN")} / {b.quantityUnit === "kg" ? "kg" : "Q"}
                      </strong>
                    </div>
                    <div>
                      <small>Demand Priority</small>
                      <strong
                        style={{
                          color: b.demandStatus === "Urgent" ? "#c62828" : "#2e7d32",
                        }}
                      >
                        {b.demandStatus.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* Why it matches */}
                  <div className="buyer-card-smart__reason-box">
                    <strong>Match Rationale:</strong>
                    <span>{match.matchReason}</span>
                  </div>

                  <p className="buyer-card-smart__note">{b.offerNote}</p>

                  <div className="buyer-card-smart__footer">
                    <div className="distance-posted">
                      <strong>📍 {b.location} ({b.distanceKm} km)</strong>
                      <small>Posted {b.postedDate}</small>
                    </div>

                    <button
                      type="button"
                      className={`connect-btn ${isConnected ? "is-connected" : ""}`}
                      onClick={() => handleConnect(b.id)}
                    >
                      {isConnected ? "✓ Offer Sent" : "Connect / Sell"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Full Grid */}
      <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "18px", color: "var(--color-text-primary)" }}>
          {activeTab === "matched" ? "Other Eligible Buyers" : "All Regional Buyers"} ({displayedBuyers.length})
        </h3>

        {displayedBuyers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", background: "var(--color-surface)", borderRadius: "var(--radius-xl)" }}>
            <h4>No matching buyers found</h4>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Try searching a different crop name or reset your filter.
            </p>
          </div>
        ) : (
          <div className="buyers-grid">
            {displayedBuyers.map((b) => {
              const isConnected = connectedBuyerIds.includes(b.id);
              const isWatched = isBuyerWatched(b.id);
              const matchedMatch = buyerMatches.find((m) => m.buyer.id === b.id);

              return (
                <article key={b.id} className="buyer-card-smart">
                  <div className="match-badge-header">
                    {matchedMatch ? (
                      <span className="match-percent-pill">
                        {matchedMatch.matchPercentage}% Plot Fit
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        Regional Buyer
                      </span>
                    )}
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: isWatched ? "#f57f17" : "var(--color-text-muted)",
                        fontWeight: 600,
                      }}
                      onClick={() => toggleWatchBuyer(b.id)}
                    >
                      {isWatched ? "★ Following" : "☆ Follow Buyer"}
                    </button>
                  </div>

                  <div className="buyer-card-smart__header">
                    <div>
                      <h3>{b.name}</h3>
                      <span className="buyer-type-label">{b.type}</span>
                    </div>
                    <span className="rating-pill">⭐ {b.rating}</span>
                  </div>

                  <div className="buyer-card-smart__req-grid">
                    <div>
                      <small>Crop Interests</small>
                      <strong>
                        {b.cropIds
                          .map((id) => getCrop(id)?.name)
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(", ")}
                      </strong>
                    </div>
                    <div>
                      <small>Requirement</small>
                      <strong>
                        {b.requiredQuantity} {b.quantityUnit}
                      </strong>
                    </div>
                    <div>
                      <small>Indicative Price</small>
                      <strong className="price-highlight">
                        ₹{b.indicativePrice.toLocaleString("en-IN")} / {b.quantityUnit === "kg" ? "kg" : "Q"}
                      </strong>
                    </div>
                    <div>
                      <small>Demand Priority</small>
                      <strong>{b.demandStatus}</strong>
                    </div>
                  </div>

                  <p className="buyer-card-smart__note">{b.offerNote}</p>

                  <div className="buyer-card-smart__footer">
                    <div className="distance-posted">
                      <strong>📍 {b.location} ({b.distanceKm} km)</strong>
                      <small>Active • {b.postedDate}</small>
                    </div>

                    <button
                      type="button"
                      className={`connect-btn ${isConnected ? "is-connected" : ""}`}
                      onClick={() => handleConnect(b.id)}
                    >
                      {isConnected ? "✓ Offer Sent" : "Send Quote"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
