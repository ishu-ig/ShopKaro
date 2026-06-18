import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { getTestimonial } from "../Redux/ActionCreartors/TestimonialActionCreators";

const trustItems = [
  { icon: 'fa-headset',         title: '24/7 Support',          desc: 'Always here when you need us, day or night.' },
  { icon: 'fa-shield-check',    title: '100% Guarantee',        desc: 'Authentic products with quality assurance.' },
  { icon: 'fa-undo-alt',        title: 'Easy Refunds',          desc: '7-day hassle-free return policy.' },
  { icon: 'fa-tag',             title: 'Best Prices',           desc: 'Competitive rates across all categories.' },
]

export default function Testimonial() {
  const dispatch = useDispatch();
  const TestimonialStateData = useSelector(state => state.TestimonialStateData);

  useEffect(() => {
    dispatch(getTestimonial());
  }, [dispatch]);

  const active = TestimonialStateData?.filter(x => x.active) || [];

  return (
    <>
      <section className="testimonial-section">
        <div className="container">

          {/* Heading */}
          <div className="text-center mb-5 wow fadeIn" data-wow-delay=".3s">
            <div className="testimonial-eyebrow">Testimonials</div>
            <h2 className="testimonial-heading">
              What Our <em>Clients</em> Say
            </h2>
            <p className="testimonial-sub">
              Real stories from real customers. We're proud of the trust our community has placed in us.
            </p>
          </div>

          {/* Swiper */}
          {active.length > 0 ? (
            <Swiper
              grabCursor
              loop
              centeredSlides
              effect="coverflow"
              coverflowEffect={{ rotate: 20, stretch: 0, depth: 80, modifier: 1, slideShadows: false }}
              modules={[EffectCoverflow, Pagination, Autoplay]}
              pagination={{ clickable: true, el: '.swiper-pagination' }}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              breakpoints={{
                0:   { slidesPerView: 1 },
                640: { slidesPerView: 1.5, spaceBetween: 20 },
                768: { slidesPerView: 2,   spaceBetween: 24 },
                1024:{ slidesPerView: 3,   spaceBetween: 28 },
              }}
            >
              {active.map(item => (
                <SwiperSlide key={item._id}>
                  <div className="t-card">
                    <div className="t-quote-icon">"</div>
                    <div className="t-stars">
                      {Array(5).fill(null).map((_, i) => (
                        <i key={i} className="fas fa-star" />
                      ))}
                    </div>
                    <p className="t-message">{item.message}</p>
                    <div className="t-profile">
                      <img
                        src={item.pic}
                        className="t-avatar"
                        alt={item.name}
                      />
                      <div>
                        <div className="t-name">{item.name}</div>
                        <div className="t-tag">Verified Customer</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              <div className="swiper-pagination" />
            </Swiper>
          ) : (
            <p className="text-center text-muted py-5">No testimonials yet.</p>
          )}

          {/* Trust grid */}
          <div className="trust-grid">
            {trustItems.map(t => (
              <div key={t.title} className="trust-item wow fadeIn" data-wow-delay=".2s">
                <div className="trust-icon"><i className={`fa ${t.icon}`} /></div>
                <div>
                  <div className="trust-title">{t.title}</div>
                  <p className="trust-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="testimonial-cta wow fadeIn" data-wow-delay=".3s">
            <h3 className="testimonial-cta-title">Ready to Experience <em>Excellence</em>?</h3>
            <p className="testimonial-cta-sub">Join thousands of happy customers who trust ShopKaro.</p>
            <a href="/contactus" className="btn-cta">
              Get in Touch
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>
      </section>
    </>
  );
}