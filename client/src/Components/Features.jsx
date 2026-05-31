import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Loop } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const features = [
  {
    icon: 'fa-award',
    title: 'Top Brands',
    desc: 'Curated selection from 100+ premium brands — only the best make it to our shelves.',
  },
  {
    icon: 'fa-certificate',
    title: '100% Original Products',
    desc: 'Every item is authenticity-verified. Shop with complete confidence, every time.',
  },
  {
    icon: 'fa-rotate-left',
    title: '7-Day Refund Policy',
    desc: 'Not satisfied? Return it within 7 days, no questions asked. Your peace of mind matters.',
  },
  {
    icon: 'fa-headset',
    title: '24/7 Customer Support',
    desc: 'Our dedicated team is available round the clock to assist you whenever you need.',
  },
  {
    icon: 'fa-users',
    title: '100,000+ Happy Customers',
    desc: 'Join a growing community of satisfied shoppers who trust ShopKaro every day.',
  },
  {
    icon: 'fa-truck-fast',
    title: 'Fastest Delivery',
    desc: 'Lightning-fast shipping straight to your door — because great products deserve great service.',
  },
]

export default function Features() {
  return (
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

        {/* Swiper Slider */}
        <Swiper
          modules={[Navigation, Pagination]}
          loop={true}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          pagination={{ clickable: true }}
        >
          {features.map((f, i) => (
            <SwiperSlide key={f.title}>
              <div className="feature-card">
                <span className="feature-number">{String(i + 1).padStart(2, '0')}</span>
                <div className="feature-card-inner">
                  <div className="feature-icon-wrap">
                    <i className={`fa ${f.icon}`} />
                  </div>
                  <h4 className="feature-title">{f.title}</h4>
                  <p className="feature-desc">{f.desc}</p>
                  <Link
                    to="/feature-detail"
                    state={{ title: f.title }}
                    className="feature-link"
                  >
                    Read More
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  )
}