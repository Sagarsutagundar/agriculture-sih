"use client";
import Button from "@/components/common/Button";
import "./Hero.scss";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            AI-powered agricultural intelligence
          </div>

          <h1 className="hero__title">
            Smarter farming.
            <span>Better decisions.</span>
            Better returns.
          </h1>

          <p className="hero__description">
            Make confident decisions about your crops, markets, and earnings
            with intelligent insights built for farmers.
          </p>

          <div className="hero__actions">
          <Button onClick={() => (window.location.href = "/dashboard")}>
  Get Started
</Button>
            <Button variant="outline">Explore How It Works</Button>
          </div>

          <div className="hero__trust">
            <div className="hero__avatars">
              <span>👨🏽‍🌾</span>
              <span>👩🏽‍🌾</span>
              <span>👨🏾‍🌾</span>
            </div>

            <div>
              <strong>Built for farmers</strong>
              <p>Simple insights. Smarter choices.</p>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__glow" />

          <div className="hero__farm-card">
            <div className="hero__farm-icon">🌾</div>
            <div>
              <span>Today's insight</span>
              <strong>Your crop is ready for market</strong>
            </div>
          </div>

          <div className="hero__profit-card">
            <span>Estimated net profit</span>
            <strong>₹48,620</strong>
            <small>↑ 12.8% better option</small>
          </div>

          <div className="hero__market-card">
            <span>Best market</span>
            <strong>APMC Market</strong>
            <small>8.4 km away</small>
          </div>

          <div className="hero__crop">🌱</div>
        </div>
      </div>
    </section>
  );
}