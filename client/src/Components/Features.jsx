import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: 'fa-award',
    title: 'Top Brands',
    desc: 'Curated selection from 100+ premium brands — only the best make it to our shelves.',
    delay: '.1s',
  },
  {
    icon: 'fa-certificate',
    title: '100% Original Products',
    desc: 'Every item is authenticity-verified. Shop with complete confidence, every time.',
    delay: '.2s',
  },
  {
    icon: 'fa-rotate-left',
    title: '7-Day Refund Policy',
    desc: 'Not satisfied? Return it within 7 days, no questions asked. Your peace of mind matters.',
    delay: '.3s',
  },
  {
    icon: 'fa-headset',
    title: '24/7 Customer Support',
    desc: 'Our dedicated team is available round the clock to assist you whenever you need.',
    delay: '.4s',
  },
  {
    icon: 'fa-users',
    title: '100,000+ Happy Customers',
    desc: 'Join a growing community of satisfied shoppers who trust ShopKaro every day.',
    delay: '.5s',
  },
  {
    icon: 'fa-truck-fast',
    title: 'Fastest Delivery',
    desc: 'Lightning-fast shipping straight to your door — because great products deserve great service.',
    delay: '.6s',
  },
]

export default function Features() {
  return (
    <>
      <section className="features-section">
        <div className="container">

          {/* Heading */}
          <div className="text-center mb-5 wow fadeIn" data-wow-delay=".2s">
            <div className="features-eyebrow">Our Features</div>
            <h2 className="features-heading">
              Best in <em>Industry</em> Features
            </h2>
            <p className="features-sub">
              Everything you need for a premium shopping experience — built in from the ground up.
            </p>
          </div>

          {/* Grid */}
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={f.title} className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay={f.delay}>
                <div className="feature-card">
                  <span className="feature-number">{String(i + 1).padStart(2, '0')}</span>
                  <div className="feature-card-inner">
                    <div className="feature-icon-wrap">
                      <i className={`fa ${f.icon}`} />
                    </div>
                    <h4 className="feature-title">{f.title}</h4>
                    <p className="feature-desc">{f.desc}</p>
                    <Link to="/feature-detail"
                    state={{ title: f.title }}
                    className="feature-link">
                      Read More 
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}