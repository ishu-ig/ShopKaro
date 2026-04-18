import React from 'react'
import { Link } from 'react-router-dom'

export default function About({ title }) {
  return (
    <>
      <section className="about-section">
        <div className="container">
          <div className="row g-5 align-items-center">

            {/* Images */}
            <div className="col-lg-5 col-md-12 wow fadeIn" data-wow-delay=".3s">
              <div className="about-image-stack">
                <img src="img/about-1.jpg" className="about-img-main" alt="ShopKaro store" />
                <img src="img/banner8.jpg"  className="about-img-secondary" alt="ShopKaro products" />
                <div className="about-badge">
                  <span className="about-badge-num">5+</span>
                  <span className="about-badge-text">Years of Trust</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="col-lg-7 col-md-12 wow fadeIn" data-wow-delay=".5s">
              <span className="about-eyebrow">About Us</span>
              <h2 className="about-heading">
                Crafting <em>Premium</em> Shopping<br />Experiences
              </h2>
              <div className="about-divider" />

              <p className="about-body">
                At ShopKaro, we believe shopping should feel like an experience — not just a transaction.
                Our curated selection of top-tier brands, seamless delivery, and world-class customer support
                make us the destination of choice for discerning shoppers.
              </p>
              <p className="about-body">
                From fashion to electronics, home essentials to luxury accessories — every product is handpicked
                to ensure quality, authenticity, and value for every customer.
              </p>

              <div className="about-features">
                {['100+ Premium Brands', 'Easy 7-Day Refund', '24/7 Customer Support', '100K+ Happy Customers'].map(f => (
                  <div key={f} className="about-feature">
                    <div className="about-feature-dot" />
                    {f}
                  </div>
                ))}
              </div>

              {title && (
                <Link to="/about" className="btn-about">
                  Discover Our Story
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}