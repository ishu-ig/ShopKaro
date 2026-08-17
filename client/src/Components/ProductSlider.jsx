import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";

// Renders a variant thumbnail, falling back to a "No image" placeholder
// when the pic value is missing OR when the URL fails to actually load
// (e.g. a deleted/expired Cloudinary asset). Prevents blank white boxes.
function ProductThumb({ src, alt }) {
  const [errored, setErrored] = useState(false);
  const hasValidSrc = typeof src === "string" && src.trim() !== "" && !errored;

  if (!hasValidSrc) {
    if (process.env.NODE_ENV !== "production" && !src) {
      // eslint-disable-next-line no-console
      console.warn(`[ProductSlider] Missing variant.pic[0] for product: ${alt}`);
    }
    return (
      <div className="ps-img ps-img-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="#c9a84c" strokeWidth="1.5" />
          <circle cx="8" cy="10" r="1.5" fill="#c9a84c" />
          <path
            d="M2 17l5-5 4 4 3-3 8 8"
            stroke="#c9a84c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="ps-img"
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
}

export default function ProductSlider({ title, data }) {
  if (!data?.length) return null;

  return (
    <>
      <style>{`
        .ps-section {
          padding: 56px 0;
        }

        .ps-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .ps-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 6px;
        }

        .ps-heading {
          font-family: "Playfair Display", serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3.2vw, 2.3rem);
          color: #0d1b2a;
          margin: 0;
        }

        .ps-heading em {
          font-style: italic;
          color: #c9a84c;
        }

        .ps-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0d1b2a;
          text-decoration: none;
          border-bottom: 1.5px solid #c9a84c;
          padding-bottom: 3px;
          white-space: nowrap;
          transition: color 0.2s ease, gap 0.2s ease;
        }

        .ps-view-all:hover {
          color: #c9a84c;
          gap: 9px;
        }

        .ps-swiper-wrap {
          position: relative;
          padding: 0 4px 12px;
        }

        .ps-card,
        .ps-card * {
          box-sizing: border-box;
        }

        .ps-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(28,16,9,0.07);
          box-shadow: 0 2px 10px rgba(28,16,9,0.05);
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          height: 100%;
        }

        .ps-card:hover {
          box-shadow: 0 14px 30px rgba(28,16,9,0.12);
          transform: translateY(-3px);
        }

        .ps-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f4efe9;
        }

        .ps-img-wrap a {
          display: block;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .ps-img {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s ease;
        }

        .ps-card:hover .ps-img {
          transform: scale(1.06);
        }

        /* Placeholder shown when a variant has no image or the image URL fails to load */
        .ps-img-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #f4efe9;
          color: #a89b8f;
        }

        .ps-img-placeholder span {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .ps-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #c9a84c, #b38b29);
          color: #070d14;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 4px 9px;
          border-radius: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          pointer-events: none;
        }

        .ps-rating {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(13,27,42,0.85);
          color: #e8c873;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 999px;
          z-index: 2;
          backdrop-filter: blur(4px);
          pointer-events: none;
        }

        /* Desktop hover overlay */
        .ps-overlay {
          position: absolute;
          inset: auto 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 12px 12px;
          background: linear-gradient(to top, rgba(13,27,42,0.92), transparent);
          transform: translateY(12px);
          opacity: 0;
          transition: opacity 0.25s ease, transform 0.25s ease;
          z-index: 3;
          pointer-events: none;
        }

        .ps-card:hover .ps-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .ps-overlay-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          pointer-events: auto;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .ps-overlay-btn:hover {
          opacity: 0.95;
          transform: scale(1.02);
        }

        .ps-overlay-btn.primary {
          background: linear-gradient(135deg, #c9a84c, #e8c873);
          color: #070d14;
        }

        .ps-overlay-btn.secondary {
          background: rgba(255,255,255,0.95);
          color: #0d1b2a;
        }

        .ps-body {
          padding: 14px 14px 16px;
        }

        .ps-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1C1009;
          margin: 0 0 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .ps-pricing {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ps-final {
          font-size: 1rem;
          font-weight: 800;
          color: #1C1009;
        }

        .ps-original {
          font-size: 0.8rem;
          color: #a89b8f;
          text-decoration: line-through;
        }

        .ps-discount {
          font-size: 0.7rem;
          font-weight: 700;
          color: #059669;
          background: rgba(5,150,105,0.09);
          padding: 2px 7px;
          border-radius: 999px;
        }

        /* Mobile-only quick action, since hover overlays don't work on touch */
        .ps-mobile-btn {
          display: none;
        }

        /* Swiper nav arrows */
        .ps-swiper-wrap .swiper-button-next,
        .ps-swiper-wrap .swiper-button-prev {
          width: 38px;
          height: 38px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(28,16,9,0.15);
          color: #1C1009;
          top: 40%;
        }

        .ps-swiper-wrap .swiper-button-next::after,
        .ps-swiper-wrap .swiper-button-prev::after {
          font-size: 13px;
          font-weight: 900;
        }

        .ps-swiper-wrap .swiper-button-disabled {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .ps-section {
            padding: 32px 0;
          }

          .ps-header {
            margin-bottom: 18px;
          }

          .ps-body {
            padding: 10px 10px 14px;
          }

          .ps-name {
            font-size: 0.82rem;
            margin-bottom: 4px;
          }

          .ps-final {
            font-size: 0.94rem;
          }

          .ps-overlay {
            display: none;
          }

          .ps-mobile-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            margin-top: 10px;
            padding: 7px 10px;
            background: linear-gradient(135deg, #c9a84c, #e8c873);
            color: #070d14;
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            border-radius: 50px;
            text-decoration: none;
            box-shadow: 0 3px 10px rgba(201,168,76,0.25);
            transition: all 0.2s ease;
          }

          .ps-mobile-btn:active {
            transform: scale(0.97);
            background: #c9a84c;
          }

          .ps-swiper-wrap .swiper-button-next,
          .ps-swiper-wrap .swiper-button-prev {
            width: 28px;
            height: 28px;
          }

          .ps-swiper-wrap .swiper-button-next::after,
          .ps-swiper-wrap .swiper-button-prev::after {
            font-size: 9px;
          }
        }

        @media (max-width: 480px) {
          .ps-swiper-wrap .swiper-button-next,
          .ps-swiper-wrap .swiper-button-prev {
            display: none;
          }
        }
      `}</style>

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

          <div className="ps-swiper-wrap">
            <Swiper
              className="ps-swiper"
              spaceBetween={10}
              loop={true}
              modules={[Autoplay, Navigation]}
              navigation={true}
              autoplay={{ delay: 2800, disableOnInteraction: false }}
              grabCursor={true}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 10 },
                480: { slidesPerView: 2.2, spaceBetween: 12 },
                768: { slidesPerView: 3, spaceBetween: 16 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 4, spaceBetween: 20 },
              }}
            >
              {data.map((item) => {
                const variant = item?.variants?.[0] || {};
                const thumb = variant.pic?.[0] || item?.variants?.find(v => v.pic?.[0])?.pic?.[0] || (typeof item?.pic === 'string' ? item.pic : item?.pic?.[0]);
                const basePrice = variant.price ?? variant.finalPrice;
                const finalPrice = variant.finalPrice;

                return (
                  <SwiperSlide key={item._id}>
                    <div className="ps-card">
                      <div className="ps-img-wrap">
                        <Link to={`/product/${item._id}`}>
                          <ProductThumb src={thumb} alt={item.name} />
                        </Link>
                        {item.discount > 0 && (
                          <span className="ps-badge">{item.discount}% Off</span>
                        )}
                        <span className="ps-rating">
                          ★ {item.rating || "4.5"}
                        </span>
                        <div className="ps-overlay">
                          <Link to={`/product/${item._id}`} className="ps-overlay-btn primary text-center py-2">
                            View Details <i className="fa fa-arrow-right ms-1" style={{ fontSize: 11 }} />
                          </Link>
                        </div>
                      </div>
                      <div className="ps-body">
                        <h5 className="ps-name">
                          <Link to={`/product/${item._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {item.name}
                          </Link>
                        </h5>
                        <div className="ps-pricing">
                          <span className="ps-final">₹{finalPrice?.toLocaleString()}</span>
                          {basePrice > finalPrice && (
                            <span className="ps-original">₹{basePrice?.toLocaleString()}</span>
                          )}
                          {item.discount > 0 && (
                            <span className="ps-discount">Save {item.discount}%</span>
                          )}
                        </div>
                        <Link to={`/product/${item._id}`} className="ps-mobile-btn">
                          <span>View Details</span>
                          <i className="fa fa-arrow-right" style={{ fontSize: 10 }} />
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}