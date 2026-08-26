"use client";

import { useMemo, useState } from "react";
import { CROP_CATEGORIES } from "@/data/categories";
import { CROPS } from "@/data/crops";
import type { CropCategory, DemandLevel } from "@/data/types";
import { useAgri } from "@/context/AgriContext";
import { searchCrops } from "@/services/cropService";
import DataModeBanner from "../DataModeBanner";
import MarketCard from "../MarketCard";

type SortKey = "highest" | "lowest" | "demand" | "increase";

const demandScore: Record<DemandLevel, number> = {
  high: 4,
  stable: 3,
  medium: 2,
  low: 1,
};

export default function MarketsView({
  onOpenCrop,
}: {
  onOpenCrop: (cropId: string) => void;
}) {
  const { quotes, flashing, watchlist, toggleWatchlist, markRecent } = useAgri();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CropCategory | "all">("all");
  const [demand, setDemand] = useState<DemandLevel | "all">("all");
  const [sort, setSort] = useState<SortKey>("highest");

  const cards = useMemo(() => {
    const list = searchCrops(query, category)
      .map((crop) => ({ crop, quote: quotes[crop.id] }))
      .filter((item) => item.quote)
      .filter((item) => demand === "all" || item.quote.demand === demand);

    list.sort((a, b) => {
      const aChange = a.quote.currentPrice - a.quote.previousPrice;
      const bChange = b.quote.currentPrice - b.quote.previousPrice;
      if (sort === "lowest") return a.quote.currentPrice - b.quote.currentPrice;
      if (sort === "demand") {
        return demandScore[b.quote.demand] - demandScore[a.quote.demand];
      }
      if (sort === "increase") return bChange - aChange;
      return b.quote.currentPrice - a.quote.currentPrice;
    });
    return list;
  }, [query, category, demand, sort, quotes]);

  return (
    <>
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">🔴 LIVE MARKET PRICES</span>
        <h1>Live Market Dashboard</h1>
        <p>
          Search vegetables, fruits, grains, pulses, oilseeds, spices and
          commercial crops. Demo prices auto-refresh in SIH Demo Mode.
        </p>
      </header>

      <DataModeBanner />

      <div className="filters-row filters-row--wrap">
        <input
          className="search-input"
          placeholder="Search Tomato, Mango, Rice..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CropCategory | "all")
          }
        >
          <option value="all">All Crops</option>
          {CROP_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
        <select
          value={demand}
          onChange={(event) =>
            setDemand(event.target.value as DemandLevel | "all")
          }
        >
          <option value="all">All demand</option>
          <option value="high">High demand</option>
          <option value="medium">Medium demand</option>
          <option value="stable">Stable demand</option>
          <option value="low">Low demand</option>
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
        >
          <option value="highest">Highest Price</option>
          <option value="lowest">Lowest Price</option>
          <option value="demand">Highest Demand</option>
          <option value="increase">Biggest Price Increase</option>
        </select>
      </div>

      <p className="muted">
        Showing {cards.length} of {CROPS.length} crops
      </p>

      <div className="market-grid">
        {cards.map(({ crop, quote }) => (
          <MarketCard
            key={crop.id}
            crop={crop}
            quote={quote}
            flashing={flashing[crop.id]}
            watched={watchlist.includes(crop.id)}
            onWatch={() => toggleWatchlist(crop.id)}
            onOpen={() => {
              markRecent(crop.id);
              onOpenCrop(crop.id);
            }}
          />
        ))}
      </div>
    </>
  );
}
