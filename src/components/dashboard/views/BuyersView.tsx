"use client";

import { BUYERS } from "@/data/buyers";
import { useAgri } from "@/context/AgriContext";
import { getCrop } from "@/services/cropService";

export default function BuyersView() {
  const { farmCrops } = useAgri();
  const farmCropIds = farmCrops.map((item) => item.cropId);

  const matched = BUYERS.filter((buyer) =>
    buyer.cropIds.some((id) => farmCropIds.includes(id)),
  );
  const others = BUYERS.filter((buyer) => !matched.includes(buyer));

  return (
    <>
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">BUYERS</span>
        <h1>Potential buyers</h1>
        <p>
          Sample buyer matches based on the crops you are growing. Direct
          connections can be wired to a real marketplace later.
        </p>
      </header>

      <h3 className="section-kicker">Matched to your farm</h3>
      <div className="buyer-grid">
        {matched.map((buyer) => (
          <article key={buyer.id} className="buyer-card">
            <h3>{buyer.name}</h3>
            <small>{buyer.type} · {buyer.distanceKm} km</small>
            <p>{buyer.offerNote}</p>
            <p>
              Interested in{" "}
              {buyer.cropIds
                .filter((id) => farmCropIds.includes(id))
                .map((id) => getCrop(id)?.name)
                .filter(Boolean)
                .join(", ")}
            </p>
            <button type="button" className="primary-btn">
              Save buyer
            </button>
          </article>
        ))}
      </div>

      <h3 className="section-kicker">Other nearby buyers</h3>
      <div className="buyer-grid">
        {others.map((buyer) => (
          <article key={buyer.id} className="buyer-card">
            <h3>{buyer.name}</h3>
            <small>{buyer.type} · {buyer.distanceKm} km</small>
            <p>{buyer.offerNote}</p>
          </article>
        ))}
      </div>
    </>
  );
}
