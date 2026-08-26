"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Button from "./Button";
import "./Navbar.scss";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard?view=farmer-dashboard" },
  { label: "My Crops", href: "/dashboard?view=crops" },
  { label: "Market Intel", href: "/dashboard?view=markets" },
  { label: "Profit Advisor", href: "/dashboard?view=profit" },
  { label: "Farm Setup", href: "/dashboard?view=profile" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__container">
        <a href="/" className="navbar__brand" aria-label="AgriSmart Home">
          <span className="navbar__logo">🌾</span>
          <span className="navbar__brand-text">
            <strong>Agri</strong>
            <span>Smart</span>
          </span>
        </a>

        <nav className="navbar__desktop-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} className="navbar__link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <Button
            variant="outline"
            className="navbar__login"
            onClick={() => {
              window.location.href = "/dashboard?view=profile";
            }}
          >
            Farm Setup
          </Button>

          <Button
            onClick={() => {
              window.location.href = "/dashboard?view=farmer-dashboard";
            }}
          >
            Open Dashboard →
          </Button>
        </div>

        <button
          type="button"
          className="navbar__menu-button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="navbar__mobile-menu">
          <nav aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="navbar__mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="navbar__mobile-actions">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                window.location.href = "/dashboard?view=profile";
              }}
            >
              Farm Setup & Profile
            </Button>

            <Button
              fullWidth
              onClick={() => {
                window.location.href = "/dashboard?view=farmer-dashboard";
              }}
            >
              Enter Farmer Dashboard
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}