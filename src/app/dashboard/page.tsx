import { Suspense } from "react";
import DashboardApp from "@/components/dashboard/DashboardApp";
import "./dashboard.scss";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading">Loading AgriSmart…</div>}>
      <DashboardApp />
    </Suspense>
  );
}
