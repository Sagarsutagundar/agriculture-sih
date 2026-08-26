import type { DemandLevel, PriceTrend, PriceUnit } from "@/data/types";

export function formatINR(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(Math.round(value * 10 ** fractionDigits) / 10 ** fractionDigits);
}

export function formatPrice(value: number, unit: PriceUnit) {
  const digits = unit === "quintal" ? 0 : value >= 100 ? 0 : 0;
  return `${formatINR(value, digits)} / ${unit}`;
}

export function formatSignedINR(value: number) {
  const abs = formatINR(Math.abs(value));
  if (value > 0) return `↑ ${abs}`;
  if (value < 0) return `↓ ${abs}`;
  return abs;
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function relativeTime(timestamp: number, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 8) return "Just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function demandLabel(demand: DemandLevel) {
  if (demand === "high") return "High Demand";
  if (demand === "medium") return "Medium Demand";
  if (demand === "low") return "Low Demand";
  return "Stable Demand";
}

export function trendLabel(trend: PriceTrend) {
  if (trend === "rising") return "Rising";
  if (trend === "falling") return "Falling";
  return "Stable";
}

export function unitLabel(unit: PriceUnit) {
  return unit === "quintal" ? "₹/quintal" : "₹/kg";
}
