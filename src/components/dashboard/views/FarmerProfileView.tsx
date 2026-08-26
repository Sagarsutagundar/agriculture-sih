"use client";
import { useState, type FormEvent } from "react";
import { useAgri } from "@/context/AgriContext";
import type { FarmerProfile, FarmingType, IrrigationType, SoilType } from "@/data/types";
import "./FarmerProfileView.scss";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const FARMING_TYPES: { id: FarmingType; label: string }[] = [
  { id: "organic", label: "🌿 100% Organic" },
  { id: "conventional", label: "🚜 Conventional / Modern" },
  { id: "mixed", label: "🌾 Mixed / Integrated" },
  { id: "other", label: "✨ Natural / ZBNF" },
];

const IRRIGATION_TYPES: { id: IrrigationType; label: string }[] = [
  { id: "drip", label: "💧 Drip Irrigation" },
  { id: "sprinkler", label: "🚿 Sprinkler System" },
  { id: "canal", label: "🌊 Canal / River Water" },
  { id: "borewell", label: "🚰 Borewell / Tube Well" },
  { id: "rain-fed", label: "🌧️ Rain-fed" },
  { id: "other", label: "⚙️ Other System" },
];

const SOIL_TYPES: { id: SoilType; label: string }[] = [
  { id: "black", label: "Black Soil (Regur)" },
  { id: "alluvial", label: "Alluvial Soil" },
  { id: "red", label: "Red & Yellow Soil" },
  { id: "loamy", label: "Loamy Soil" },
  { id: "clay", label: "Clay Soil" },
  { id: "sandy", label: "Sandy Loam" },
  { id: "other", label: "Laterite / Other" },
];

export default function FarmerProfileView({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const { farmerProfile, setFarmerProfile } = useAgri();

  const [name, setName] = useState(farmerProfile?.name ?? "Raj Kumar");
  const [phone, setPhone] = useState(farmerProfile?.phone ?? "9876543210");
  const [email, setEmail] = useState(farmerProfile?.email ?? "raj.kumar@agri.in");
  const [state, setState] = useState(farmerProfile?.state ?? "Maharashtra");
  const [district, setDistrict] = useState(farmerProfile?.district ?? "Nashik");
  const [location, setLocation] = useState(farmerProfile?.location ?? "Dindori Taluka");
  const [farmSizeAcres, setFarmSizeAcres] = useState<number | string>(
    farmerProfile?.farmSizeAcres ?? 10,
  );
  const [farmingType, setFarmingType] = useState<FarmingType>(
    farmerProfile?.farmingType ?? "organic",
  );
  const [irrigationType, setIrrigationType] = useState<IrrigationType>(
    farmerProfile?.irrigationType ?? "drip",
  );
  const [soilType, setSoilType] = useState<SoilType>(
    farmerProfile?.soilType ?? "black",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Farmer name is required";
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!state) newErrors.state = "State selection is required";
    if (!district.trim()) newErrors.district = "District is required";
    if (!farmSizeAcres || Number(farmSizeAcres) <= 0) {
      newErrors.farmSizeAcres = "Farm size must be greater than 0 acres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const profileData: FarmerProfile = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      state,
      district: district.trim(),
      location: location.trim(),
      farmSizeAcres: Number(farmSizeAcres),
      farmingType,
      irrigationType,
      soilType,
    };

    setFarmerProfile(profileData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onSaved) onSaved();
    }, 1500);
  }

  return (
    <div className="farmer-profile-container">
      <header className="dashboard-header">
        <span className="dashboard-header__eyebrow">FARM SETUP & PROFILE</span>
        <h1>Farmer Profile & Farm Settings</h1>
        <p>
          Configure your personal details, farm location, soil classification, and irrigation setup
          to tailor market forecasts and yield recommendations.
        </p>
      </header>

      {showSuccess && (
        <div className="profile-toast-success" role="alert">
          <span>✓</span> Farm Profile saved successfully! Updating dashboard...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="profile-card">
          <h2 className="profile-card__section-title">👤 Personal & Contact Information</h2>
          <div className="form-grid-3">
            <div className="form-field">
              <label htmlFor="farmerName">
                Farmer Full Name <span className="required">*</span>
              </label>
              <input
                id="farmerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "has-error" : ""}
                placeholder="e.g. Raj Kumar"
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="farmerPhone">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                id="farmerPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "has-error" : ""}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="farmerEmail">Email Address</label>
              <input
                id="farmerEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional email"
              />
            </div>
          </div>
        </div>

        <div className="profile-card" style={{ marginTop: 24 }}>
          <h2 className="profile-card__section-title">📍 Farm Geography & Location</h2>
          <div className="form-grid-3">
            <div className="form-field">
              <label htmlFor="stateSelect">
                State <span className="required">*</span>
              </label>
              <select
                id="stateSelect"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={errors.state ? "has-error" : ""}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <p className="field-error">{errors.state}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="districtInput">
                District <span className="required">*</span>
              </label>
              <input
                id="districtInput"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={errors.district ? "has-error" : ""}
                placeholder="e.g. Nashik, Ludhiana"
              />
              {errors.district && <p className="field-error">{errors.district}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="locationInput">Village / Taluka / Landmark</label>
              <input
                id="locationInput"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dindori Taluka"
              />
            </div>
          </div>
        </div>

        <div className="profile-card" style={{ marginTop: 24 }}>
          <h2 className="profile-card__section-title">🌱 Agronomic Characteristics</h2>
          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="farmSize">
                Total Farm Size (Acres) <span className="required">*</span>
              </label>
              <input
                id="farmSize"
                type="number"
                step="0.5"
                min="0.1"
                value={farmSizeAcres}
                onChange={(e) => setFarmSizeAcres(e.target.value)}
                className={errors.farmSizeAcres ? "has-error" : ""}
              />
              {errors.farmSizeAcres && <p className="field-error">{errors.farmSizeAcres}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="farmingTypeSelect">Farming Method</label>
              <select
                id="farmingTypeSelect"
                value={farmingType}
                onChange={(e) => setFarmingType(e.target.value as FarmingType)}
              >
                {FARMING_TYPES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="irrigationSelect">Irrigation Method</label>
              <select
                id="irrigationSelect"
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value as IrrigationType)}
              >
                {IRRIGATION_TYPES.map((irr) => (
                  <option key={irr.id} value={irr.id}>
                    {irr.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="soilSelect">Soil Type</label>
              <select
                id="soilSelect"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
              >
                {SOIL_TYPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="profile-form-actions">
          <button type="submit" className="primary-btn">
            Save Farm Profile
          </button>
        </div>
      </form>
    </div>
  );
}
