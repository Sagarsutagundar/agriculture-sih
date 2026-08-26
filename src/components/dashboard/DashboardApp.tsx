"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AgriProvider, useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";
import { formatINR } from "@/lib/format";
import type { FarmCrop } from "@/data/types";
import DashboardSidebar from "./DashboardSidebar";
import OverviewView from "./views/OverviewView";
import FarmerDashboardView from "./views/FarmerDashboardView";
import FarmerProfileView from "./views/FarmerProfileView";
import CropsView from "./views/CropsView";
import MarketsView from "./views/MarketsView";
import MarketDetailView from "./views/MarketDetailView";
import ProfitView from "./views/ProfitView";
import HealthView from "./views/HealthView";
import BuyersView from "./views/BuyersView";
import WatchlistView from "./views/WatchlistView";
import FarmerCropForm from "./FarmerCropForm";

export type DashboardView =
  | "farmer-dashboard"
  | "overview"
  | "profile"
  | "crops"
  | "markets"
  | "profit"
  | "health"
  | "buyers"
  | "watchlist";

function DashboardShell() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("view") as DashboardView | null) ?? "farmer-dashboard";
  const [view, setView] = useState<DashboardView>(
    ["farmer-dashboard", "overview", "profile", "crops", "markets", "profit", "health", "buyers", "watchlist"].includes(initial)
      ? initial
      : "farmer-dashboard",
  );
  const [detailCropId, setDetailCropId] = useState<string | null>(
    searchParams.get("crop"),
  );
  const [globalAddCropOpen, setGlobalAddCropOpen] = useState(false);

  const {
    sihDemo,
    setSihDemo,
    triggeredAlerts,
    dismissTriggeredAlert,
    forceTick,
    lastTickAt,
    addFarmCrop,
  } = useAgri();

  function openCropMarket(cropId: string) {
    setDetailCropId(cropId);
    setView("markets");
  }

  function handleSaveGlobalCrop(cropData: Omit<FarmCrop, "id">) {
    addFarmCrop(cropData);
    setGlobalAddCropOpen(false);
    setView("farmer-dashboard");
  }

  return (
    <div className="dashboard">
      <DashboardSidebar
        active={view}
        onSelect={(id) => {
          if (id === "add-crop") {
            setGlobalAddCropOpen(true);
            return;
          }
          setView(id as DashboardView);
          if (id !== "markets") setDetailCropId(null);
        }}
      />

      <main className="dashboard__main">
        <div className="dashboard-toolbar">
          <label className="sih-toggle">
            <input
              type="checkbox"
              checked={sihDemo}
              onChange={(event) => setSihDemo(event.target.checked)}
            />
            🎤 SIH Demo Mode
          </label>
          <button type="button" className="ghost-btn" onClick={forceTick}>
            Simulate price tick
          </button>
          <small suppressHydrationWarning>Clock {new Date(lastTickAt).toLocaleTimeString("en-IN")}</small>
        </div>

        {triggeredAlerts.map((alert) => {
          const crop = getCrop(alert.cropId);
          return (
            <div key={alert.id} className="toast">
              <span>
                🔔 {crop?.name} price crossed {formatINR(alert.threshold)} / {crop?.unit}
              </span>
              <button type="button" onClick={() => dismissTriggeredAlert(alert.id)}>
                Dismiss
              </button>
            </div>
          );
        })}

        {view === "farmer-dashboard" && (
          <FarmerDashboardView
            onOpenCropMarket={openCropMarket}
            onOpenProfile={() => setView("profile")}
            onOpenCrops={() => setView("crops")}
            onOpenMarkets={() => {
              setDetailCropId(null);
              setView("markets");
            }}
            onOpenHealth={() => setView("health")}
            onOpenProfit={() => setView("profit")}
            onOpenBuyers={() => setView("buyers")}
            onOpenAlerts={() => setView("watchlist")}
          />
        )}
        {view === "profile" && (
          <FarmerProfileView onSaved={() => setView("farmer-dashboard")} />
        )}
        {view === "overview" && (
          <OverviewView
            onOpenMarkets={() => {
              setDetailCropId(null);
              setView("markets");
            }}
            onOpenCrops={() => setView("crops")}
            onOpenCropMarket={openCropMarket}
          />
        )}
        {view === "crops" && <CropsView onOpenCropMarket={openCropMarket} />}
        {view === "markets" &&
          (detailCropId ? (
            <MarketDetailView
              cropId={detailCropId}
              onBack={() => setDetailCropId(null)}
            />
          ) : (
            <MarketsView onOpenCrop={openCropMarket} />
          ))}
        {view === "profit" && <ProfitView onOpenCrop={openCropMarket} />}
        {view === "health" && <HealthView />}
        {view === "buyers" && <BuyersView />}
        {view === "watchlist" && (
          <WatchlistView
            onOpenCrop={openCropMarket}
            onNavigate={(navView) => setView(navView as DashboardView)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="dashboard-mobile-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-nav-item ${view === "farmer-dashboard" ? "is-active" : ""}`}
          onClick={() => setView("farmer-dashboard")}
        >
          <span className="icon">🚜</span>
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${view === "crops" ? "is-active" : ""}`}
          onClick={() => setView("crops")}
        >
          <span className="icon">🌱</span>
          <span>My Crops</span>
        </button>

        <button
          type="button"
          className="mobile-nav-item mobile-nav-item--add"
          onClick={() => setGlobalAddCropOpen(true)}
          aria-label="Add New Crop"
        >
          <span className="add-circle">+</span>
          <span>Add Crop</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${view === "markets" ? "is-active" : ""}`}
          onClick={() => setView("markets")}
        >
          <span className="icon">📊</span>
          <span>Mandi</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${view === "profile" ? "is-active" : ""}`}
          onClick={() => setView("profile")}
        >
          <span className="icon">⚙️</span>
          <span>Farm Setup</span>
        </button>
      </nav>

      {/* Global Add Crop Modal */}
      {globalAddCropOpen && (
        <FarmerCropForm
          onSave={handleSaveGlobalCrop}
          onClose={() => setGlobalAddCropOpen(false)}
        />
      )}
    </div>
  );
}

export default function DashboardApp() {
  return (
    <AgriProvider>
      <DashboardShell />
    </AgriProvider>
  );
}
