import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";

export default function ProductSlider({ title, data }) {
  const [slidesPerView, setSlidesPerView] = useState(
    window.innerWidth < 576 ? 1 : window.innerWidth < 768 ? 1.5 : window.innerWidth < 1024 ? 2.5 : 4
  );

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      setSlidesPerView(w < 576 ? 1 : w < 768 ? 1.5 : w < 1024 ? 2.5 : 4);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!data?.length) return null;

  return (
    <>
      <section className="ps-section">
        <div className="container">
          <div className="ps-header">
            <div>
              <div className="ps-eyebrow">Explore</div>
              <h2 className="ps-heading">{title || <>Latest <em>Products</em></>}</h2>
            </div>
            <Link to="/shop" className="ps-view-all">
              View All
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div style={{ position: 'relative', paddingTop: '52px' }}>
            <Swiper
              className="ps-swiper"
              slidesPerView={slidesPerView}
              spaceBetween={20}
              loop={true}
              modules={[Autoplay, Navigation]}
              navigation={true}
              autoplay={{ delay: 2800, disableOnInteraction: false }}
              grabCursor={true}
            >
              {data.map((item) => (
                <SwiperSlide key={item._id}>
                  <div className="ps-card">
                    <div className="ps-img-wrap">
                      <img
                        src={item.pic[0]}
                        alt={item.name}
                        className="ps-img"
                      />
                      {item.discount > 0 && (
                        <span className="ps-badge">{item.discount}% Off</span>
                      )}
                      <span className="ps-rating">
                        ★ {item.rating || '4.5'}
                      </span>
                      <div className="ps-overlay">
                        <Link to={`/cart/${item._id}`} className="ps-overlay-btn primary">
                          <i className="fa fa-shopping-cart" style={{ fontSize: 12 }} />
                          Add to Cart
                        </Link>
                        <Link to={`/product/${item._id}`} className="ps-overlay-btn secondary">
                          View Details
                        </Link>
                      </div>
                    </div>
                    <div className="ps-body">
                      <h5 className="ps-name">{item.name}</h5>
                      <div className="ps-pricing">
                        <span className="ps-final">₹{item.finalPrice?.toLocaleString()}</span>
                        {item.basePrice > item.finalPrice && (
                          <span className="ps-original">₹{item.basePrice?.toLocaleString()}</span>
                        )}
                        {item.discount > 0 && (
                          <span className="ps-discount">Save {item.discount}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}