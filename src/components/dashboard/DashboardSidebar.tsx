import Link from "next/link";
import { useAgri } from "@/context/AgriContext";
import "./DashboardSidebar.scss";

type DashboardSidebarProps = {
  active?: string;
  onSelect?: (id: string) => void;
};

const navigation = [
  { id: "farmer-dashboard", icon: "🚜", label: "Farmer Dashboard" },
  { id: "crops", icon: "🌱", label: "My Crops" },
  { id: "profile", icon: "⚙️", label: "Farm Profile" },
  { id: "markets", icon: "📊", label: "Live Market" },
  { id: "profit", icon: "₹", label: "Profit Advisor" },
  { id: "health", icon: "🩺", label: "Crop Health" },
  { id: "buyers", icon: "🤝", label: "Buyers" },
  { id: "watchlist", icon: "★", label: "Watchlist & Alerts" },
  { id: "overview", icon: "⌂", label: "Market Overview" },
];

export default function DashboardSidebar({
  active = "farmer-dashboard",
  onSelect = () => {},
}: DashboardSidebarProps) {
  const { farmerProfile } = useAgri();
  const displayName = farmerProfile?.name || "Raj Kumar";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <div className="dashboard-sidebar__logo">🌾</div>

        <div>
          <strong>AgriSmart</strong>
          <span>Farmer Portal</span>
        </div>
      </div>

      <div className="dashboard-sidebar__section">
        <span className="dashboard-sidebar__label">
          WORKSPACE
        </span>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dashboard-nav ${
                active === item.id ? "is-active" : ""
              }`}
              onClick={() => onSelect(item.id)}
            >
              <span className="dashboard-nav__icon">
                {item.icon}
              </span>

              <span>{item.label}</span>

              {active === item.id && (
                <span className="dashboard-nav__indicator" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="dashboard-sidebar__bottom">
        <button
          type="button"
          className="dashboard-sidebar__help"
          onClick={() => onSelect("profile")}
        >
          <span className="dashboard-sidebar__help-icon">
            ⚙️
          </span>

          <div>
            <strong>Farm Setup</strong>
            <span>Edit soil & irrigation</span>
          </div>
        </button>

        <div className="dashboard-sidebar__profile">
          <div className="dashboard-sidebar__avatar">
            {initials}
          </div>

          <div>
            <strong>{displayName}</strong>
            <span>Farmer</span>
          </div>

          <Link href="/" aria-label="Back to home">
            ⋮
          </Link>
        </div>
      </div>
    </aside>
  );
}