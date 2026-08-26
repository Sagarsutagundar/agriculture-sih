"use client";

import { useState, useMemo, type FormEvent } from "react";
import { useAgri, getProfileCompletion } from "@/context/AgriContext";
import type { FarmerProfile, FarmingType, IrrigationType, SoilType } from "@/data/types";
import "./FarmerProfileView.scss";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
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
  "Uttarakhand",
  "West Bengal",
];

const FARMING_TYPES: { id: FarmingType; label: string; desc: string }[] = [
  { id: "organic", label: "🌿 100% Certified Organic", desc: "No synthetic chemicals, bio-compost fertilizers" },
  { id: "conventional", label: "🚜 Modern / Conventional", desc: "Standard mechanization & balanced inputs" },
  { id: "mixed", label: "🌾 Integrated / Mixed Farming", desc: "Crops combined with horticulture or dairy" },
  { id: "other", label: "✨ Natural / ZBNF", desc: "Zero-budget natural farming practices" },
];

const IRRIGATION_TYPES: { id: IrrigationType; label: string; icon: string }[] = [
  { id: "drip", label: "Drip Irrigation", icon: "💧" },
  { id: "sprinkler", label: "Sprinkler System", icon: "🚿" },
  { id: "canal", label: "Canal / River", icon: "🌊" },
  { id: "borewell", label: "Borewell / Tube Well", icon: "🚰" },
  { id: "rain-fed", label: "Rain-fed Only", icon: "🌧️" },
  { id: "other", label: "Other System", icon: "⚙️" },
];

const SOIL_TYPES: { id: SoilType; label: string; desc: string }[] = [
  { id: "black", label: "Black Soil (Regur)", desc: "Rich in clay, ideal for cotton, onions & pulses" },
  { id: "alluvial", label: "Alluvial Soil", desc: "High fertility, river basin silt, great for wheat & rice" },
  { id: "red", label: "Red & Yellow Soil", desc: "Rich in iron, permeable, suited for coarse grains" },
  { id: "loamy", label: "Loamy Soil", desc: "Balanced sand and clay, superior moisture retention" },
  { id: "clay", label: "Clay Soil", desc: "Heavy water retention, suited for wetland paddy" },
  { id: "sandy", label: "Sandy Loam", desc: "Quick-draining, ideal for root crops and vegetables" },
  { id: "other", label: "Laterite / Other", desc: "Specialized local soil characteristics" },
];

const AVATAR_OPTIONS = ["👨🏽‍🌾", "👩🏽‍🌾", "👨🏾‍🌾", "👩🏾‍🌾", "🧑🏽‍🌾", "🚜", "🌾", "🌻"];

type Step = 1 | 2 | 3;

export default function FarmerProfileView({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const { farmerProfile, setFarmerProfile } = useAgri();

  const [activeStep, setActiveStep] = useState<Step>(1);
  const [name, setName] = useState(farmerProfile?.name ?? "Rajesh Kumar");
  const [avatar, setAvatar] = useState(farmerProfile?.avatar ?? "👨🏽‍🌾");
  const [phone, setPhone] = useState(farmerProfile?.phone ?? "9876543210");
  const [email, setEmail] = useState(farmerProfile?.email ?? "rajesh.kumar@agri.in");
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
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Live profile preview
  const currentDraftProfile: FarmerProfile = useMemo(
    () => ({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      state,
      district: district.trim(),
      location: location.trim(),
      farmSizeAcres: Number(farmSizeAcres) || 0,
      farmingType,
      irrigationType,
      soilType,
      avatar,
    }),
    [
      name,
      phone,
      email,
      state,
      district,
      location,
      farmSizeAcres,
      farmingType,
      irrigationType,
      soilType,
      avatar,
    ],
  );

  const completionPercent = useMemo(
    () => getProfileCompletion(currentDraftProfile),
    [currentDraftProfile],
  );

  function validateStep(step: Step): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1 || step === 3) {
      if (!name.trim()) newErrors.name = "Farmer name is required";
      if (!phone.trim() || !/^\d{10}$/.test(phone.trim().replace(/\D/g, ""))) {
        newErrors.phone = "Please enter a valid 10-digit mobile number";
      }
    }

    if (step === 2 || step === 3) {
      if (!state) newErrors.state = "Please select your state";
      if (!district.trim()) newErrors.district = "District name is required";
    }

    if (step === 3) {
      if (!farmSizeAcres || Number(farmSizeAcres) <= 0) {
        newErrors.farmSizeAcres = "Farm size must be greater than 0 acres";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(activeStep)) return;
    if (activeStep < 3) {
      setActiveStep((s) => (s + 1) as Step);
    }
  }

  function handlePrev() {
    if (activeStep > 1) {
      setActiveStep((s) => (s - 1) as Step);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSaving(true);
    setTimeout(() => {
      setFarmerProfile(currentDraftProfile);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSaved) onSaved();
      }, 1400);
    }, 700);
  }

  return (
    <div className="farmer-profile-container">
      {/* Header */}
      <header className="profile-hero-header">
        <div className="profile-hero-header__left">
          <span className="profile-hero-header__tag">FARM SETUP & ONBOARDING</span>
          <h1>Farmer Profile & Farm Setup</h1>
          <p>
            Configure your farm's agronomic characteristics, soil classification, and water resources
            to unlock precision yield estimates and live APMC market intelligence.
          </p>
        </div>

        {/* Profile Completion Card */}
        <div className="profile-completion-card">
          <div className="profile-completion-card__top">
            <span className="profile-completion-card__avatar">{avatar}</span>
            <div>
              <strong>{name || "Farmer"}</strong>
              <small>{district ? `${district}, ${state}` : "Location pending"}</small>
            </div>
            <span className="profile-completion-card__percent">{completionPercent}%</span>
          </div>
          <div className="profile-completion-card__bar">
            <div
              className="profile-completion-card__fill"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="profile-completion-card__hint">
            {completionPercent === 100
              ? "✓ Profile 100% complete! Yield algorithms fully calibrated."
              : "Complete all fields to calibrate market & yield intelligence."}
          </span>
        </div>
      </header>

      {/* Success Banner */}
      {showSuccess && (
        <div className="profile-toast-success" role="alert">
          <span className="icon">✓</span>
          <div>
            <strong>Farm Profile Saved Successfully!</strong>
            <p>Dashboard statistics, plot allocations, and mandi benchmarks have updated.</p>
          </div>
        </div>
      )}

      {/* Step Stepper Navigation */}
      <div className="profile-stepper" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeStep === 1}
          className={`profile-stepper__step ${activeStep === 1 ? "is-active" : ""} ${
            activeStep > 1 ? "is-complete" : ""
          }`}
          onClick={() => setActiveStep(1)}
        >
          <span className="step-number">1</span>
          <div className="step-labels">
            <span className="step-title">Farmer Identity</span>
            <span className="step-sub">Name, phone & avatar</span>
          </div>
        </button>

        <div className="profile-stepper__divider" />

        <button
          type="button"
          role="tab"
          aria-selected={activeStep === 2}
          className={`profile-stepper__step ${activeStep === 2 ? "is-active" : ""} ${
            activeStep > 2 ? "is-complete" : ""
          }`}
          onClick={() => {
            if (validateStep(1)) setActiveStep(2);
          }}
        >
          <span className="step-number">2</span>
          <div className="step-labels">
            <span className="step-title">Farm Location</span>
            <span className="step-sub">State, district & village</span>
          </div>
        </button>

        <div className="profile-stepper__divider" />

        <button
          type="button"
          role="tab"
          aria-selected={activeStep === 3}
          className={`profile-stepper__step ${activeStep === 3 ? "is-active" : ""}`}
          onClick={() => {
            if (validateStep(2)) setActiveStep(3);
          }}
        >
          <span className="step-number">3</span>
          <div className="step-labels">
            <span className="step-title">Agronomics</span>
            <span className="step-sub">Land size, soil & irrigation</span>
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="profile-form">
        {/* STEP 1: Farmer Identity */}
        {activeStep === 1 && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>👨‍🌾 Step 1: Personal & Contact Information</h2>
              <p>Identify yourself so local APMC buyers and farm advisors know who you are.</p>
            </div>

            {/* Avatar Picker */}
            <div className="avatar-picker-section">
              <label>Choose Farmer Profile Avatar</label>
              <div className="avatar-picker-grid">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    className={`avatar-option-btn ${avatar === av ? "is-selected" : ""}`}
                    onClick={() => setAvatar(av)}
                    aria-label={`Select avatar ${av}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-field">
                <label htmlFor="farmerName">
                  Farmer Full Name <span className="required">*</span>
                </label>
                <input
                  id="farmerName"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={errors.name ? "has-error" : ""}
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="farmerPhone">
                  Mobile Number (10 Digits) <span className="required">*</span>
                </label>
                <input
                  id="farmerPhone"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  className={errors.phone ? "has-error" : ""}
                  placeholder="e.g. 9876543210"
                  required
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="farmerEmail">Email Address (Optional)</label>
                <input
                  id="farmerEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh.kumar@agri.in"
                />
                <p className="field-hint">Used for PDF crop receipts and weekly price digest</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Farm Location */}
        {activeStep === 2 && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>📍 Step 2: Farm Geography & District Location</h2>
              <p>
                Pinpointing your state and district allows AgriSmart to match the closest APMC
                mandis and hyper-local weather forecast models.
              </p>
            </div>

            <div className="form-grid-3">
              <div className="form-field">
                <label htmlFor="stateSelect">
                  State / Union Territory <span className="required">*</span>
                </label>
                <select
                  id="stateSelect"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
                  }}
                  className={errors.state ? "has-error" : ""}
                  required
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
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
                  }}
                  className={errors.district ? "has-error" : ""}
                  placeholder="e.g. Nashik, Ludhiana, Guntur"
                  required
                />
                {errors.district && <p className="field-error">{errors.district}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="locationInput">Village / Taluka / Block</label>
                <input
                  id="locationInput"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dindori Taluka, Pimpalgaon"
                />
                <p className="field-hint">Helps calculate exact distance to buyers</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Agronomic Characteristics */}
        {activeStep === 3 && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>🌱 Step 3: Farm Size & Soil Agronomics</h2>
              <p>
                Configure land size and agronomic conditions to accurately estimate plot yield and
                soil water management.
              </p>
            </div>

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
                  onChange={(e) => {
                    setFarmSizeAcres(e.target.value);
                    if (errors.farmSizeAcres)
                      setErrors((prev) => ({ ...prev, farmSizeAcres: "" }));
                  }}
                  className={errors.farmSizeAcres ? "has-error" : ""}
                  required
                />
                {errors.farmSizeAcres && (
                  <p className="field-error">{errors.farmSizeAcres}</p>
                )}
                <p className="field-hint">Total holding area including uncultivated buffer</p>
              </div>

              <div className="form-field">
                <label htmlFor="farmingTypeSelect">Farming Methodology</label>
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
                <p className="field-hint">
                  {FARMING_TYPES.find((f) => f.id === farmingType)?.desc}
                </p>
              </div>
            </div>

            {/* Irrigation Type Grid */}
            <div className="agronomic-selector-section">
              <label>Irrigation Water Source & Infrastructure</label>
              <div className="options-pill-grid">
                {IRRIGATION_TYPES.map((irr) => (
                  <button
                    key={irr.id}
                    type="button"
                    className={`option-pill-btn ${
                      irrigationType === irr.id ? "is-selected" : ""
                    }`}
                    onClick={() => setIrrigationType(irr.id)}
                  >
                    <span className="icon">{irr.icon}</span>
                    <span className="label">{irr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Soil Type Cards */}
            <div className="agronomic-selector-section" style={{ marginTop: 24 }}>
              <label>Soil Type & Field Composition</label>
              <div className="soil-cards-grid">
                {SOIL_TYPES.map((soil) => (
                  <div
                    key={soil.id}
                    className={`soil-card ${soilType === soil.id ? "is-selected" : ""}`}
                    onClick={() => setSoilType(soil.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSoilType(soil.id);
                    }}
                  >
                    <div className="soil-card__radio">
                      <span className="radio-dot" />
                    </div>
                    <div>
                      <strong>{soil.label}</strong>
                      <p>{soil.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="profile-form-footer">
          <div className="profile-form-footer__left">
            {activeStep > 1 && (
              <button type="button" className="ghost-btn" onClick={handlePrev}>
                ← Previous Step
              </button>
            )}
          </div>

          <div className="profile-form-footer__right">
            {activeStep < 3 ? (
              <button type="button" className="primary-btn" onClick={handleNext}>
                Continue to Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="primary-btn save-btn"
                disabled={isSaving}
              >
                {isSaving ? "💾 Saving Farm Profile..." : "💾 Save Farm Profile"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
